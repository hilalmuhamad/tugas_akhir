const StatCard = ({
  title,
  value,
  description,
  icon,
  variant = "default",
}) => {
  const variants = {
    default: "bg-white border-slate-200",
    blue: "bg-blue-50 border-blue-100",
    green: "bg-emerald-50 border-emerald-100",
    purple: "bg-purple-50 border-purple-100",
  };

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${variants[variant]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>

          {description && (
            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>

        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;