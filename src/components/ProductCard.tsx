"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Product } from "@/types";
import { money } from "@/lib/defaults";
import { Button, StatusBadge } from "@/components/ui";

export function ProductCard({
  product,
  onOpen,
  onAdd,
  admin = false,
}: {
  product: Product;
  onOpen?: () => void;
  onAdd?: () => void;
  admin?: boolean;
}) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    onAdd?.();
    setAdded(true);
    window.setTimeout(() => setAdded(false), 900);
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card">
      <button onClick={onOpen} className="block w-full text-left" type="button">
        <div className="relative h-36 overflow-hidden bg-slate-100 sm:h-44">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          <div className="absolute left-3 top-3">
            <StatusBadge status={product.available ? "Disponible" : "No disponible"} />
          </div>
        </div>
      </button>
      <div className="grid gap-3 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand-700">{product.category}</p>
          <h3 className="mt-1 line-clamp-1 text-base font-black text-ink">{product.name}</h3>
          <p className="mt-1 text-lg font-black text-ink">{money(product.price)}</p>
        </div>
        {!admin && (
          <Button disabled={!product.available} onClick={handleAdd} className="w-full">
            {added ? <Check size={18} /> : <Plus size={18} />}
            {added ? "Agregado" : "Agregar"}
          </Button>
        )}
      </div>
    </article>
  );
}
