const STATS = [
  { value: "10,000+", label: "Bookings Completed" },
  { value: "500+", label: "Verified Technicians" },
  { value: "50+", label: "Cities Covered" },
  { value: "4.9★", label: "Average Customer Rating" },
];

export function StatsSection() {
  return (
    <section className="border-y border-slate-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="font-extrabold text-blue-600 text-3xl sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
