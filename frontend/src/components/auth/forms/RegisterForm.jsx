import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthInput from "../AuthInput";
import PasswordInput from "../PasswordInput";
import Button from "../../ui/Button";
import {
  registerUser,
  getApiErrorMessage,
} from "../../../services/authService";

function RegisterForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const fullName = formData.full_name.trim();
    const email = formData.email.trim().toLowerCase();

    if (!fullName) {
      setError("Please enter your full name.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter a password.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        full_name: fullName,
        email,
        password: formData.password,
      });

      setSuccess(
        "Account created successfully. Redirecting to sign in..."
      );

      setFormData({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            registered: true,
            email,
          },
        });
      }, 1200);
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to create your account. Please try again."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      noValidate
    >
      <AuthInput
        id="full_name"
        name="full_name"
        label="Full name"
        placeholder="Your full name"
        autoComplete="name"
        value={formData.full_name}
        onChange={handleChange}
      />

      <AuthInput
        id="email"
        name="email"
        label="Email address"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
      />

      <PasswordInput
        id="password"
        name="password"
        label="Password"
        placeholder="Create a password"
        autoComplete="new-password"
        value={formData.password}
        onChange={handleChange}
      />

      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm password"
        placeholder="Confirm your password"
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={handleChange}
      />

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
        >
          {success}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}

export default RegisterForm;



