import Header from "../components/layout/Header";
import UserDashboard from "../components/dashboard/UserDashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto p-4">
        <UserDashboard />
      </main>
    </div>
  );
}
