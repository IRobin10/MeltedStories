"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Clock, CheckCircle2, RotateCcw, Loader2 } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import Link from "next/link";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [repeatingOrderId, setRepeatingOrderId] = useState<string | null>(null);
  const { addToCart, clearCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?role=user");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRepeatOrder = (order: any) => {
    setRepeatingOrderId(order.id);
    
    // Clear current cart and add all items from the previous order
    clearCart();
    
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const qty = item.quantity || 1;
        for (let i = 0; i < qty; i++) {
          addToCart({
            id: item.id || Math.random().toString(),
            name: item.name,
            price: item.price,
            image_url: item.image_url || "",
          });
        }
      });
    }

    // Redirect to checkout after a brief delay
    setTimeout(() => {
      router.push("/checkout");
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-caramel-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 font-sans text-espresso-900 pb-20">
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-espresso-600 hover:text-espresso-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif font-bold text-xl text-espresso-900">Order History</h1>
          <div className="w-5"></div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-cream-100 shadow-sm">
            <Package className="w-16 h-16 text-espresso-200 mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold text-espresso-900 mb-2">No orders yet</h2>
            <p className="text-espresso-600 mb-6">Looks like you haven't made any sweet memories with us yet.</p>
            <Link href="/" className="inline-block bg-caramel-500 hover:bg-caramel-600 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-md">
              Explore Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl p-6 border border-cream-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4 border-b border-cream-50 pb-4">
                  <div>
                    <span className="text-xs font-bold text-espresso-400 uppercase tracking-wider block mb-1">
                      Order #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-sm text-espresso-600 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'ready' ? 'bg-amber-100 text-amber-700' :
                    'bg-espresso-100 text-espresso-600'
                  }`}>
                    {order.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {order.status}
                  </div>
                </div>

                <div className="mb-6 space-y-3">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <span className="bg-cream-100 text-espresso-800 font-bold px-2 py-0.5 rounded text-xs">
                          {item.quantity}x
                        </span>
                        <span className="font-medium text-espresso-800">{item.name}</span>
                      </div>
                      <span className="font-semibold text-espresso-900">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-cream-50">
                  <div className="text-sm">
                    <span className="text-espresso-500">Total: </span>
                    <span className="font-bold text-lg text-espresso-900">₹{order.total_amount}</span>
                  </div>
                  
                  <button
                    onClick={() => handleRepeatOrder(order)}
                    disabled={repeatingOrderId === order.id}
                    className="flex items-center gap-2 bg-espresso-50 hover:bg-espresso-100 text-espresso-800 px-5 py-2.5 rounded-full font-semibold text-sm transition-colors border border-espresso-100"
                  >
                    {repeatingOrderId === order.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Preparing...</>
                    ) : (
                      <><RotateCcw className="w-4 h-4" /> Repeat Order</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
