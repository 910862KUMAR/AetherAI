import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthInput from "../AuthInput";
import PasswordInput from "../PasswordInput";
import Button from "../../ui/Button";

import {
  loginUser,
  getApiErrorMessage,
} from "../../../services/authService";

import { useAuth } from "../../../context/AuthContext";

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await loginUser(
        formData.email.trim(),
        formData.password
      );

      const authenticated = login(response);

      if (!authenticated) {
        throw new Error(
          "Authentication response did not contain an access token."
        );
      }

      navigate("/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit}
      noValidate
    >
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

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

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm font-medium text-slate-200"
          >
            Password
          </label>

          <Link
            to="/forgot-password"
            className="text-sm font-medium text-indigo-400 transition hover:text-indigo-300"
          >
            Forgot password?
          </Link>
        </div>

        <PasswordInput
          id="password"
          name="password"
          label=""
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

export default LoginForm;
