import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center mb-8 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-green-600 mb-4">
          UNZA Carbon Calculator Yanga
        </h1>
        <p className="text-base sm:text-lg text-gray-700">
          Calculate and reduce your household energy and cooking footprint with UNZA CCY
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Link to="/login">
          <Button className="w-full sm:w-auto">Login</Button>
        </Link>
        <Link to="/calculator">
          <Button variant="outline" className="w-full sm:w-auto">Try Calculator</Button>
        </Link>
        <Link to="/admin/register">
          <Button variant="outline" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white">
            Admin Registration
          </Button>
        </Link>
      </div>
    </div>
  );
}
