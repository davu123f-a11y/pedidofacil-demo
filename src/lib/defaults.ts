import { BusinessSettings, Product } from "@/types";

export const categories = ["Todos", "Café", "Postres", "Sandwiches", "Bebidas frías"];

export const defaultBusiness: BusinessSettings = {
  name: "Café Aurora",
  whatsapp: "51987654321",
  logo: "",
  address: "Av. Primavera 245, Lima",
  hours: "Lun a sáb · 8:00 a.m. - 8:00 p.m.",
};

export const defaultProducts: Product[] = [
  {
    id: "p1",
    name: "Café americano",
    price: 7,
    category: "Café",
    description: "Café filtrado intenso, servido caliente y con aroma profundo.",
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=900&q=80",
    available: true,
  },
  {
    id: "p2",
    name: "Cappuccino",
    price: 10,
    category: "Café",
    description: "Espresso con leche vaporizada, espuma cremosa y cacao.",
    image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=900&q=80",
    available: true,
  },
  {
    id: "p3",
    name: "Latte",
    price: 11,
    category: "Café",
    description: "Café suave con leche cremosa, ideal para acompañar postres.",
    image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=900&q=80",
    available: true,
  },
  {
    id: "p4",
    name: "Cheesecake",
    price: 15,
    category: "Postres",
    description: "Porción de cheesecake artesanal con salsa de frutos rojos.",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=80",
    available: true,
  },
  {
    id: "p5",
    name: "Brownie",
    price: 9,
    category: "Postres",
    description: "Brownie húmedo de chocolate con nueces y centro suave.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80",
    available: true,
  },
  {
    id: "p6",
    name: "Sandwich de pollo",
    price: 16,
    category: "Sandwiches",
    description: "Pan artesanal, pollo deshilachado, palta y salsa de la casa.",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80",
    available: true,
  },
  {
    id: "p7",
    name: "Jugo de maracuyá",
    price: 8,
    category: "Bebidas frías",
    description: "Jugo natural preparado al momento, fresco y ligeramente dulce.",
    image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=900&q=80",
    available: true,
  },
  {
    id: "p8",
    name: "Agua mineral",
    price: 4,
    category: "Bebidas frías",
    description: "Botella personal de agua mineral sin gas.",
    image: "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=900&q=80",
    available: false,
  },
];

export const money = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(value);
