function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/10 ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;