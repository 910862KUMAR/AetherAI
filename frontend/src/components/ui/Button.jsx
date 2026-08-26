function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) {
  const variants = {
    primary:
      "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 focus:ring-indigo-500/30",
    secondary:
      "border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 focus:ring-slate-500/30",
    ghost:
      "text-slate-400 hover:bg-slate-800 hover:text-white focus:ring-slate-500/30",
    danger:
      "bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-500 focus:ring-red-500/30",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
