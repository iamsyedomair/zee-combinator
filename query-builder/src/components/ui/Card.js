// Card Component
export function Card({ children }) {
  return (
    <div className="border rounded-lg shadow-lg p-4 bg-white">{children}</div>
  );
}

// CardContent Component
export function CardContent({ children }) {
  return <div className="p-4">{children}</div>;
}
