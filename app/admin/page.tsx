"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  LogOut, CheckCircle, Clock, LayoutDashboard, TrendingUp, User,
  Package, Download, Loader2, BarChart3, ShoppingBag,
  CheckCircle2, ImageIcon, X, Plus, Minus, Trash2, Search, ShoppingCart, ChevronDown, ChevronUp, Banknote, Smartphone, AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";

const MENU_ITEMS = [
  { id: "strawberry-1", name: "London Love Triple Waffle", price: 110, category: "London Strawberry Drips" },
  { id: "bowl-1", name: "Double Melt Bowl", price: 120, category: "Classic Melt Bowls" },
  { id: "bowl-2", name: "Triple Melt Bowl", price: 120, category: "Classic Melt Bowls" },
  { id: "bowl-3", name: "Nutella Dream Bowl", price: 140, category: "Signature Melt Bowls" },
  { id: "bowl-4", name: "Berry Bliss Melt Bowl", price: 140, category: "Signature Melt Bowls" },
  { id: "waffle-2", name: "White Melt Waffle", price: 80, category: "Classic Waffles" },
  { id: "waffle-3", name: "Milk Melt Waffle", price: 80, category: "Classic Waffles" },
  { id: "waffle-4", name: "Dark Melt Waffle", price: 80, category: "Classic Waffles" },
  { id: "special-1", name: "KitKat Crush Waffle", price: 100, category: "Room Specials" },
  { id: "special-2", name: "Nutella Dream Special", price: 100, category: "Room Specials" },
  { id: "special-3", name: "Triple Chocolate Melt", price: 100, category: "Room Specials" },
  { id: "special-4", name: "Butterscotch Crunch Waffle", price: 100, category: "Room Specials" },
  { id: "premium-1", name: "Biscoff Bliss Melt", price: 110, category: "Premium Melts" },
  { id: "premium-2", name: "Red Velvet Royale Waffle", price: 110, category: "Premium Melts" },
  { id: "pancake-1", name: "Nutella Melt Bites", price: 105, category: "Mini Melt Pancakes" },
  { id: "pancake-2", name: "Triple Chocolate Melt Bites", price: 105, category: "Mini Melt Pancakes" },
];

const getLocalYYYYMMDD = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function AdminPOS({ onOrderCompleted, onCancel }: { onOrderCompleted: () => void, onCancel: () => void }) {
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");

  const categories = ["All", ...Array.from(new Set(MENU_ITEMS.map(i => i.category)))];
  const filtered = MENU_ITEMS.filter(i =>
    (category === "All" || i.category === category) &&
    (i.name.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = (item: any) => setCart([...cart, { ...item, cartItemId: Date.now().toString() + Math.random(), quantity: 1, selectedAddOns: [] }]);
  const updateQty = (id: string, delta: number) => setCart(cart.map(c => c.cartItemId === id ? { ...c, quantity: Math.max(1, c.quantity + delta) } : c));
  const remove = (id: string) => setCart(cart.filter(c => c.cartItemId !== id));
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async (method: 'cash' | 'upi') => {
    if (cart.length === 0) return;
    if (!customerPhone || customerPhone.length < 10) {
      alert("Please enter a valid customer phone number first!");
      return;
    }
    setIsSubmitting(true);
    try {
      let { data, error } = await supabase.from('orders').insert([{
        customer_email: `In-Store Walk-in | Ph: ${customerPhone || "N/A"}`,
        phone_number: customerPhone || "N/A",
        total_amount: total,
        payment_method: method,
        status: "completed",
        items: cart,
        payment_proof: null,
        employee_number: "ADMIN"
      }]).select();

      if (error && (
        error.message?.includes("schema cache") || 
        error.message?.includes("employee_number") ||
        error.details?.includes("schema cache") ||
        error.code === '42703' ||
        error.code === 'PGRST204'
      )) {
        const fallback = await supabase.from('orders').insert([{
          customer_email: `In-Store Walk-in | Ph: ${customerPhone || "N/A"}`,
          total_amount: total,
          payment_method: method,
          status: "completed",
          items: cart,
          payment_proof: null
        }]).select();
        data = fallback.data;
        error = fallback.error;
      }

      if (error) throw error;

      alert(`${method === 'cash' ? 'Cash' : 'QR'} Order successful!`);

      const orderId = data?.[0]?.id;
      if (customerPhone && customerPhone.length >= 10 && orderId) {
        const formattedPhone = customerPhone.startsWith('+') ? customerPhone.replace('+', '') : `91${customerPhone}`;
        const message = encodeURIComponent(`Hello from Melted Stories\nYour order has been confirmed.\nOrder ID: #${orderId.slice(0, 8)}\nTotal Amount: ₹${total}\nThank you for visiting us!`);
        window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
      }

      setCart([]);
      setCustomerPhone("");
      setShowQr(false);
      onOrderCompleted();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fadeUp pt-2 w-full">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="font-serif text-2xl text-choco"></h2>
          <p className="text-muted-w text-[10px] uppercase tracking-widest font-black mt-1">Walk-in Cash Orders</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex-1">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/40" />
            <input type="text" placeholder="Search menu..." value={search} onChange={e => setSearch(e.target.value)} className="w-full input-cream border border-amber-200/50 rounded-xl pl-9 pr-3 py-2 text-xs" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none mask-gradient pr-4">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors ${category === c ? 'btn-choco shadow-md' : 'bg-white/60 text-mocha hover:bg-white/90 border border-amber-200/40'}`}>{c}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 pr-2 pb-6">
            {filtered.map(p => (
              <div key={p.id} onClick={() => addToCart(p)} className="card-cream p-3 rounded-xl cursor-pointer hover:scale-[1.03] transition-transform border border-amber-200/40 flex flex-col justify-between shadow-sm hover:shadow-md">
                <div>
                  <h3 className="text-xs font-extrabold text-choco leading-tight mb-2">{p.name}</h3>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gold font-extrabold text-xs">₹{p.price}</span>
                  <div className="w-6 h-6 rounded-md btn-choco flex items-center justify-center"><Plus className="w-3 h-3 text-amber-200" /></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="pos-cart" className="w-full flex flex-col card-cream rounded-2xl p-5 border-2 border-gold/30 shadow-lg z-10 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-choco text-sm flex items-center"><ShoppingBag className="w-4 h-4 mr-2 text-gold" /> Current Order</h3>
            <input
              type="tel"
              placeholder="Customer Phone (For Receipt)"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              className="input-cream border border-amber-200/50 rounded-xl px-3 py-1.5 text-xs w-48 focus:ring-2 focus:ring-gold/50 outline-none"
            />
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pr-1 mb-4">
            {cart.map(item => (
              <div key={item.cartItemId} className="bg-white/60 p-2.5 rounded-xl border border-amber-200/40 shadow-sm relative group">
                <button onClick={() => remove(item.cartItemId)} className="absolute -top-1.5 -right-1.5 bg-red-100 text-red-500 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-red-200"><Trash2 className="w-3 h-3" /></button>
                <div className="mb-2 pr-2">
                  <span className="text-[11px] font-bold text-choco leading-tight block">{item.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gold">₹{item.price * item.quantity}</span>
                  <div className="flex items-center gap-1.5 bg-amber-50 rounded-lg border border-amber-200/50 px-1 py-1">
                    <button onClick={() => updateQty(item.cartItemId, -1)} className="text-mocha hover:text-red-500 w-4 h-4 flex items-center justify-center bg-white rounded"><Minus className="w-3 h-3" /></button>
                    <span className="text-[10px] font-black text-choco w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.cartItemId, 1)} className="text-mocha hover:text-green-600 w-4 h-4 flex items-center justify-center bg-white rounded"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-40">
                <ShoppingCart className="w-8 h-8 text-choco mb-2" />
                <p className="text-[10px] text-choco font-bold uppercase tracking-wider">Empty Order</p>
              </div>
            )}
          </div>

          <div className="pt-5 border-t-2 border-dashed border-amber-200/50 bg-amber-50/50 -mx-5 -mb-5 p-5 rounded-b-2xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black text-choco uppercase tracking-wider">Total Amount</span>
              <span className="text-xl font-black text-gold">₹{total}</span>
            </div>
            {showQr ? (
              <div className="flex flex-col items-center animate-fadeIn bg-white p-4 rounded-2xl border border-amber-200/50 mb-2 max-w-sm mx-auto">
                <p className="text-xs font-black text-choco uppercase tracking-wider mb-2">Scan to Pay</p>
                <div className="p-2 mb-3 border-2 border-gold/30 rounded-xl bg-white flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=ismailqudsi2004-1@okicici&pn=MeltedStories&am=${total}&cu=INR`)}`}
                    alt="Dynamic UPI QR Code"
                    className="w-32 h-32 object-contain"
                  />
                </div>
                <div className="flex gap-2 w-full">
                  <button onClick={() => setShowQr(false)} className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                    Cancel
                  </button>
                  <button onClick={() => handleCheckout('upi')} disabled={isSubmitting} className="flex-[2] bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center transition-all shadow-md">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Done"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => handleCheckout('cash')} disabled={isSubmitting || cart.length === 0} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest disabled:opacity-50 flex items-center justify-center transition-all shadow-md active:scale-95">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "CASH"}
                </button>
                <button onClick={() => {
                  if (!customerPhone || customerPhone.length < 10) {
                    alert("Please enter a valid customer phone number first!");
                    return;
                  }
                  setShowQr(true);
                }} disabled={isSubmitting || cart.length === 0} className="flex-[2] bg-green-600 hover:bg-green-500 text-white py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest disabled:opacity-50 flex items-center justify-center transition-all shadow-md active:scale-95">
                  PAY VIA QR
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-sm">
          <button
            onClick={() => document.getElementById('pos-cart')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full bg-green-600 text-white shadow-xl rounded-2xl py-3 px-4 flex items-center justify-between font-bold text-xs"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>{cart.reduce((s, i) => s + i.quantity, 0)} Items</span>
            </div>
            <span>View Cart • ₹{total}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminEmail, setAdminEmail] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [proofModal, setProofModal] = useState<string | null>(null);
  const [itemsModal, setItemsModal] = useState<{ title: string, data: Record<string, number> } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [employeeActivity, setEmployeeActivity] = useState<any[]>([]);
  const [selectedActivityPreview, setSelectedActivityPreview] = useState<{ id: string, itemsSold: number, totalRevenue: number } | null>(null);
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [showMonthlyPreview, setShowMonthlyPreview] = useState(false);
  const [showMonthlyProfitPreview, setShowMonthlyProfitPreview] = useState(false);
  const [dbSetupRequired, setDbSetupRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Failed to fetch orders:", error);
    if (data) setOrders(data);
  };

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });
    if (error) console.error("Failed to fetch expenses:", error);
    if (data) setExpenses(data);
  };

  const fetchEmployeeActivity = async () => {
    const { data, error } = await supabase
      .from("employee_activity")
      .select("*")
      .order("login_time", { ascending: false });
    if (error) {
      console.error("Failed to fetch employee activity:", error);
      if (error.code === '42P01' || error.message?.includes('schema cache')) {
        setDbSetupRequired(true);
      }
    }
    if (data) setEmployeeActivity(data);
  };

  useEffect(() => {
    let channel: any = null;

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?role=admin");
        return;
      }
      
      const isAdmin = user.email === "meltedstoriesab@gmail.com";
      const isEmployee = user.email?.endsWith("@employee.meltedstories.com");

      if (isEmployee) {
        router.push("/employee");
        return;
      }

      if (!isAdmin) {
        alert("Access Denied: Admin privileges required.");
        await supabase.auth.signOut();
        router.push("/login?role=admin");
        return;
      }
      
      setAdminEmail(user.email || "");
      fetchOrders();
      fetchExpenses();
      fetchEmployeeActivity();
      setIsLoading(false);

      // Initialize realtime channel after successful authentication
      channel = supabase
        .channel(`admin-realtime-${Date.now()}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          (payload) => {
            console.log("[Admin Realtime] Orders change:", payload.eventType);
            fetchOrders();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "expenses" },
          (payload) => {
            console.log("[Admin Realtime] Expenses change:", payload.eventType);
            fetchExpenses();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "employee_activity" },
          (payload) => {
            console.log("[Admin Realtime] Activity change:", payload.eventType);
            fetchEmployeeActivity();
          }
        )
        .subscribe((status) => {
          console.log("[Admin Realtime] Channel status:", status);
        });
    };
    checkUser();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [router]);

  const updateStatus = async (id: string, newStatus: string, email: string) => {
    setUpdatingId(id);

    try {
      // 1. Direct client-side update to ensure RLS session is used directly
      const { data, error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Client-side update error:", error);
        alert("Failed to update database: " + error.message);
        setUpdatingId(null);
        return;
      }

      if (!data || data.length === 0) {
        console.warn("No rows updated. RLS policy might be blocking the update.");
        alert("Failed to update: Order not found or not authorized.");
        setUpdatingId(null);
        return;
      }

      console.log("Successfully updated order status to", newStatus, "in database directly");

      // Update local state immediately
      setOrders(orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));

      // 2. Asynchronously call backend solely to trigger the email notification
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (token) {
        fetch("/api/order/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ id, status: newStatus, email, skipDbUpdate: true }),
        }).catch((err) => {
          console.error("Error triggering email notification:", err);
        });
      }
    } catch (err: any) {
      console.error("Failed to update status:", err);
      alert("Error: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login?role=admin");
  };

  // Revenue calculations
  const completedOrders = orders.filter((o) => o.status === "completed");
  const todayStr = new Date().toDateString();
  const todayOrders = completedOrders.filter((o) => new Date(o.created_at).toDateString() === todayStr);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const totalCashRevenue = completedOrders.filter((o) => o.payment_method === "cash").reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const totalUpiRevenue = completedOrders.filter((o) => o.payment_method !== "cash").reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const totalProductsSold = completedOrders.reduce((sum, o) => {
    const items = o.items || [];
    return sum + items.reduce((s: number, i: any) => s + (i.quantity || 1), 0);
  }, 0);

  const allItemsBreakdown: Record<string, number> = {};
  const waffleBreakdown: Record<string, number> = {};
  const meltBowlBreakdown: Record<string, number> = {};

  completedOrders.forEach((o) => {
    const items = o.items || [];
    items.forEach((i: any) => {
      const name = i.name;
      const lowerName = name.toLowerCase();
      const qty = i.quantity || 1;

      allItemsBreakdown[name] = (allItemsBreakdown[name] || 0) + qty;

      if (lowerName.includes("waffle")) {
        waffleBreakdown[name] = (waffleBreakdown[name] || 0) + qty;
      } else if ((lowerName.includes("bowl") || lowerName.includes("melt")) && !lowerName.includes("waffle") && !lowerName.includes("bite") && !lowerName.includes("pancake")) {
        meltBowlBreakdown[name] = (meltBowlBreakdown[name] || 0) + qty;
      }
    });
  });

  const totalWaffles = Object.values(waffleBreakdown).reduce((sum, qty) => sum + qty, 0);
  const totalMeltBowls = Object.values(meltBowlBreakdown).reduce((sum, qty) => sum + qty, 0);

  // Group revenue by date
  const revenueByDate: { [key: string]: { revenue: number; orders: number; items: number } } = {};
  completedOrders.forEach((o) => {
    const dateKey = getLocalYYYYMMDD(new Date(o.created_at));
    if (!revenueByDate[dateKey]) revenueByDate[dateKey] = { revenue: 0, orders: 0, items: 0 };
    revenueByDate[dateKey].revenue += Number(o.total_amount) || 0;
    revenueByDate[dateKey].orders += 1;
    const items = o.items || [];
    revenueByDate[dateKey].items += items.reduce((s: number, i: any) => s + (i.quantity || 1), 0);
  });

  const generatePDF = async () => {
    setGeneratingReport(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      await import("jspdf-autotable");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(26, 26, 26);
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setTextColor(212, 168, 83);
      doc.setFontSize(22);
      doc.text("Melted Stories", pageWidth / 2, 20, { align: "center" });
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text("Revenue Report (Indian Rupees)", pageWidth / 2, 28, { align: "center" });
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 34, { align: "center" });

      // Summary Cards
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(14);
      doc.text("Summary", 14, 52);

      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Today's Revenue: INR ${todayRevenue.toFixed(2)}`, 14, 62);
      doc.text(`Total Revenue: INR ${totalRevenue.toFixed(2)}`, 14, 70);
      doc.text(`Cash Revenue: INR ${totalCashRevenue.toFixed(2)}`, 14, 78);
      doc.text(`UPI Revenue: INR ${totalUpiRevenue.toFixed(2)}`, 14, 86);
      doc.text(`Total Orders Completed: ${completedOrders.length}`, 14, 94);
      doc.text(`Total Products Sold: ${totalProductsSold}`, 14, 102);

      // Items Table
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text("Item Breakdown", 14, 116);

      const itemsTableData = Object.entries(allItemsBreakdown)
        .sort((a, b) => b[1] - a[1])
        .map(([name, qty]) => [name, qty.toString()]);

      (doc as any).autoTable({
        startY: 122,
        head: [["Item Name", "Quantity Sold"]],
        body: itemsTableData.length > 0 ? itemsTableData : [["No items", "-"]],
        theme: "grid",
        headStyles: { fillColor: [212, 168, 83], textColor: [26, 26, 26], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { fontSize: 9 },
      });

      // Revenue Table
      const dailyY = (doc as any).lastAutoTable.finalY + 14;
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text("Daily Breakdown", 14, dailyY);

      const tableData = Object.entries(revenueByDate).map(([date, data]) => [
        date,
        data.orders.toString(),
        data.items.toString(),
        `INR ${data.revenue.toFixed(2)}`,
      ]);

      (doc as any).autoTable({
        startY: dailyY + 6,
        head: [["Date", "Orders", "Items Sold", "Revenue"]],
        body: tableData.length > 0 ? tableData : [["No data", "-", "-", "INR 0.00"]],
        theme: "grid",
        headStyles: { fillColor: [212, 168, 83], textColor: [26, 26, 26], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { fontSize: 9 },
      });

      // Order Details
      const finalY = (doc as any).lastAutoTable.finalY + 14;
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text("Order Details", 14, finalY);

      const orderTableData = completedOrders.map((o) => {
        const itemNames = (o.items || []).map((i: any) => `${i.quantity || 1}x ${i.name}`).join(", ");
        return [
          `#${o.id.slice(0, 8)}`,
          o.customer_email || "N/A",
          itemNames || "N/A",
          `INR ${Number(o.total_amount || 0).toFixed(2)}`,
          new Date(o.created_at).toLocaleString(),
        ];
      });

      (doc as any).autoTable({
        startY: finalY + 6,
        head: [["Order ID", "Customer", "Items", "Amount", "Date"]],
        body: orderTableData.length > 0 ? orderTableData : [["No orders", "-", "-", "-", "-"]],
        theme: "grid",
        headStyles: { fillColor: [212, 168, 83], textColor: [26, 26, 26], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: { 2: { cellWidth: 50 } },
      });

      doc.save(`melted-stories-report-${getLocalYYYYMMDD()}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate report. Please try again.");
    } finally {
      setGeneratingReport(false);
    }
  };

  const badgeClass = (s: string) => s === "ready" ? "badge-ready" : s === "completed" ? "badge-completed" : "badge-pending";

  const activeOrders = orders.filter((o) => o.status === "pending" || o.status === "paid" || o.status === "ready");
  const historyOrders = orders.filter((o) => o.status === "completed" || o.status === "cancelled");

  // Expenses calculations
  const todayExpenseStr = getLocalYYYYMMDD(); // YYYY-MM-DD
  const currentMonthPrefix = todayExpenseStr.slice(0, 7); // YYYY-MM

  const todayInvestment = expenses
    .filter(e => e.date === todayExpenseStr)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const monthlyInvestment = expenses
    .filter(e => e.date.startsWith(currentMonthPrefix))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const monthlyOrders = completedOrders.filter(o => {
    const oDate = getLocalYYYYMMDD(new Date(o.created_at));
    return oDate.startsWith(currentMonthPrefix);
  });
  const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const todayProfit = todayRevenue - todayInvestment;
  const monthlyProfit = monthlyRevenue - monthlyInvestment;

  const expensesByDate = expenses
    .filter(e => e.date.startsWith(currentMonthPrefix))
    .reduce((acc, e) => {
      acc[e.date] = (acc[e.date] || 0) + Number(e.amount);
      return acc;
    }, {} as Record<string, number>);

  const revenueByDateForProfit = monthlyOrders.reduce((acc, o) => {
    const oDate = getLocalYYYYMMDD(new Date(o.created_at));
    acc[oDate] = (acc[oDate] || 0) + (Number(o.total_amount) || 0);
    return acc;
  }, {} as Record<string, number>);

  const profitByDate: Record<string, number> = {};
  Array.from(new Set([...Object.keys(revenueByDateForProfit), ...Object.keys(expensesByDate)])).forEach(date => {
    const rev = revenueByDateForProfit[date] || 0;
    const exp = expensesByDate[date] || 0;
    profitByDate[date] = rev - exp;
  });

  const handleAddExpense = async () => {
    if (!newExpenseAmount || isNaN(Number(newExpenseAmount)) || Number(newExpenseAmount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    setIsSubmittingExpense(true);
    try {
      const { error } = await supabase.from('expenses').insert([{
        amount: Number(newExpenseAmount),
        date: getLocalYYYYMMDD()
      }]);
      if (error) throw error;
      setNewExpenseAmount("");
      fetchExpenses();
      alert("Expense added successfully!");
    } catch (err: any) {
      alert("Error adding expense: " + err.message);
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  const allTabs = [
    { id: "dashboard", label: "Orders", icon: LayoutDashboard },
    { id: "pos", label: "POS", icon: ShoppingBag },
    { id: "revenue", label: "Revenue", icon: TrendingUp },
    { id: "expenses", label: "Expenses", icon: Banknote },
    { id: "profile", label: "Profile", icon: User },
  ];

  const tabs = allTabs;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin mb-4" />
        <p className="text-gold font-serif tracking-widest uppercase text-sm">Loading Portal...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-luxury pb-24 relative">
      {/* Database Setup Warning Banner */}
      {dbSetupRequired && (
        <div className="bg-red-950 border-b-2 border-red-500 p-4 sticky top-0 z-[100] backdrop-blur-md shadow-2xl">
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-red-300 font-bold text-lg font-serif tracking-wide uppercase">Database Setup Required</h3>
                <p className="text-red-200/90 text-sm mt-1 leading-relaxed">
                  The Employee Activity tracking and POS linking features are currently <strong className="text-white">DISABLED</strong> because the required database tables do not exist in your Supabase project. 
                  <br/>
                  You <strong>MUST</strong> copy and execute the following SQL script in your Supabase SQL Editor to enable these features.
                </p>
              </div>
            </div>
            <div className="bg-black/80 p-3 rounded-lg relative font-mono text-[11px] text-amber-200/80 border border-red-500/30 overflow-x-auto shadow-inner">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS employee_number TEXT;\n\nCREATE TABLE IF NOT EXISTS public.employee_activity (\n    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n    employee_number TEXT NOT NULL,\n    login_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,\n    logout_time TIMESTAMP WITH TIME ZONE\n);\n\nALTER TABLE public.employee_activity ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "Allow public to insert employee_activity" ON public.employee_activity FOR INSERT WITH CHECK (true);\nCREATE POLICY "Allow public to update employee_activity" ON public.employee_activity FOR UPDATE USING (true);\nCREATE POLICY "Allow admin to read employee_activity" ON public.employee_activity FOR SELECT USING (auth.uid() IS NOT NULL);\n\nNOTIFY pgrst, 'reload schema';`);
                  alert('SQL Copied to clipboard! Go to your Supabase Dashboard -> SQL Editor -> New query, paste and run it.');
                }}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-colors shadow-md"
              >
                Copy SQL
              </button>
              <pre className="pr-24 whitespace-pre-wrap leading-relaxed">
{`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS employee_number TEXT;

CREATE TABLE IF NOT EXISTS public.employee_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_number TEXT NOT NULL,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    logout_time TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.employee_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public to insert employee_activity" ON public.employee_activity FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public to update employee_activity" ON public.employee_activity FOR UPDATE USING (true);
CREATE POLICY "Allow admin to read employee_activity" ON public.employee_activity FOR SELECT USING (auth.uid() IS NOT NULL);

NOTIFY pgrst, 'reload schema';`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Payment Proof Modal */}
      {proofModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={() => setProofModal(null)}>
          <div className="relative max-w-sm w-full mx-4 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <button onClick={() => setProofModal(null)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg z-10 hover:bg-red-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <img src={proofModal} alt="Payment proof" className="w-full rounded-2xl border-2 border-gold/40 shadow-2xl" />
            <p className="text-center text-amber-200/60 text-[10px] mt-2 font-bold uppercase tracking-wider">Payment Proof Screenshot</p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-50 header-cream">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="w-20"></div> {/* spacer */}
          <span className="text-lg font-serif text-gradient-gold tracking-[0.2em] uppercase">Admin Panel</span>
          <button onClick={() => setActiveTab("pos")} className="text-[10px] font-bold text-choco bg-gold hover:bg-gold-light px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm hover:scale-105 transition-all">
            + COD POS
          </button>
        </div>
      </header>

      <div className={`mx-auto px-4 pt-5 pb-24 ${activeTab === 'pos' ? 'max-w-5xl' : 'max-w-2xl'}`}>
        {/* ═══════════ POS TAB ═══════════ */}
        {activeTab === "pos" && (
          <AdminPOS
            onOrderCompleted={() => {
              fetchOrders();
              setActiveTab("dashboard");
            }}
            onCancel={() => setActiveTab("dashboard")}
          />
        )}

        {/* ═══════════ DASHBOARD TAB ═══════════ */}
        {activeTab === "dashboard" && (
          <div className="animate-fadeUp">
            <div className="mb-5">
              <h2 className="font-serif text-2xl text-choco">Overview</h2>
              <p className="text-muted-w text-sm mt-0.5">Manage your cafe's orders</p>
            </div>

            {/* Stats Bar with Rich Dark Chocolate Styling */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="card-choco rounded-2xl p-5 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-300" />
                <p className="text-amber-100 text-3xl font-black tracking-tight">{activeOrders.length}</p>
                <p className="text-amber-200/50 text-[10px] font-black uppercase tracking-widest mt-1">Active</p>
              </div>
              <div className="card-choco rounded-2xl p-5 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-300" />
                <p className="text-emerald-400 text-3xl font-black tracking-tight">{historyOrders.length}</p>
                <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest mt-1">Completed</p>
              </div>
              <div className="card-choco rounded-2xl p-5 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold to-gold-light" />
                <p className="text-gradient-gold text-3xl font-black tracking-tight">{orders.length}</p>
                <p className="text-amber-200/50 text-[10px] font-black uppercase tracking-widest mt-1">Total</p>
              </div>
            </div>

            {/* Active Orders */}
            <h2 className="text-sm font-bold text-choco mb-4 flex items-center uppercase tracking-wider">
              <Clock className="w-4 h-4 mr-2 text-gold animate-pulse" /> Active Orders
            </h2>
            <div className="space-y-4 mb-8">
              {activeOrders.map((order) => (
                <div key={order.id} className="card-choco rounded-3xl p-6 transition-all border border-amber-500/20 hover:border-gold/50 shadow-2xl relative group overflow-hidden">
                  {/* Subtle top neon border for status */}
                  {order.status === "ready" && (
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-green-500 to-emerald-400 animate-pulse" />
                  )}
                  {(order.status === "pending" || order.status === "paid") && (
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 to-gold animate-pulse" />
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-amber-200/40 text-[10px] font-mono tracking-widest uppercase font-black">
                          #{order.id.slice(0, 10).toUpperCase()}
                        </p>
                        {order.payment_proof && (
                          <button onClick={() => setProofModal(order.payment_proof)} className="flex-shrink-0 group">
                            <img src={order.payment_proof} alt="Proof" className="w-8 h-8 rounded-md object-cover border border-gold/40 group-hover:border-gold transition-colors shadow-sm" />
                          </button>
                        )}
                      </div>
                      {(() => {
                        const phone = order.phone_number;
                        const emailStr = order.customer_email || (phone ? "Online Order" : "No email");
                        const parts = emailStr.split(" | Ph: ");
                        return (
                          <>
                            <p className="text-amber-100 font-extrabold text-sm mt-1">{parts[0]}</p>
                            {(phone || parts[1]) && <p className="text-amber-200/80 text-xs mt-0.5 flex items-center gap-1">📞 {phone || parts[1]}</p>}
                          </>
                        );
                      })()}
                      <p className="text-[10px] text-amber-200/50 mt-0.5">
                        Placed: {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full flex-shrink-0 ${order.status === "ready"
                        ? "text-green-400 bg-green-500/10 border border-green-500/30"
                        : order.status === "paid"
                          ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
                          : "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                      }`}>
                      {order.status === "paid" ? "🟢 PAID" : order.status}
                    </span>
                  </div>

                  <div className="border-t border-dashed border-amber-200/10 my-4" />

                  <ul className="text-amber-200/80 text-xs mb-5 space-y-2">
                    {order.items?.map((item: any, idx: number) => (
                      <li key={idx} className="flex items-start justify-between bg-amber-950/20 p-2.5 rounded-xl border border-amber-900/30">
                        <div className="flex items-start">
                          <span className="text-gold font-black mr-2 bg-gold/10 px-2 py-0.5 rounded text-[10px] border border-gold/20">
                            {item.quantity || 1}x
                          </span>
                          <div>
                            <span className="font-extrabold text-amber-100">{item.name}</span>
                            {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                              <span className="block text-[9px] text-amber-300/60 mt-0.5">
                                + {item.selectedAddOns.map((a: any) => a.name).join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-amber-200/70">₹{item.price * (item.quantity || 1)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex gap-3 mt-4">
                    {(order.status === "pending" || order.status === "paid") && (
                      <>
                        <button
                          onClick={() => updateStatus(order.id, "cancelled", order.customer_email)}
                          disabled={updatingId === order.id}
                          className="flex-1 bg-red-950/40 text-red-400 border border-red-500/20 py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:bg-red-900/40 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, "ready", order.customer_email)}
                          disabled={updatingId === order.id}
                          className="flex-[2] btn-gold py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                        >
                          {updatingId === order.id ? (
                            <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Updating...</>
                          ) : (
                            <><CheckCircle className="w-4 h-4 mr-1" /> Mark Ready</>
                          )}
                        </button>
                      </>
                    )}
                    {order.status === "ready" && (
                      <>
                        <button
                          onClick={() => updateStatus(order.id, "cancelled", order.customer_email)}
                          disabled={updatingId === order.id}
                          className="flex-1 bg-red-950/40 text-red-400 border border-red-500/20 py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:bg-red-900/40 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, "completed", order.customer_email)}
                          disabled={updatingId === order.id}
                          className="flex-[2] bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest border border-green-500/20 py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center text-[10px] disabled:opacity-50"
                        >
                          {updatingId === order.id ? (
                            <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Updating...</>
                          ) : (
                            <><CheckCircle2 className="w-4 h-4 mr-1 text-white" /> Complete</>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {activeOrders.length === 0 && (
                <div className="text-center py-12 card-choco rounded-2xl border border-amber-900/30">
                  <Package className="w-10 h-10 text-amber-200/20 mx-auto mb-3" />
                  <p className="text-amber-200/50 text-sm font-semibold">No active orders right now</p>
                </div>
              )}
            </div>

            {/* Order History */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between text-sm font-bold text-choco mb-3 uppercase tracking-wider hover:text-gold transition-colors"
            >
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-muted-w" /> Order History
              </div>
              {showHistory ? <ChevronUp className="w-5 h-5 text-gold" /> : <ChevronDown className="w-5 h-5 text-gold" />}
            </button>

            {showHistory && (
              <div className="space-y-2 mb-6 animate-fadeIn">
                {historyOrders.slice(0, 10).map((order) => (
                  <div key={order.id} className="card-choco rounded-xl p-4 border border-amber-900/30 flex justify-between items-center relative overflow-hidden">
                    {order.status === "cancelled" && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />
                    )}
                    {order.status === "completed" && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
                    )}
                    <div className="pl-2">
                      <div className="flex items-center gap-2">
                        <p className="text-amber-200/40 text-xs font-mono font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
                        {order.status === "cancelled" && (
                          <span className="text-[8px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">Cancelled</span>
                        )}
                        {order.status === "completed" && order.payment_method && (
                          <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            Paid by {order.payment_method === 'cash' ? 'Cash' : 'QR'}
                          </span>
                        )}
                      </div>
                      {(() => {
                        const phone = order.phone_number;
                        const emailStr = order.customer_email || (phone ? "Online Order" : "No email");
                        const parts = emailStr.split(" | Ph: ");
                        return (
                          <>
                            <p className="text-amber-200/70 text-xs font-medium">{parts[0]}</p>
                            {(phone || parts[1]) && <p className="text-amber-200/50 text-[10px] mt-0.5">📞 {phone || parts[1]}</p>}
                          </>
                        );
                      })()}
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${order.status === 'cancelled' ? 'text-amber-200/40 line-through' : 'text-gradient-gold'}`}>
                        ₹{Number(order.total_amount || 0).toFixed(2)}
                      </p>
                      <p className="text-amber-200/30 text-[10px]">{new Date(order.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                {historyOrders.length === 0 && (
                  <p className="text-muted-w text-sm text-center py-6">No completed orders yet</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ REVENUE TAB ═══════════ */}
        {activeTab === "revenue" && (
          <div className="animate-fadeUp">
            <div className="mb-6">
              <h2 className="font-serif text-2xl text-choco">Revenue</h2>
              <p className="text-muted-w text-sm mt-0.5">Track your cafe's performance</p>
            </div>

            {/* Revenue Cards with Deep Chocolate Dark Theme */}
            <div className="grid grid-cols-2 gap-4 mb-8" style={{ position: 'relative', zIndex: 1 }}>
              <div className="card-choco rounded-2xl p-5 relative overflow-hidden group border border-amber-900/30">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-gold" />
                <TrendingUp className="w-5 h-5 text-gold mb-3" />
                <p className="text-gradient-gold text-2xl font-black">₹{todayRevenue.toFixed(2)}</p>
                <p className="text-amber-200/50 text-[10px] font-black uppercase tracking-widest mt-1">Today's Revenue</p>
              </div>
              <div className="card-choco rounded-2xl p-5 relative overflow-hidden group border border-amber-900/30">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400" />
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-3" />
                <p className="text-emerald-400 text-2xl font-black">₹{totalRevenue.toFixed(2)}</p>
                <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest mt-1">Total Revenue</p>
              </div>
              <div className="card-choco rounded-2xl p-5 relative overflow-hidden group border border-amber-900/30">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-400" />
                <Banknote className="w-5 h-5 text-orange-400 mb-3" />
                <p className="text-orange-400 text-2xl font-black">₹{totalCashRevenue.toFixed(2)}</p>
                <p className="text-orange-500/60 text-[10px] font-black uppercase tracking-widest mt-1">Cash Revenue</p>
              </div>
              <div className="card-choco rounded-2xl p-5 relative overflow-hidden group border border-amber-900/30">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-400" />
                <Smartphone className="w-5 h-5 text-purple-400 mb-3" />
                <p className="text-purple-400 text-2xl font-black">₹{totalUpiRevenue.toFixed(2)}</p>
                <p className="text-purple-500/60 text-[10px] font-black uppercase tracking-widest mt-1">UPI Revenue</p>
              </div>
              <div className="card-choco rounded-2xl p-5 relative overflow-hidden group border border-amber-900/30">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-amber-400" />
                <ShoppingBag className="w-5 h-5 text-amber-300 mb-3" />
                <p className="text-amber-100 text-2xl font-black">{totalProductsSold}</p>
                <p className="text-amber-200/50 text-[10px] font-black uppercase tracking-widest mt-1">Products Sold</p>
              </div>
              <div className="card-choco rounded-2xl p-5 relative overflow-hidden group border border-amber-900/30">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-400" />
                <BarChart3 className="w-5 h-5 text-blue-400 mb-3" />
                <p className="text-blue-400 text-2xl font-black">{completedOrders.length}</p>
                <p className="text-blue-500/60 text-[10px] font-black uppercase tracking-widest mt-1">Orders Completed</p>
              </div>
            </div>

            {/* Items */}
            <h3 className="text-sm font-bold text-choco mb-4 uppercase tracking-wider relative z-10">Items</h3>
            <div className="grid grid-cols-2 gap-4 mb-4" style={{ position: 'relative', zIndex: 10 }}>
              <div
                className={`card-choco rounded-2xl p-5 relative overflow-hidden group border transition-colors cursor-pointer ${itemsModal?.title === 'Waffles Sold' ? 'border-gold/50' : 'border-amber-900/30 hover:border-gold/50'}`}
                onClick={() => setItemsModal(prev => prev?.title === "Waffles Sold" ? null : { title: "Waffles Sold", data: waffleBreakdown })}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-amber-400 group-hover:h-2 transition-all" />
                <Package className="w-5 h-5 text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-yellow-400 text-2xl font-black">{totalWaffles}</p>
                <p className="text-yellow-500/60 text-[10px] font-black uppercase tracking-widest mt-1">Waffles Sold</p>
              </div>
              <div
                className={`card-choco rounded-2xl p-5 relative overflow-hidden group border transition-colors cursor-pointer ${itemsModal?.title === 'Melt Bowls Sold' ? 'border-gold/50' : 'border-amber-900/30 hover:border-gold/50'}`}
                onClick={() => setItemsModal(prev => prev?.title === "Melt Bowls Sold" ? null : { title: "Melt Bowls Sold", data: meltBowlBreakdown })}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-400 group-hover:h-2 transition-all" />
                <Package className="w-5 h-5 text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-red-400 text-2xl font-black">{totalMeltBowls}</p>
                <p className="text-red-500/60 text-[10px] font-black uppercase tracking-widest mt-1">Melt Bowls Sold</p>
              </div>
            </div>

            {/* Inline Items Breakdown */}
            {itemsModal && (
              <div className="card-choco border border-amber-500/30 rounded-2xl p-6 shadow-xl mb-8 animate-fadeUp relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-serif text-xl text-gradient-gold">{itemsModal.title} Breakdown</h3>
                  <button onClick={() => setItemsModal(null)} className="text-amber-200/50 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(itemsModal.data).sort((a, b) => b[1] - a[1]).map(([name, qty]) => (
                    <div key={name} className="flex justify-between items-center bg-amber-950/20 p-3 rounded-xl border border-amber-900/30">
                      <span className="text-amber-100 font-medium text-sm">{name}</span>
                      <span className="text-gold font-black bg-gold/10 px-2 py-1 rounded text-xs border border-gold/20">{qty}</span>
                    </div>
                  ))}
                  {Object.keys(itemsModal.data).length === 0 && (
                    <div className="text-center py-6 text-amber-200/50 text-sm">
                      No items sold yet.
                    </div>
                  )}
                </div>
              </div>
            )}



            {/* Daily Breakdown */}
            <h3 className="text-sm font-bold text-choco mb-4 uppercase tracking-wider">Daily Breakdown</h3>
            <div className="space-y-2 mb-6">
              {Object.entries(revenueByDate).length > 0 ? (
                Object.entries(revenueByDate).map(([date, data]) => (
                  <div key={date} className="card-choco rounded-xl p-4 border border-amber-900/30 flex items-center justify-between">
                    <div>
                      <p className="text-amber-100 font-bold text-sm">{date}</p>
                      <p className="text-amber-200/50 text-xs">{data.orders} orders • {data.items} items</p>
                    </div>
                    <p className="text-gold font-extrabold">₹{data.revenue.toFixed(2)}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 card-choco rounded-2xl">
                  <BarChart3 className="w-8 h-8 text-amber-200/30 mx-auto mb-2" />
                  <p className="text-amber-200/50 text-sm">No revenue data yet</p>
                </div>
              )}
            </div>

            {/* Download Report */}
            <button
              onClick={generatePDF}
              disabled={generatingReport}
              className="btn-gold w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm disabled:opacity-50 font-black uppercase tracking-widest"
            >
              {generatingReport ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Report...</>
              ) : (
                <><Download className="w-4 h-4 mr-2" /> Download Revenue Report (PDF)</>
              )}
            </button>
          </div>
        )}

        {/* ═══════════ EXPENSES TAB ═══════════ */}
        {activeTab === "expenses" && (
          <div className="animate-fadeUp">
            <div className="mb-6">
              <h2 className="font-serif text-2xl text-choco">Expenses</h2>
              <p className="text-muted-w text-sm mt-0.5">Manage your daily outgoings</p>
            </div>

            <div className="card-choco rounded-3xl p-6 mb-8 border border-amber-500/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-400" />
              <h3 className="text-amber-100 font-bold mb-4 flex items-center"><Plus className="w-4 h-4 mr-2 text-gold" /> Add Today's Investment</h3>

              <div className="flex flex-col gap-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-amber-500">₹</span>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                    className="w-full bg-black/40 border border-amber-900/50 rounded-xl py-3 pl-10 pr-4 text-amber-100 font-bold focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewExpenseAmount("")}
                    className="flex-1 bg-red-950/40 text-red-400 border border-red-500/20 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-red-900/40 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddExpense}
                    disabled={isSubmittingExpense || !newExpenseAmount}
                    className="flex-[2] btn-gold py-3 rounded-xl font-black text-[11px] uppercase tracking-widest disabled:opacity-50 flex items-center justify-center transition-all"
                  >
                    {isSubmittingExpense ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Expense"}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="card-choco rounded-2xl p-5 relative overflow-hidden border border-amber-900/30">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-gold" />
                <p className="text-amber-200/50 text-[10px] font-black uppercase tracking-widest mb-1">Today's Investment</p>
                <p className="text-gradient-gold text-2xl font-black">₹{todayInvestment.toFixed(2)}</p>
              </div>
              <div
                onClick={() => setShowMonthlyPreview(!showMonthlyPreview)}
                className="card-choco rounded-2xl p-5 relative overflow-hidden border border-amber-900/30 cursor-pointer hover:border-gold/50 transition-colors group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-gold" />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-amber-200/50 text-[10px] font-black uppercase tracking-widest mb-1">Monthly Investment</p>
                    <p className="text-gradient-gold text-2xl font-black">₹{monthlyInvestment.toFixed(2)}</p>
                  </div>
                  {showMonthlyPreview ? <ChevronUp className="w-4 h-4 text-gold" /> : <ChevronDown className="w-4 h-4 text-gold" />}
                </div>
              </div>

              <div className="card-choco rounded-2xl p-5 relative overflow-hidden border border-amber-900/30">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400" />
                <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest mb-1">Today's Profit</p>
                <p className={`text-2xl font-black ${todayProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {todayProfit >= 0 ? '₹' : '-₹'}{Math.abs(todayProfit).toFixed(2)}
                </p>
              </div>
              <div
                onClick={() => setShowMonthlyProfitPreview(!showMonthlyProfitPreview)}
                className="card-choco rounded-2xl p-5 relative overflow-hidden border border-amber-900/30 cursor-pointer hover:border-emerald-500/50 transition-colors group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400" />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest mb-1">Monthly Profit</p>
                    <p className={`text-2xl font-black ${monthlyProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {monthlyProfit >= 0 ? '₹' : '-₹'}{Math.abs(monthlyProfit).toFixed(2)}
                    </p>
                  </div>
                  {showMonthlyProfitPreview ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-emerald-400" />}
                </div>
              </div>
            </div>

            {showMonthlyPreview && (
              <div className="card-choco rounded-2xl p-5 border border-amber-900/30 animate-fadeIn mb-6">
                <h3 className="text-sm font-bold text-choco mb-4 uppercase tracking-wider">Investment Breakdown (This Month)</h3>
                <div className="space-y-2">
                  {Object.entries(expensesByDate).sort((a, b) => b[0].localeCompare(a[0])).map(([date, amount]) => (
                    <div key={date} className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-amber-900/20">
                      <span className="text-amber-200/80 text-sm font-bold">{new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="text-red-400 font-black">₹{amount.toFixed(2)}</span>
                    </div>
                  ))}
                  {Object.keys(expensesByDate).length === 0 && (
                    <p className="text-amber-200/40 text-xs text-center py-4">No expenses recorded this month.</p>
                  )}
                </div>
              </div>
            )}

            {showMonthlyProfitPreview && (
              <div className="card-choco rounded-2xl p-5 border border-amber-900/30 animate-fadeIn mb-6">
                <h3 className="text-sm font-bold text-choco mb-4 uppercase tracking-wider">Profit Breakdown (This Month)</h3>
                <div className="space-y-2">
                  {Object.entries(profitByDate).sort((a, b) => b[0].localeCompare(a[0])).map(([date, amount]) => (
                    <div key={date} className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-amber-900/20">
                      <span className="text-amber-200/80 text-sm font-bold">{new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className={`font-black ${amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {amount >= 0 ? '₹' : '-₹'}{Math.abs(amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {Object.keys(profitByDate).length === 0 && (
                    <p className="text-amber-200/40 text-xs text-center py-4">No data recorded this month.</p>
                  )}
                </div>
              </div>
            )}

            {/* Employee Activity Section */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-choco mb-4 uppercase tracking-wider">Employee Activity</h3>
              <div className="space-y-3">
                {employeeActivity.map((activity) => {
                  const loginDate = new Date(activity.login_time);
                  const logoutDate = activity.logout_time ? new Date(activity.logout_time) : null;
                  const isSelected = selectedActivityPreview?.id === activity.id;

                  return (
                    <div key={activity.id} className="card-choco rounded-2xl p-4 border border-amber-900/30 overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                      <div 
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedActivityPreview(null);
                          } else {
                            const sessionOrders = orders.filter(o => {
                              if (o.employee_number !== activity.employee_number) return false;
                              const orderTime = new Date(o.created_at).getTime();
                              const loginTime = loginDate.getTime();
                              const logoutTime = logoutDate ? logoutDate.getTime() : Infinity;
                              return orderTime >= loginTime && orderTime <= logoutTime;
                            });
                            
                            const itemsSold = sessionOrders.reduce((sum, o) => {
                              return sum + (o.items || []).reduce((s: number, i: any) => s + (i.quantity || 1), 0);
                            }, 0);
                            
                            const sessionRevenue = sessionOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

                            setSelectedActivityPreview({
                              id: activity.id,
                              itemsSold,
                              totalRevenue: sessionRevenue
                            });
                          }
                        }}
                      >
                        <div className="pl-3">
                          <p className="text-amber-100 font-bold text-sm">{activity.employee_number}</p>
                          <p className="text-amber-200/50 text-xs mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {loginDate.toLocaleString()} - {logoutDate ? logoutDate.toLocaleTimeString() : "Active Now"}
                          </p>
                        </div>
                        <div className="text-right">
                          {logoutDate ? (
                            <p className="text-amber-200/50 text-xs font-semibold">
                              Duration: {((logoutDate.getTime() - loginDate.getTime()) / 1000 / 60 / 60).toFixed(1)} hrs
                            </p>
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">Online</span>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-4 pt-4 border-t border-amber-900/30 pl-3 animate-fadeIn">
                          <p className="text-sm font-semibold text-amber-100 mb-2">Session Summary</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/20 rounded-xl p-3 border border-amber-900/20">
                              <p className="text-amber-200/50 text-[10px] uppercase tracking-widest font-black mb-1">Items Sold</p>
                              <p className="text-amber-100 font-bold">{selectedActivityPreview.itemsSold}</p>
                            </div>
                            <div className="bg-black/20 rounded-xl p-3 border border-amber-900/20">
                              <p className="text-amber-200/50 text-[10px] uppercase tracking-widest font-black mb-1">Session Revenue</p>
                              <p className="text-gold font-bold">₹{selectedActivityPreview.totalRevenue.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {employeeActivity.length === 0 && (
                  <div className="text-center py-6 card-choco rounded-2xl border border-amber-900/30">
                    <User className="w-8 h-8 text-amber-200/30 mx-auto mb-2" />
                    <p className="text-amber-200/50 text-sm">No employee activity recorded yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ PROFILE TAB ═══════════ */}
        {activeTab === "profile" && (
          <div className="animate-fadeUp">
            <div className="mb-6">
              <h2 className="font-serif text-2xl text-choco">Admin Profile</h2>
              <p className="text-muted-w text-sm mt-0.5">Account settings & details</p>
            </div>

            <div className="card-choco rounded-3xl p-8 mb-6 text-center border border-amber-500/20 shadow-2xl relative overflow-hidden">
              <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-gold rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gold/30">
                <span className="text-choco-900 text-3xl font-black">{adminEmail.charAt(0).toUpperCase()}</span>
              </div>
              <p className="text-gradient-gold text-lg font-serif font-bold">{adminEmail}</p>
              <p className="text-amber-200/50 text-xs mt-1 uppercase tracking-widest font-black">Lounge Administrator</p>
            </div>

            <div className="card-choco rounded-2xl p-5 mb-6 border border-amber-900/30">
              <div className="flex justify-between items-center py-3.5 border-b border-amber-900/30">
                <span className="text-amber-200/50 text-sm">Role</span>
                <span className="text-amber-100 text-sm font-semibold">Owner / Admin</span>
              </div>
              <div className="flex justify-between items-center py-3.5 border-b border-amber-900/30">
                <span className="text-amber-200/50 text-sm">Total Orders Managed</span>
                <span className="text-amber-100 text-sm font-semibold">{orders.length}</span>
              </div>
              <div className="flex justify-between items-center py-3.5">
                <span className="text-amber-200/50 text-sm">Total Revenue Gathered</span>
                <span className="text-emerald-400 text-sm font-semibold">₹{totalRevenue.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-red-400 text-sm font-bold border border-red-500/20 bg-red-950/20 hover:bg-red-900/20 transition-all uppercase tracking-widest"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        )}
      </div>

      {/* ═══════════ BOTTOM TAB BAR ═══════════ */}
      <nav className="!fixed bottom-0 left-0 w-full nav-cream z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-around h-16 px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${isActive ? "text-gold" : "text-muted-w hover:text-mocha"
                  }`}
              >
                {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-gold" />}
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : ""}`} />
                </div>
                <span className={`text-[10px] mt-1 font-semibold ${isActive ? "text-gold" : ""}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
