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
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card sm:rounded-3xl">
      <button onClick={onOpen} className="block w-full text-left focus:outline-none focus:ring-4 focus:ring-brand-100" type="button" aria-label={`Ver detalle de ${product.name}`}>
        <div className="relative h-28 overflow-hidden bg-slate-100 sm:h-44">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          <div className="absolute left-2 top-2 sm:left-3 sm:top-3">
            <StatusBadge status={product.available ? "Disponible" : "No disponible"} />
          </div>
        </div>
      </button>
      <div className="grid gap-2.5 p-3 sm:gap-3 sm:p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-brand-700 sm:text-xs">{product.category}</p>
          <h3 className="mt-0.5 line-clamp-1 text-sm font-black text-ink sm:mt-1 sm:text-base">{product.name}</h3>
          <p className="mt-0.5 text-base font-black text-ink sm:mt-1 sm:text-lg">{money(product.price)}</p>
        </div>
        {!admin && (
          <Button disabled={!product.available} onClick={handleAdd} className="min-h-10 w-full rounded-xl px-2 text-xs sm:min-h-11 sm:rounded-2xl sm:text-sm">
            {added ? <Check size={16} /> : <Plus size={16} />}
            {added ? "Agregado" : "Agregar"}
          </Button>
        )}
      </div>
    </article>
  );
}
