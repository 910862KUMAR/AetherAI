import { Link } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthHeader from "../components/auth/AuthHeader";
import AuthFooter from "../components/auth/AuthFooter";
import LoginForm from "../components/auth/forms/LoginForm";

function Login() {
  return (
    <AuthLayout>
      <AuthHeader
        title="Welcome back"
        description="Sign in to continue to your AetherAI workspace."
      />

      <LoginForm />

      <p className="mt-8 text-center text-sm text-slate-400">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-indigo-400 transition hover:text-indigo-300"
        >
          Create account
        </Link>
      </p>

      <AuthFooter />
    </AuthLayout>
  );
}

export default Login;