function AuthInput({
  id,
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
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
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm !text-white outline-none transition placeholder:!text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />
    </div>
  );
}

export default AuthInput;
