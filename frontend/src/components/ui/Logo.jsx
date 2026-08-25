import { Link } from "react-router-dom";

function Logo({ to = "/", showText = true }) {
  return (
    <Link to={to} className="inline-flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
        <span className="text-lg font-bold text-white">A</span>
      </div>

      {showText && (
        <span className="text-xl font-bold tracking-tight text-white">
          AetherAI
        </span>
      )}
    </Link>
  );
}

export default Logo;