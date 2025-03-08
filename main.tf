provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "app_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_support = true
  enable_dns_hostnames = true
}

resource "aws_subnet" "app_subnet_a" {
  vpc_id            = aws_vpc.app_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"
}

resource "aws_subnet" "app_subnet_b" {
  vpc_id            = aws_vpc.app_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1b"
}

resource "aws_internet_gateway" "app_igw" {
  vpc_id = aws_vpc.app_vpc.id
}

resource "aws_route_table" "app_route_table" {
  vpc_id = aws_vpc.app_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.app_igw.id
  }
}

resource "aws_route_table_association" "app_route_assoc_a" {
  subnet_id      = aws_subnet.app_subnet_a.id
  route_table_id = aws_route_table.app_route_table.id
}

resource "aws_route_table_association" "app_route_assoc_b" {
  subnet_id      = aws_subnet.app_subnet_b.id
  route_table_id = aws_route_table.app_route_table.id
}

resource "aws_security_group" "app_sg" {
  vpc_id = aws_vpc.app_vpc.id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "database" {
  allocated_storage    = 20
  engine              = "postgres"
  engine_version      = "13"
  instance_class      = "db.t3.micro"
  username           = "dbadmin"
  password           = "yourpassword"
  publicly_accessible = false
  skip_final_snapshot = true
  depends_on          = [aws_subnet.app_subnet_a, aws_subnet.app_subnet_b]
}

resource "aws_instance" "app_server_a" {
  ami = "ami-09e67e426f25ce0d7"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.app_subnet_a.id
  security_groups = [aws_security_group.app_sg.id]
  user_data = <<-EOF
              sudo yum update -y
              sudo yum install -y docker
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo docker run -d -p 80:80 your-docker-image-url
              EOF
  tags = {
    Name = "AppServerA"
  }
  depends_on = [aws_db_instance.database]
}

resource "aws_instance" "app_server_b" {
  ami = "ami-09e67e426f25ce0d7"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.app_subnet_b.id
  security_groups = [aws_security_group.app_sg.id]
  user_data = <<-EOF
              sudo yum update -y
              sudo yum install -y docker
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo docker run -d -p 80:80 your-docker-image-url
              EOF
  tags = {
    Name = "AppServerB"
  }
  depends_on = [aws_db_instance.database]
}

resource "aws_lb" "app_load_balancer" {
  name               = "app-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.app_sg.id]
  subnets            = [aws_subnet.app_subnet_a.id, aws_subnet.app_subnet_b.id]
  depends_on         = [aws_instance.app_server_a, aws_instance.app_server_b]
}

output "load_balancer_dns" {
  value = aws_lb.app_load_balancer.dns_name
}
