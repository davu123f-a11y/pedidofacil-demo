export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  available: boolean;
};

export type CartLine = {
  productId: string;
  quantity: number;
};

export type OrderStatus = "Recibido" | "Preparando" | "Listo" | "Entregado" | "Cancelado";

export type Customer = {
  name: string;
  phone: string;
  address: string;
  deliveryMethod: "Recojo" | "Delivery";
  note: string;
};

export type Order = {
  id: string;
  customer: Customer;
  items: Array<Product & { quantity: number }>;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

export type BusinessSettings = {
  name: string;
  whatsapp: string;
  logo: string;
  address: string;
  hours: string;
};
