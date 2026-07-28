const STEPS = [
  {
    step: "01",
    title: "Search Services",
    desc: "Select your required service and enter your location details.",
  },
  {
    step: "02",
    title: "Choose Technician",
    desc: "Compare profiles, verified ratings, and transparent upfront quotes.",
  },
  {
    step: "03",
    title: "Book & Relax",
    desc: "Schedule a time slot. Pay securely after job completion.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-bold text-slate-900 text-3xl tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-3 text-slate-600">
            Book your home service in 3 simple steps.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((item, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center text-center p-6 bg-slate-50 rounded-3xl border border-slate-100"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white text-lg shadow-md">
                {item.step}
              </span>
              <h3 className="mt-6 font-bold text-slate-900 text-xl">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
