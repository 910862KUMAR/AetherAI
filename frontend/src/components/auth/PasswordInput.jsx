import { useState } from "react";

function PasswordInput({
  id,
  name,
  label,
  placeholder = "Enter your password",
  autoComplete = "current-password",
  value,
  onChange,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-200"
      >
        {label}
      </label>

      <input
        id={id}
        name={name}
        type="text"
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          color: "#ffffff",
          WebkitTextFillColor: "#ffffff",
          backgroundColor: "#0f172a",
          caretColor: "#ffffff",
        }}
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />
    </div>
  );
}

export default PasswordInput;