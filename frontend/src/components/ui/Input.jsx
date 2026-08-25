function Input({
  id,
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
  required = false,
  disabled = false,
  className = "",
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

export default Input;