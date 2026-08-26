import { Link } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthHeader from "../components/auth/AuthHeader";
import AuthFooter from "../components/auth/AuthFooter";
import ForgotPasswordForm from "../components/auth/forms/ForgotPasswordForm";

function ForgotPassword() {
  return (
    <AuthLayout>
      <AuthHeader
        title="Forgot your password?"
        description="Enter your email address and we'll help you reset your password."
      />

      <ForgotPasswordForm />

      <p className="mt-8 text-center text-sm text-slate-400">
        Remember your password?{" "}
        <Link
          to="/login"
          className="font-semibold text-indigo-400 transition hover:text-indigo-300"
        >
          Back to sign in
        </Link>
      </p>

      <AuthFooter />
    </AuthLayout>
  );
}

export default ForgotPassword;
