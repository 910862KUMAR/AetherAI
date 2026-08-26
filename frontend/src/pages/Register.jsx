import { Link } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthHeader from "../components/auth/AuthHeader";
import AuthFooter from "../components/auth/AuthFooter";
import RegisterForm from "../components/auth/forms/RegisterForm";

function Register() {
  return (
    <AuthLayout>
      <AuthHeader
        title="Create your account"
        description="Set up your secure AetherAI workspace."
      />

      <RegisterForm />

      <p className="mt-8 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-indigo-400 transition hover:text-indigo-300"
        >
          Sign in
        </Link>
      </p>

      <AuthFooter />
    </AuthLayout>
  );
}

export default Register;
