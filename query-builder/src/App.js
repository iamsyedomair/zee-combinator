import logo from './logo.svg';
import './App.css';
import CypherQueryGenerator from "./CypherQueryGenerator";

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <CypherQueryGenerator />
    </div>
  );
}
