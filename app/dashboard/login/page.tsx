import LoginForm from "@/components/dashboard/LoginForm";

export const metadata = { title: "Admin Login" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <LoginForm />
    </div>
  );
}
