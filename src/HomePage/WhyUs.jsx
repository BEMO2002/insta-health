import React from "react";

const items = [
  {
    icon: "/src/assets/HOME/why (1).png",
    title: "دفع الكتروني",
  },
  { icon: "/src/assets/HOME/why (2).png", title: "متابعة دورية" },
  {
    icon: "/src/assets/HOME/why (3).png",
    title: "ملف طبي للمريض",
  },
];

const Card = ({ icon, title }) => (
  <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-1">
    <div className="relative z-10 flex flex-col items-center justify-center gap-4">
      <img src={icon} alt={title} className=" object-contain" />
      <h4 className=" text-lg  font-bold tracking-wide ">{title}</h4>
    </div>
    <div className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-50 to-sky-50" />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-cyan-300/60" />
    </div>
  </div>
);

const WhyUS = () => {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-md text-center">
          <h2 className="text-2xl font-bold uppercase tracking-wide  md:text-3xl">
            ليه تختارنا؟
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((it, i) => (
            <div key={i} className="h-full">
              <Card {...it} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUS;
