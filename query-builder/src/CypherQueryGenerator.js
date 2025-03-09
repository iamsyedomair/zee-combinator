import { useState } from "react";
import { Input } from "./components/ui/Input";
import { Button } from "./components/ui/Button";
import { Card, CardContent } from "./components/ui/Card";

const queryMap = {
  "who liked post": "MATCH (u:User)-[:LIKED]->(p:Post {id: '101'}) RETURN u.name;",
  "most popular post": "MATCH (p:Post)<-[:LIKED]-(u:User) RETURN p.content AS post, COUNT(u) AS like_count ORDER BY like_count DESC LIMIT 1;",
  "mutual follows": "MATCH (u1:User)-[:FOLLOWS]->(u2:User), (u2)-[:FOLLOWS]->(u1) RETURN u1.name AS user1, u2.name AS user2;",
  "which ec2 instances are public": "MATCH (ec2:EC2)-[:EXPOSED_TO_INTERNET]->(r:Risk) RETURN ec2.id, ec2.ip_address, r.type, r.severity;",
  "which s3 buckets are public": "MATCH (s3:S3Bucket)-[:PUBLICLY_ACCESSIBLE]->(r:Risk) RETURN s3.bucket_name, r.type, r.severity;",
  "which security groups allow unrestricted access": "MATCH (sg:SecurityGroup)-[:UNRESTRICTED_ACCESS]->(r:Risk) RETURN sg.name, r.type, r.severity;",
  "which users posted to a public s3 bucket": "MATCH (u:User)-[:POSTED]->(p:Post), (p)-[:STORED_IN]->(s3:S3Bucket)-[:PUBLICLY_ACCESSIBLE]->(r:Risk) RETURN u.name, p.content, s3.bucket_name, r.type, r.severity;",
  "which iam roles have misconfigured policies": "MATCH (iam:IAMRole)-[:MISCONFIGURED_POLICY]->(r:Risk) RETURN iam.name, r.type, r.severity;",
  "find attack paths from public ec2 to database": "MATCH path = (ec2:EC2)-[:EXPOSED_TO_INTERNET]->(:Risk), (ec2)-[:HOSTS]->(db:RDS) RETURN path;",
  "which users have excessive privileges": "MATCH (u:User)-[:HAS_ROLE]->(iam:IAMRole)-[:MISCONFIGURED_POLICY]->(r:Risk) RETURN u.name, iam.name, r.type, r.severity;",
  "which security risks exist in the infrastructure": "MATCH (r:Risk) RETURN r.type, r.severity, COUNT(*) AS risk_count ORDER BY risk_count DESC;",
  "find users interacting with compromised systems": "MATCH (u:User)-[:ACCESSES]->(ec2:EC2)-[:EXPOSED_TO_INTERNET]->(r:Risk) RETURN u.name, ec2.id, r.type, r.severity;",
  "which users have commented on high-risk posts": "MATCH (u:User)-[:COMMENTED]->(c:Comment)-[:ON]->(p:Post)-[:FLAGGED_AS_RISKY]->(r:Risk) RETURN u.name, p.content, r.type, r.severity;",
  "find users who have suspiciously high access": "MATCH (u:User)-[:HAS_ROLE]->(iam:IAMRole) WITH u, COUNT(iam) AS role_count WHERE role_count > 5 RETURN u.name, role_count;",
  "which ec2 instances have overprivileged roles": "MATCH (ec2:EC2)-[:USES]->(iam:IAMRole)-[:MISCONFIGURED_POLICY]->(r:Risk) RETURN ec2.id, iam.name, r.type, r.severity;",
  "which ec2 instances store data in public s3": "MATCH (ec2:EC2)-[:CONNECTED_TO]->(s3:S3Bucket)-[:PUBLICLY_ACCESSIBLE]->(r:Risk) RETURN ec2.id, s3.bucket_name, r.type, r.severity;"
};


export default function CypherQueryGenerator() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");

  const generateQuery = () => {
    const lowerQuery = query.toLowerCase();
    const matchedQuery = Object.keys(queryMap).find(key => lowerQuery.includes(key));
    setResult(matchedQuery ? queryMap[matchedQuery] : "No matching Cypher query found.");
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <Card>
        <CardContent className="p-4 space-y-4">
          <Input
            type="text"
            placeholder="Enter natural language query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={generateQuery}>Generate Cypher Query</Button>
          {result && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
              <strong>Generated Query:</strong>
              <pre className="mt-2 text-blue-600">{result}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
