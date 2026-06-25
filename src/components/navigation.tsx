"use client";

import { BarChart3, Home, LayoutDashboard, Package, Settings, ShoppingCart, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

export function BottomNavigation({
  area,
  view,
  onChange,
  cartCount = 0,
}: {
  area: "cliente" | "admin";
  view: string;
  onChange: (view: string) => void;
  cartCount?: number;
}) {
  const clientItems: NavItem[] = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "catalog", label: "Catálogo", icon: Store },
    { id: "cart", label: "Carrito", icon: ShoppingCart, badge: cartCount },
  ];
  const adminItems: NavItem[] = [
    { id: "dashboard", label: "Inicio", icon: LayoutDashboard },
    { id: "orders", label: "Pedidos", icon: ShoppingCart },
    { id: "products", label: "Productos", icon: Package },
    { id: "reports", label: "Reportes", icon: BarChart3 },
    { id: "settings", label: "Ajustes", icon: Settings },
  ];
  const items = area === "cliente" ? clientItems : adminItems;

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[1.4rem] border border-slate-200 bg-white/95 p-1.5 shadow-soft backdrop-blur lg:hidden">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`relative grid gap-0.5 rounded-2xl px-2 py-2 text-[11px] font-bold transition ${
                active ? "bg-brand-50 text-brand-700" : "text-slate-500"
              }`}
            >
              <Icon className="mx-auto" size={19} />
              {item.badge ? (
                <span className="absolute right-3 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-orangeSoft-500 px-1 text-[10px] text-white">
                  {item.badge}
                </span>
              ) : null}
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function AdminSidebar({ view, onChange }: { view: string; onChange: (view: string) => void }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "orders", label: "Pedidos", icon: ShoppingCart },
    { id: "products", label: "Productos", icon: Package },
    { id: "reports", label: "Reportes", icon: BarChart3 },
    { id: "settings", label: "Configuración", icon: Settings },
  ];
  return (
    <aside className="sticky top-6 hidden h-[calc(100vh-48px)] w-72 shrink-0 rounded-[2rem] border border-slate-100 bg-white p-4 shadow-card lg:block">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-lg font-black text-white">PF</div>
        <div>
          <p className="text-lg font-black text-ink">PedidoFácil</p>
          <p className="text-xs font-bold text-slate-400">Panel administrador</p>
        </div>
      </div>
      <div className="grid gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                active ? "bg-brand-600 text-white shadow-card" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon size={19} />
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
