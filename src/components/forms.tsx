"use client";

import { FormEvent, useEffect, useState } from "react";
import { BusinessSettings, Product } from "@/types";
import { Button, Input, TextArea } from "@/components/ui";
import { categories } from "@/lib/defaults";

export function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}) {
  const [product, setProduct] = useState<Product>(
    initial ?? {
      id: `p${Date.now()}`,
      name: "",
      price: 0,
      category: "Café",
      description: "",
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=900&q=80",
      available: true,
    },
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSave({ ...product, price: Number(product.price) });
  };

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-card">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Producto</p>
        <h3 className="text-2xl font-black text-ink">{initial ? "Editar producto" : "Crear producto"}</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input required label="Nombre del producto" value={product.name} onChange={(name) => setProduct({ ...product, name })} />
        <Input required label="Precio" type="number" value={product.price} onChange={(price) => setProduct({ ...product, price: Number(price) })} />
      </div>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Categoría
        <select
          value={product.category}
          onChange={(event) => setProduct({ ...product, category: event.target.value })}
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        >
          {categories.filter((category) => category !== "Todos").map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </label>
      <TextArea label="Descripción" value={product.description} onChange={(description) => setProduct({ ...product, description })} />
      <Input label="URL de imagen" value={product.image} onChange={(image) => setProduct({ ...product, image })} />
      <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
        Producto disponible
        <input
          type="checkbox"
          checked={product.available}
          onChange={(event) => setProduct({ ...product, available: event.target.checked })}
          className="h-5 w-5 accent-brand-600"
        />
      </label>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{initial ? "Actualizar producto" : "Guardar producto"}</Button>
      </div>
    </form>
  );
}

export function BusinessSettingsForm({
  settings,
  onSave,
}: {
  settings: BusinessSettings;
  onSave: (settings: BusinessSettings) => void;
}) {
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSave({
      ...draft,
      name: draft.name.trim() || "Mi negocio",
      whatsapp: draft.whatsapp.replace(/\D/g, ""),
      logo: draft.logo.trim(),
      address: draft.address.trim(),
      hours: draft.hours.trim(),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-card">
      <div className="grid gap-4 md:grid-cols-[1fr_220px] md:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Negocio</p>
          <h3 className="text-2xl font-black text-ink">Configuración del negocio</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">Estos datos aparecen en el catálogo público y en los mensajes de pedido.</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            {draft.logo ? (
              <img src={draft.logo} alt={draft.name} className="h-14 w-14 rounded-2xl object-cover" />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-lg font-black text-white">
                {(draft.name || "N").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-black text-ink">{draft.name || "Mi negocio"}</p>
              <p className="truncate text-xs font-bold text-slate-500">{draft.hours || "Horario del negocio"}</p>
            </div>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Vista previa del catálogo</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Nombre del negocio" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} />
        <Input label="Número de WhatsApp" value={draft.whatsapp} onChange={(whatsapp) => setDraft({ ...draft, whatsapp })} />
      </div>
      <Input label="Logo o URL de imagen" value={draft.logo} onChange={(logo) => setDraft({ ...draft, logo })} placeholder="Opcional" />
      <Input label="Horario" value={draft.hours} onChange={(hours) => setDraft({ ...draft, hours })} />
      <Input label="Dirección" value={draft.address} onChange={(address) => setDraft({ ...draft, address })} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {saved ? <span className="text-sm font-bold text-brand-700">Cambios guardados</span> : null}
        <Button type="submit" className="sm:justify-self-end">{saved ? "Guardado" : "Guardar cambios"}</Button>
      </div>
    </form>
  );
}
