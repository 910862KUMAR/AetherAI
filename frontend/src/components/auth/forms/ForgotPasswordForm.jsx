import AuthInput from "../AuthInput";
import Button from "../../ui/Button";

function ForgotPasswordForm() {
  return (
    <form className="space-y-5">
      <AuthInput
        id="email"
        name="email"
        label="Email address"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
      />

      <Button type="submit" className="w-full">
        Send reset link
      </Button>
    </form>
  );
}

export default ForgotPasswordForm;