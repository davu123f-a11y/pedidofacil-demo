"use client";

import { ChevronRight } from "lucide-react";
import { money } from "@/lib/defaults";
import { Order } from "@/types";
import { StatusBadge } from "@/components/ui";

export function OrderCard({ order, onOpen }: { order: Order; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5"
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-sm font-black text-brand-700">
        #{order.id.slice(-4)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-black text-ink">{order.customer.name}</h4>
          <StatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {order.items.length} productos · {money(order.total)} · {new Date(order.createdAt).toLocaleDateString("es-PE")}
        </p>
      </div>
      <ChevronRight className="text-slate-400" size={20} />
    </button>
  );
}
