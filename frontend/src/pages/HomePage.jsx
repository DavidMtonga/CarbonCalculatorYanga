import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          UNZA Carbon Calculator Yanga
        </h1>
        <p className="text-lg">
          Calculate and reduce your household energy and cooking footprint
        </p>
      </div>
      <div className="space-x-4">
        <Link to="/login">
          <Button>Login</Button>
        </Link>
        <Link to="/calculator">
          <Button variant="outline">Try Calculator</Button>
        </Link>
        <Link to="/admin/register">
          <Button variant="outline" className="bg-purple-600 hover:bg-purple-700 text-white">
            Admin Registration
          </Button>
        </Link>
      </div>
    </div>
  );
}
