"use client";

import { ReactNode } from "react";
import { CheckCircle2, Clock, PackageCheck, Truck, XCircle } from "lucide-react";
import { OrderStatus } from "@/types";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "orange" | "ghost" | "danger";
  className?: string;
  disabled?: boolean;
};

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled,
}: ButtonProps) {
  const variants = {
    primary: "bg-brand-600 text-white shadow-card hover:bg-brand-700",
    secondary: "border border-slate-200 bg-white text-ink hover:bg-slate-50",
    orange: "bg-orangeSoft-500 text-white shadow-card hover:bg-orangeSoft-600",
    ghost: "text-brand-700 hover:bg-brand-50",
    danger: "bg-red-50 text-red-700 hover:bg-red-100",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

type InputProps = {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: number;
  step?: string;
};

export function Input({ label, value, onChange, placeholder, type = "text", required, min, step }: InputProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      <span>
        {label}
        {required ? <span className="ml-1 text-orangeSoft-600">*</span> : null}
      </span>
      <input
        required={required}
        type={type}
        min={min}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
      />
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <textarea
        value={value}
        placeholder={placeholder}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
      />
    </label>
  );
}

export function StatusBadge({ status }: { status: OrderStatus | "Disponible" | "No disponible" }) {
  const styles: Record<string, string> = {
    Recibido: "bg-blue-50 text-blue-700",
    Preparando: "bg-orangeSoft-100 text-orangeSoft-600",
    Listo: "bg-brand-50 text-brand-700",
    Entregado: "bg-slate-100 text-slate-700",
    Cancelado: "bg-red-50 text-red-700",
    Disponible: "bg-brand-50 text-brand-700",
    "No disponible": "bg-slate-100 text-slate-500",
  };
  const icons: Record<string, ReactNode> = {
    Recibido: <Clock size={14} />,
    Preparando: <PackageCheck size={14} />,
    Listo: <CheckCircle2 size={14} />,
    Entregado: <Truck size={14} />,
    Cancelado: <XCircle size={14} />,
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold sm:text-xs ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
}

export function DashboardCard({
  title,
  value,
  helper,
  icon,
}: {
  title: string;
  value: string;
  helper: string;
  icon: ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-4 shadow-card">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        {icon}
      </div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{title}</p>
      <strong className="mt-1 block text-2xl font-black text-ink">{value}</strong>
      <span className="text-sm font-medium text-slate-500">{helper}</span>
    </article>
  );
}
