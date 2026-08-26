function AuthHeader({ title, description }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-white">
        {title}
      </h1>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default AuthHeader;
