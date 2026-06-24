"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Download,
  Edit3,
  Eye,
  MessageCircle,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Store,
  Trash2,
} from "lucide-react";
import { BottomNavigation, AdminSidebar } from "@/components/navigation";
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { CartItem } from "@/components/CartItem";
import { OrderCard } from "@/components/OrderCard";
import { BusinessSettingsForm, ProductForm } from "@/components/forms";
import { Button, DashboardCard, Input, StatusBadge, TextArea } from "@/components/ui";
import { BusinessSettings, CartLine, Customer, Order, OrderStatus, Product } from "@/types";
import { categories, defaultBusiness, defaultProducts, money } from "@/lib/defaults";
import { readStorage, writeStorage } from "@/lib/storage";

type ClientView = "splash" | "home" | "catalog" | "detail" | "cart" | "checkout" | "confirmation";
type AdminView = "login" | "dashboard" | "products" | "productForm" | "orders" | "orderDetail" | "reports" | "settings";
type Area = "cliente" | "admin";

const orderStatuses: OrderStatus[] = ["Recibido", "Preparando", "Listo", "Entregado", "Cancelado"];

export default function PedidoFacilApp() {
  const [area, setArea] = useState<Area>("cliente");
  const [clientView, setClientView] = useState<ClientView>("splash");
  const [adminView, setAdminView] = useState<AdminView>("login");
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [business, setBusiness] = useState<BusinessSettings>(defaultBusiness);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setProducts(readStorage("pf-products", defaultProducts));
    setOrders(readStorage("pf-orders", []));
    setBusiness(readStorage("pf-business", defaultBusiness));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) writeStorage("pf-products", products);
  }, [products, isHydrated]);

  useEffect(() => {
    if (isHydrated) writeStorage("pf-orders", orders);
  }, [orders, isHydrated]);

  useEffect(() => {
    if (isHydrated) writeStorage("pf-business", business);
  }, [business, isHydrated]);

  function saveBusinessSettings(settings: BusinessSettings) {
    setBusiness(settings);
    writeStorage("pf-business", settings);
  }

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = category === "Todos" || product.category === category;
      const matchesQuery = `${product.name} ${product.description}`.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [products, category, query]);

  const cartItems = cart
    .map((line) => {
      const product = products.find((item) => item.id === line.productId);
      return product ? { ...product, quantity: line.quantity } : null;
    })
    .filter(Boolean) as Array<Product & { quantity: number }>;

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const activeProducts = products.filter((product) => product.available).length;
  const pendingOrders = orders.filter((order) => ["Recibido", "Preparando"].includes(order.status)).length;
  const totalSold = orders.filter((order) => order.status !== "Cancelado").reduce((sum, order) => sum + order.total, 0);
  const topProduct = getTopProduct(orders);

  function addToCart(product: Product, quantity = 1) {
    if (!product.available) return;
    setCart((current) => {
      const exists = current.find((item) => item.productId === product.id);
      if (exists) {
        return current.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item));
      }
      return [...current, { productId: product.id, quantity }];
    });
  }

  function updateCart(productId: string, quantity: number) {
    if (quantity <= 0) {
      setCart((current) => current.filter((item) => item.productId !== productId));
      return;
    }
    setCart((current) => current.map((item) => (item.productId === productId ? { ...item, quantity } : item)));
  }

  function saveOrder(customer: Customer) {
    const order: Order = {
      id: `PF-${Date.now().toString().slice(-6)}`,
      customer,
      items: cartItems,
      total: cartTotal,
      status: "Recibido",
      createdAt: new Date().toISOString(),
    };
    setOrders((current) => [order, ...current]);
    setLastOrder(order);
    setCart([]);
    setClientView("confirmation");
    const whatsappUrl = buildWhatsappUrl(business.whatsapp, order);
    const opened = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.href = whatsappUrl;
    }
  }

  function saveProduct(product: Product) {
    setProducts((current) => {
      const exists = current.some((item) => item.id === product.id);
      return exists ? current.map((item) => (item.id === product.id ? product : item)) : [product, ...current];
    });
    setEditingProduct(undefined);
    setAdminView("products");
  }

  function deleteProduct(productId: string) {
    setProducts((current) => current.filter((product) => product.id !== productId));
  }

  function updateOrderStatus(order: Order, status: OrderStatus) {
    const next = { ...order, status };
    setOrders((current) => current.map((item) => (item.id === order.id ? next : item)));
    setSelectedOrder(next);
  }

  function downloadCsv() {
    const rows = [
      ["id", "cliente", "telefono", "direccion", "estado", "total", "fecha"],
      ...orders.map((order) => [
        order.id,
        order.customer.name,
        order.customer.phone,
        order.customer.address,
        order.status,
        order.total.toString(),
        order.createdAt,
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "pedidos-pedidofacil.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#f7f8f7]">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:py-6">
        {area === "admin" && adminView !== "login" ? <AdminSidebar view={adminView} onChange={(view) => setAdminView(view as AdminView)} /> : null}
        <div className="min-w-0 flex-1 pb-28 lg:pb-6">
          {area === "cliente" ? (
            <ClientShell
              business={business}
              view={clientView}
              setView={setClientView}
              setArea={setArea}
              products={products}
              visibleProducts={visibleProducts}
              query={query}
              setQuery={setQuery}
              category={category}
              setCategory={setCategory}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              addToCart={addToCart}
              cartItems={cartItems}
              cartTotal={cartTotal}
              updateCart={updateCart}
              saveOrder={saveOrder}
              lastOrder={lastOrder}
            />
          ) : (
            <AdminShell
              view={adminView}
              setView={setAdminView}
              setArea={setArea}
              products={products}
              orders={orders}
              business={business}
              setBusiness={saveBusinessSettings}
              activeProducts={activeProducts}
              pendingOrders={pendingOrders}
              totalSold={totalSold}
              topProduct={topProduct}
              editingProduct={editingProduct}
              setEditingProduct={setEditingProduct}
              saveProduct={saveProduct}
              deleteProduct={deleteProduct}
              selectedOrder={selectedOrder}
              setSelectedOrder={setSelectedOrder}
              updateOrderStatus={updateOrderStatus}
              downloadCsv={downloadCsv}
            />
          )}
        </div>
      </div>
      {area === "cliente" && clientView !== "splash" ? (
        <BottomNavigation area="cliente" view={clientView === "detail" ? "catalog" : clientView} onChange={(view) => setClientView(view as ClientView)} cartCount={cartCount} />
      ) : null}
      {area === "admin" && adminView !== "login" ? (
        <BottomNavigation area="admin" view={adminView} onChange={(view) => setAdminView(view as AdminView)} />
      ) : null}
    </main>
  );
}

function ClientShell(props: {
  business: BusinessSettings;
  view: ClientView;
  setView: (view: ClientView) => void;
  setArea: (area: Area) => void;
  products: Product[];
  visibleProducts: Product[];
  query: string;
  setQuery: (query: string) => void;
  category: string;
  setCategory: (category: string) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  addToCart: (product: Product, quantity?: number) => void;
  cartItems: Array<Product & { quantity: number }>;
  cartTotal: number;
  updateCart: (productId: string, quantity: number) => void;
  saveOrder: (customer: Customer) => void;
  lastOrder: Order | null;
}) {
  const featured = props.products.filter((product) => product.available).slice(0, 4);

  if (props.view === "splash") {
    return (
      <section className="grid min-h-[calc(100vh-32px)] place-items-center rounded-[2.5rem] bg-brand-600 p-6 text-center text-white shadow-soft">
        <div className="max-w-sm">
          <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-[2rem] bg-white text-3xl font-black text-brand-700 shadow-soft">PF</div>
          <h1 className="text-4xl font-black tracking-tight">PedidoFácil</h1>
          <p className="mx-auto mt-3 max-w-xs text-lg font-medium text-brand-50">Tu negocio, tus pedidos, todo en orden</p>
          <div className="mt-8 grid gap-3">
            <Button variant="orange" className="w-full" onClick={() => props.setView("home")}>Empezar</Button>
            <Button variant="secondary" className="w-full" onClick={() => props.setArea("admin")}>Ingresar como negocio</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-5">
      <Header
        business={props.business}
        setArea={props.setArea}
        onHome={() => props.setView("home")}
        onCart={() => props.setView("cart")}
        cartCount={props.cartItems.reduce((sum, item) => sum + item.quantity, 0)}
      />
      {props.view === "home" && (
        <section className="grid gap-5">
          <Hero business={props.business} onCatalog={() => props.setView("catalog")} />
          <CategoryFilter categories={categories} active={props.category} onChange={(category) => { props.setCategory(category); props.setView("catalog"); }} />
          <SectionTitle title="Destacados de hoy" action="Ver catálogo" onAction={() => props.setView("catalog")} />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpen={() => { props.setSelectedProduct(product); props.setView("detail"); }}
                onAdd={() => props.addToCart(product)}
              />
            ))}
          </div>
          <FloatingWhatsApp phone={props.business.whatsapp} />
        </section>
      )}
      {props.view === "catalog" && (
        <CatalogView {...props} />
      )}
      {props.view === "detail" && props.selectedProduct && (
        <ProductDetailView product={props.selectedProduct} onBack={() => props.setView("catalog")} onAdd={(quantity) => { props.addToCart(props.selectedProduct!, quantity); props.setView("cart"); }} />
      )}
      {props.view === "cart" && (
        <CartView items={props.cartItems} total={props.cartTotal} updateCart={props.updateCart} onCatalog={() => props.setView("catalog")} onCheckout={() => props.setView("checkout")} />
      )}
      {props.view === "checkout" && (
        <CheckoutView items={props.cartItems} total={props.cartTotal} onBack={() => props.setView("cart")} onSubmit={props.saveOrder} />
      )}
      {props.view === "confirmation" && (
        <ConfirmationView order={props.lastOrder} onHome={() => props.setView("home")} />
      )}
      {!["cart", "checkout", "confirmation"].includes(props.view) ? (
        <FloatingCart
          count={props.cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          total={props.cartTotal}
          onClick={() => props.setView("cart")}
        />
      ) : null}
    </div>
  );
}

function Header({
  business,
  setArea,
  onHome,
  onCart,
  cartCount,
}: {
  business: BusinessSettings;
  setArea: (area: Area) => void;
  onHome: () => void;
  onCart: () => void;
  cartCount: number;
}) {
  return (
    <header className="flex items-center gap-3 rounded-[2rem] border border-slate-100 bg-white p-3 shadow-card">
      <button type="button" onClick={onHome} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        {business.logo ? (
          <img src={business.logo} alt={business.name} className="h-12 w-12 rounded-2xl object-cover" />
        ) : (
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-600 text-lg font-black text-white">
          {(business.name || "CA").slice(0, 2).toUpperCase()}
        </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-black text-ink">{business.name}</p>
          <p className="truncate text-sm font-medium text-slate-500">{business.hours}</p>
        </div>
      </button>
      <Button variant="orange" className="relative px-3 sm:px-4" onClick={onCart}>
        <ShoppingCart size={18} />
        <span className="hidden sm:inline">Carrito</span>
        {cartCount > 0 ? (
          <span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-ink px-1 text-xs font-black text-white">
            {cartCount}
          </span>
        ) : null}
      </Button>
      <Button variant="secondary" className="hidden sm:inline-flex" onClick={() => setArea("admin")}>
        <Settings size={17} />
        Admin
      </Button>
    </header>
  );
}

function Hero({ business, onCatalog }: { business: BusinessSettings; onCatalog: () => void }) {
  return (
    <section className="overflow-hidden rounded-[2.2rem] bg-ink text-white shadow-soft">
      <div className="grid md:grid-cols-[1.1fr_0.9fr]">
        <div className="p-6 sm:p-8">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-brand-100">Catálogo abierto</span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Pide tus favoritos sin esperar respuesta.</h1>
          <p className="mt-3 max-w-xl text-base font-medium text-slate-200">
            Explora el menú de {business.name}, arma tu pedido y envíalo listo por WhatsApp.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button onClick={onCatalog}>Ver catálogo</Button>
            <a href={`https://wa.me/${business.whatsapp}`} target="_blank" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white">
              <MessageCircle size={18} />
              WhatsApp
            </a>
          </div>
        </div>
        <div className="min-h-64 bg-[url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
      </div>
    </section>
  );
}

function CatalogView(props: Parameters<typeof ClientShell>[0]) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-3">
        <Button variant="secondary" className="w-fit" onClick={() => props.setView("home")}>
          <ArrowLeft size={17} />
          Volver al inicio
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-3xl font-black text-ink">Catálogo</h2>
            <p className="text-sm font-medium text-slate-500">Busca por nombre o filtra por categoría.</p>
          </div>
          <Button variant="orange" onClick={() => props.setView("cart")}>
            <ShoppingCart size={17} />
            Ver carrito
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-card">
        <Search size={19} className="text-slate-400" />
        <input value={props.query} onChange={(event) => props.setQuery(event.target.value)} placeholder="Buscar productos" className="h-12 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none" />
      </div>
      <CategoryFilter categories={categories} active={props.category} onChange={props.setCategory} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {props.visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpen={() => { props.setSelectedProduct(product); props.setView("detail"); }}
            onAdd={() => props.addToCart(product)}
          />
        ))}
      </div>
    </section>
  );
}

function ProductDetailView({ product, onBack, onAdd }: { product: Product; onBack: () => void; onAdd: (quantity: number) => void }) {
  const [quantity, setQuantity] = useState(1);
  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-card">
      <button type="button" onClick={onBack} className="m-4 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
        <ArrowLeft size={17} />
        Volver
      </button>
      <div className="grid gap-5 p-4 pt-0 md:grid-cols-2 md:p-6">
        <img src={product.image} alt={product.name} className="h-80 w-full rounded-[1.6rem] object-cover" />
        <div className="flex flex-col justify-center">
          <StatusBadge status={product.available ? "Disponible" : "No disponible"} />
          <h2 className="mt-3 text-4xl font-black text-ink">{product.name}</h2>
          <p className="mt-2 text-3xl font-black text-brand-700">{money(product.price)}</p>
          <p className="mt-4 text-base font-medium leading-7 text-slate-600">{product.description}</p>
          <div className="mt-6 flex items-center gap-3">
            <Button variant="secondary" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
            <span className="grid h-12 w-16 place-items-center rounded-2xl bg-slate-50 text-lg font-black">{quantity}</span>
            <Button variant="secondary" onClick={() => setQuantity(quantity + 1)}>+</Button>
          </div>
          <Button disabled={!product.available} className="mt-6 w-full" onClick={() => onAdd(quantity)}>
            Agregar al carrito · {money(product.price * quantity)}
          </Button>
        </div>
      </div>
    </section>
  );
}

function CartView({
  items,
  total,
  updateCart,
  onCatalog,
  onCheckout,
}: {
  items: Array<Product & { quantity: number }>;
  total: number;
  updateCart: (productId: string, quantity: number) => void;
  onCatalog: () => void;
  onCheckout: () => void;
}) {
  if (!items.length) {
    return (
      <EmptyState title="Tu carrito está vacío" copy="Agrega productos del catálogo para iniciar tu pedido." action="Ver productos" onAction={onCatalog} />
    );
  }
  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-3">
        <h2 className="text-3xl font-black text-ink">Carrito</h2>
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            quantity={item.quantity}
            onIncrease={() => updateCart(item.id, item.quantity + 1)}
            onDecrease={() => updateCart(item.id, item.quantity - 1)}
            onRemove={() => updateCart(item.id, 0)}
          />
        ))}
      </div>
      <SummaryCard total={total} button="Continuar pedido" onClick={onCheckout} />
    </section>
  );
}

function CheckoutView({
  items,
  total,
  onBack,
  onSubmit,
}: {
  items: Array<Product & { quantity: number }>;
  total: number;
  onBack: () => void;
  onSubmit: (customer: Customer) => void;
}) {
  const [customer, setCustomer] = useState<Customer>({ name: "", phone: "", address: "", deliveryMethod: "Delivery", note: "" });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(customer);
  };

  return (
    <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <section className="grid gap-4 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-card">
        <button type="button" onClick={onBack} className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
          <ArrowLeft size={17} />
          Volver al carrito
        </button>
        <div>
          <h2 className="text-3xl font-black text-ink">Datos para tu pedido</h2>
          <p className="text-sm font-medium text-slate-500">Completa esta información para enviar el pedido listo por WhatsApp.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input required label="Nombre del cliente" value={customer.name} onChange={(name) => setCustomer({ ...customer, name })} />
          <Input required label="Teléfono" value={customer.phone} onChange={(phone) => setCustomer({ ...customer, phone })} />
        </div>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Método de entrega
          <select value={customer.deliveryMethod} onChange={(event) => setCustomer({ ...customer, deliveryMethod: event.target.value as Customer["deliveryMethod"] })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 font-medium outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
            <option>Delivery</option>
            <option>Recojo</option>
          </select>
        </label>
        <Input label="Dirección" value={customer.address} onChange={(address) => setCustomer({ ...customer, address })} placeholder="Calle, número, referencia" />
        <TextArea label="Nota adicional" value={customer.note} onChange={(note) => setCustomer({ ...customer, note })} placeholder="Ej. Sin azúcar, entregar en recepción..." />
      </section>
      <section className="h-fit rounded-[2rem] border border-slate-100 bg-white p-5 shadow-card">
        <h3 className="text-xl font-black text-ink">Resumen</h3>
        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 text-sm font-semibold text-slate-600">
              <span>{item.quantity}x {item.name}</span>
              <span>{money(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="my-4 border-t border-slate-100" />
        <div className="flex justify-between text-lg font-black text-ink">
          <span>Total</span>
          <span>{money(total)}</span>
        </div>
        <Button type="submit" variant="orange" className="mt-5 w-full">
          <MessageCircle size={18} />
          Enviar pedido por WhatsApp
        </Button>
      </section>
    </form>
  );
}

function ConfirmationView({ order, onHome }: { order: Order | null; onHome: () => void }) {
  return (
    <section className="mx-auto grid max-w-xl place-items-center rounded-[2rem] border border-slate-100 bg-white p-8 text-center shadow-card">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-brand-50 text-brand-700">
        <CheckCircle2 size={44} />
      </div>
      <h2 className="mt-5 text-3xl font-black text-ink">Pedido confirmado</h2>
      <p className="mt-2 text-sm font-medium text-slate-500">Tu pedido fue guardado y se abrió WhatsApp con el mensaje listo para enviar.</p>
      {order ? (
        <div className="mt-5 w-full rounded-3xl bg-slate-50 p-4 text-left">
          <p className="text-sm font-bold text-slate-500">Pedido</p>
          <p className="text-2xl font-black text-ink">{order.id}</p>
          <p className="mt-2 text-sm font-semibold text-slate-600">{order.items.length} productos · {money(order.total)}</p>
        </div>
      ) : null}
      <Button className="mt-6 w-full" onClick={onHome}>Volver al inicio</Button>
    </section>
  );
}

function AdminShell(props: {
  view: AdminView;
  setView: (view: AdminView) => void;
  setArea: (area: Area) => void;
  products: Product[];
  orders: Order[];
  business: BusinessSettings;
  setBusiness: (settings: BusinessSettings) => void;
  activeProducts: number;
  pendingOrders: number;
  totalSold: number;
  topProduct: string;
  editingProduct?: Product;
  setEditingProduct: (product?: Product) => void;
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  updateOrderStatus: (order: Order, status: OrderStatus) => void;
  downloadCsv: () => void;
}) {
  if (props.view === "login") {
    return <AdminLogin onLogin={() => props.setView("dashboard")} onClient={() => props.setArea("cliente")} />;
  }

  return (
    <div className="grid gap-5">
      <AdminTopbar business={props.business} setArea={props.setArea} />
      {props.view === "dashboard" && (
        <section className="grid gap-5">
          <div>
            <h1 className="text-3xl font-black text-ink">Hola, {props.business.name}</h1>
            <p className="text-sm font-medium text-slate-500">Este es el estado de tus pedidos y ventas.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard title="Ventas" value={money(props.totalSold)} helper="Total registrado" icon={<BarChart3 size={21} />} />
            <DashboardCard title="Pedidos" value={String(props.orders.length)} helper="Pedidos recibidos" icon={<ClipboardList size={21} />} />
            <DashboardCard title="Productos activos" value={String(props.activeProducts)} helper="Disponibles en catálogo" icon={<Package size={21} />} />
            <DashboardCard title="Pendientes" value={String(props.pendingOrders)} helper="Por atender" icon={<ShoppingCart size={21} />} />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <QuickAction label="Agregar producto" icon={<Plus size={19} />} onClick={() => { props.setEditingProduct(undefined); props.setView("productForm"); }} />
            <QuickAction label="Ver pedidos" icon={<Eye size={19} />} onClick={() => props.setView("orders")} />
            <QuickAction label="Compartir catálogo" icon={<MessageCircle size={19} />} onClick={() => navigator.clipboard?.writeText(window.location.href)} />
          </div>
          <Panel title="Pedidos recientes">
            <div className="grid gap-3">
              {props.orders.slice(0, 4).map((order) => (
                <OrderCard key={order.id} order={order} onOpen={() => { props.setSelectedOrder(order); props.setView("orderDetail"); }} />
              ))}
              {!props.orders.length ? <p className="text-sm font-medium text-slate-500">Cuando lleguen pedidos aparecerán aquí.</p> : null}
            </div>
          </Panel>
        </section>
      )}
      {props.view === "products" && (
        <ProductsAdmin {...props} />
      )}
      {props.view === "productForm" && (
        <ProductForm initial={props.editingProduct} onSave={props.saveProduct} onCancel={() => props.setView("products")} />
      )}
      {props.view === "orders" && (
        <OrdersAdmin {...props} />
      )}
      {props.view === "orderDetail" && props.selectedOrder && (
        <OrderDetailView order={props.selectedOrder} onBack={() => props.setView("orders")} onStatus={(status) => props.updateOrderStatus(props.selectedOrder!, status)} />
      )}
      {props.view === "reports" && (
        <ReportsView orders={props.orders} totalSold={props.totalSold} topProduct={props.topProduct} downloadCsv={props.downloadCsv} />
      )}
      {props.view === "settings" && (
        <BusinessSettingsForm settings={props.business} onSave={props.setBusiness} />
      )}
    </div>
  );
}

function AdminLogin({ onLogin, onClient }: { onLogin: () => void; onClient: () => void }) {
  const [user, setUser] = useState("admin@pedidofacil.pe");
  const [password, setPassword] = useState("demo123");
  return (
    <section className="mx-auto grid min-h-[calc(100vh-32px)] max-w-md place-items-center">
      <form onSubmit={(event) => { event.preventDefault(); onLogin(); }} className="w-full rounded-[2rem] border border-slate-100 bg-white p-6 shadow-soft">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-3xl bg-brand-600 text-xl font-black text-white">PF</div>
          <h1 className="text-3xl font-black text-ink">Panel PedidoFácil</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Ingresa para gestionar productos y pedidos.</p>
        </div>
        <div className="grid gap-4">
          <Input label="Usuario" value={user} onChange={setUser} />
          <Input label="Contraseña" type="password" value={password} onChange={setPassword} />
          <Button type="submit" className="w-full">Ingresar</Button>
          <Button variant="secondary" className="w-full" onClick={onClient}>Ver catálogo cliente</Button>
        </div>
      </form>
    </section>
  );
}

function AdminTopbar({ business, setArea }: { business: BusinessSettings; setArea: (area: Area) => void }) {
  return (
    <header className="flex items-center justify-between gap-3 rounded-[2rem] border border-slate-100 bg-white p-3 shadow-card">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Administrador</p>
        <h2 className="text-xl font-black text-ink">{business.name}</h2>
      </div>
      <Button variant="secondary" onClick={() => setArea("cliente")}>
        <Store size={17} />
        Ver catálogo
      </Button>
    </header>
  );
}

function ProductsAdmin(props: Parameters<typeof AdminShell>[0]) {
  const [filter, setFilter] = useState("Todos");
  const list = props.products.filter((product) => filter === "Todos" || product.category === filter);
  return (
    <section className="grid gap-4">
      <SectionTitle title="Productos" action="Agregar producto" onAction={() => { props.setEditingProduct(undefined); props.setView("productForm"); }} />
      <CategoryFilter categories={categories} active={filter} onChange={setFilter} />
      <div className="grid gap-3">
        {list.map((product) => (
          <article key={product.id} className="grid gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-card md:grid-cols-[88px_1fr_auto] md:items-center">
            <img src={product.image} alt={product.name} className="h-24 w-full rounded-2xl object-cover md:h-20 md:w-20" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black text-ink">{product.name}</h3>
                <StatusBadge status={product.available ? "Disponible" : "No disponible"} />
              </div>
              <p className="text-sm font-semibold text-slate-500">{product.category} · {money(product.price)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => {
                props.saveProduct({ ...product, available: !product.available });
              }}>
                {product.available ? "Pausar" : "Activar"}
              </Button>
              <Button variant="secondary" onClick={() => { props.setEditingProduct(product); props.setView("productForm"); }}>
                <Edit3 size={16} />
                Editar
              </Button>
              <Button variant="danger" onClick={() => props.deleteProduct(product.id)}>
                <Trash2 size={16} />
                Eliminar
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function OrdersAdmin(props: Parameters<typeof AdminShell>[0]) {
  const [status, setStatus] = useState<OrderStatus | "Todos">("Todos");
  const list = props.orders.filter((order) => status === "Todos" || order.status === status);
  return (
    <section className="grid gap-4">
      <div>
        <h1 className="text-3xl font-black text-ink">Pedidos</h1>
        <p className="text-sm font-medium text-slate-500">Gestiona estados y revisa el detalle de cada pedido.</p>
      </div>
      <CategoryFilter categories={["Todos", ...orderStatuses]} active={status} onChange={(value) => setStatus(value as OrderStatus | "Todos")} />
      <div className="grid gap-3">
        {list.map((order) => (
          <OrderCard key={order.id} order={order} onOpen={() => { props.setSelectedOrder(order); props.setView("orderDetail"); }} />
        ))}
        {!list.length ? <EmptyState title="Aún no tienes pedidos" copy="Cuando tus clientes compren, los pedidos aparecerán aquí." /> : null}
      </div>
    </section>
  );
}

function OrderDetailView({ order, onBack, onStatus }: { order: Order; onBack: () => void; onStatus: (status: OrderStatus) => void }) {
  return (
    <section className="grid gap-4 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-card">
      <button type="button" onClick={onBack} className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
        <ArrowLeft size={17} />
        Volver a pedidos
      </button>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-500">Pedido {order.id}</p>
          <h1 className="text-3xl font-black text-ink">{order.customer.name}</h1>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Cliente">
          <p className="font-bold text-ink">{order.customer.phone}</p>
          <p className="mt-1 text-sm font-medium text-slate-500">{order.customer.deliveryMethod} · {order.customer.address || "Sin dirección"}</p>
          <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm font-medium text-slate-600">{order.customer.note || "Sin nota adicional"}</p>
        </Panel>
        <Panel title="Productos">
          <div className="grid gap-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm font-semibold text-slate-600">
                <span>{item.quantity}x {item.name}</span>
                <span>{money(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="mt-2 border-t border-slate-100 pt-3 text-lg font-black text-ink">Total: {money(order.total)}</div>
          </div>
        </Panel>
      </div>
      <div>
        <p className="mb-2 text-sm font-black text-ink">Cambiar estado</p>
        <div className="flex flex-wrap gap-2">
          {orderStatuses.map((status) => (
            <Button key={status} variant={order.status === status ? "primary" : "secondary"} onClick={() => onStatus(status)}>
              {status}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReportsView({ orders, totalSold, topProduct, downloadCsv }: { orders: Order[]; totalSold: number; topProduct: string; downloadCsv: () => void }) {
  return (
    <section className="grid gap-5">
      <SectionTitle title="Reportes" action="Descargar CSV" onAction={downloadCsv} />
      <div className="grid gap-3 md:grid-cols-3">
        <DashboardCard title="Total vendido" value={money(totalSold)} helper="Pedidos no cancelados" icon={<BarChart3 size={21} />} />
        <DashboardCard title="Número de pedidos" value={String(orders.length)} helper="Historial local" icon={<ClipboardList size={21} />} />
        <DashboardCard title="Más vendido" value={topProduct} helper="Según unidades pedidas" icon={<Package size={21} />} />
      </div>
      <Panel title="Pedidos exportables">
        <div className="grid gap-3">
          {orders.slice(0, 8).map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3">
              <span className="text-sm font-black text-ink">{order.id}</span>
              <span className="text-sm font-semibold text-slate-600">{order.customer.name}</span>
              <StatusBadge status={order.status} />
              <span className="text-sm font-black text-ink">{money(order.total)}</span>
            </div>
          ))}
        </div>
        <Button className="mt-4" onClick={downloadCsv}>
          <Download size={17} />
          Descargar pedidos en CSV
        </Button>
      </Panel>
    </section>
  );
}

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-2xl font-black text-ink">{title}</h2>
      {action && onAction ? <Button variant="secondary" onClick={onAction}>{action}</Button> : null}
    </div>
  );
}

function SummaryCard({ total, button, onClick }: { total: number; button: string; onClick: () => void }) {
  return (
    <aside className="h-fit rounded-[2rem] border border-slate-100 bg-white p-5 shadow-card">
      <h3 className="text-xl font-black text-ink">Resumen</h3>
      <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600">
        <div className="flex justify-between"><span>Subtotal</span><span>{money(total)}</span></div>
        <div className="flex justify-between"><span>Delivery</span><span>Por confirmar</span></div>
      </div>
      <div className="my-4 border-t border-slate-100" />
      <div className="flex justify-between text-lg font-black text-ink"><span>Total</span><span>{money(total)}</span></div>
      <Button className="mt-5 w-full" onClick={onClick}>{button}</Button>
    </aside>
  );
}

function EmptyState({ title, copy, action, onAction }: { title: string; copy: string; action?: string; onAction?: () => void }) {
  return (
    <section className="grid place-items-center rounded-[2rem] border border-dashed border-slate-200 bg-white p-8 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        <ShoppingCart size={25} />
      </div>
      <h3 className="mt-4 text-xl font-black text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm font-medium text-slate-500">{copy}</p>
      {action && onAction ? <Button className="mt-5" onClick={onAction}>{action}</Button> : null}
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-card">
      <h3 className="mb-4 text-xl font-black text-ink">{title}</h3>
      {children}
    </section>
  );
}

function QuickAction({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-3 rounded-3xl border border-slate-100 bg-white p-4 text-left font-black text-ink shadow-card transition hover:-translate-y-0.5">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orangeSoft-100 text-orangeSoft-600">{icon}</span>
      {label}
    </button>
  );
}

function FloatingWhatsApp({ phone }: { phone: string }) {
  return (
    <a href={`https://wa.me/${phone}`} target="_blank" className="fixed bottom-28 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-soft lg:bottom-8">
      <MessageCircle size={26} />
    </a>
  );
}

function FloatingCart({ count, total, onClick }: { count: number; total: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-44 right-5 z-30 inline-flex min-h-14 items-center gap-3 rounded-full bg-orangeSoft-500 px-4 py-3 text-sm font-black text-white shadow-soft transition hover:bg-orangeSoft-600 lg:bottom-24"
    >
      <span className="relative grid h-8 w-8 place-items-center rounded-full bg-white/20">
        <ShoppingCart size={19} />
        {count > 0 ? (
          <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] text-white">
            {count}
          </span>
        ) : null}
      </span>
      <span>{count > 0 ? money(total) : "Carrito"}</span>
    </button>
  );
}

function buildWhatsappUrl(phone: string, order: Order) {
  const cleanPhone = phone.replace(/\D/g, "");
  const products = order.items.map((item) => `- ${item.quantity}x ${item.name} - ${money(item.price * item.quantity)}`).join("\n");
  const text = `Hola, quiero confirmar este pedido:\n\nPedido: ${order.id}\nNombre: ${order.customer.name}\nTeléfono: ${order.customer.phone}\nDirección: ${order.customer.address || "Recojo en tienda"}\nEntrega: ${order.customer.deliveryMethod}\n\nProductos:\n${products}\n\nTotal: ${money(order.total)}\nNota: ${order.customer.note || "Sin nota"}`;
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
}

function getTopProduct(orders: Order[]) {
  const counts = new Map<string, number>();
  orders.forEach((order) => {
    order.items.forEach((item) => counts.set(item.name, (counts.get(item.name) ?? 0) + item.quantity));
  });
  const winner = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
  return winner ? winner[0] : "Sin ventas";
}
