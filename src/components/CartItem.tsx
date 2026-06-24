"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Product } from "@/types";
import { money } from "@/lib/defaults";

export function CartItem({
  item,
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: Product;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-3 rounded-3xl border border-slate-100 bg-white p-3 shadow-card">
      <img src={item.image} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
      <div className="min-w-0 flex-1">
        <h4 className="font-black text-ink">{item.name}</h4>
        <p className="text-sm font-bold text-slate-500">{money(item.price)}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full bg-slate-50 p-1">
            <button className="grid h-8 w-8 place-items-center rounded-full bg-white text-slate-600 shadow-sm" onClick={onDecrease} type="button">
              <Minus size={15} />
            </button>
            <span className="w-6 text-center text-sm font-black">{quantity}</span>
            <button className="grid h-8 w-8 place-items-center rounded-full bg-white text-brand-700 shadow-sm" onClick={onIncrease} type="button">
              <Plus size={15} />
            </button>
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-600" onClick={onRemove} type="button">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
