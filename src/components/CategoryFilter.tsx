"use client";

export function CategoryFilter({
  categories,
  active,
  onChange,
}: {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${
            active === category
              ? "bg-brand-600 text-white shadow-card"
              : "border border-slate-200 bg-white text-slate-600"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
