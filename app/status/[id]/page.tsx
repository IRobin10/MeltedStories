"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Clock, CheckCircle2, Coffee, PartyPopper, QrCode, Sparkles, MapPin, Receipt } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function OrderStatusPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [status, setStatus] = useState("pending");
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      if (orderId.startsWith("mock-")) {
        const offlineOrders = JSON.parse(localStorage.getItem("melted_stories_offline_orders") || "[]");
        const found = offlineOrders.find((o: any) => o.id === orderId);
        if (found) {
          setStatus(found.status);
          setOrderDetails(found);
        } else {
          // If not found in localStorage, set a default mock order
          const defaultMock = {
            id: orderId,
            customer_email: "guest@meltedstories.com",
            total_amount: 110,
            payment_method: "Takeaway UPI (Paid)",
            status: "pending",
            items: [
              { name: "London Love Triple Waffle", price: 110, quantity: 1, selectedAddOns: [] }
            ],
            created_at: new Date().toISOString()
          };
          setOrderDetails(defaultMock);
          setStatus("pending");
        }
        setLoading(false);
        return;
      }

      const { data } = await supabase.from("orders").select("*").eq("id", orderId).single();
      if (data) {
        setStatus(data.status);
        setOrderDetails(data);
      }
    } catch (err) {
      console.error("Error fetching order status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    fetchStatus();

    let ch: any = null;
    if (!orderId.startsWith("mock-")) {
      ch = supabase.channel(`order-status-${orderId}-${Date.now()}`)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
          (p) => {
            setStatus(p.new.status);
            setOrderDetails(p.new);
          })
        .subscribe();
    }

    const t = setInterval(fetchStatus, 4000);
    return () => {
      if (ch) supabase.removeChannel(ch);
      clearInterval(t);
    };
  }, [orderId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-luxury">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
          <p className="text-gold text-sm font-bold tracking-wide animate-pulse">Retrieving pickup ticket…</p>
        </div>
      </main>
    );
  }

  const isReady = status === "ready";
  const isCompleted = status === "completed";
  const isDone = isReady || isCompleted;

  // Format date nicely
  const orderTime = orderDetails?.created_at
    ? new Date(orderDetails.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-luxury relative overflow-hidden">
      {/* Dynamic ambient bokeh background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] pointer-events-none transition-all duration-1000"
        style={{ 
          background: isReady 
            ? "radial-gradient(circle, rgba(74,222,128,0.18) 0%, transparent 70%)" 
            : isCompleted
            ? "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(201,162,83,0.22) 0%, transparent 70%)", 
          filter: "blur(40px)" 
        }}
      />

      {/* TICKET CONTAINER WITH JAGGED TEAR-OFF SHAPE LOOK */}
      <div className="max-w-sm w-full animate-scaleIn relative">
        
        {/* Ticket Header portion */}
        <div className="card-choco rounded-t-3xl p-6 pb-4 border-b border-dashed border-amber-200/30 text-center relative">
          {/* Tear notch left */}
          <div className="absolute bottom-[-10px] left-[-10px] w-5 h-5 rounded-full bg-[#ebdcb5] border-r border-amber-900/10 z-10" />
          {/* Tear notch right */}
          <div className="absolute bottom-[-10px] right-[-10px] w-5 h-5 rounded-full bg-[#ebdcb5] border-l border-amber-900/10 z-10" />

          <div className="flex justify-between items-center mb-4">
            <span className="text-[9px] font-black tracking-widest text-amber-200 bg-amber-900/50 px-2 py-0.5 rounded border border-amber-800/40">
              TAKEAWAY PASS
            </span>
            <span className="text-[10px] text-amber-200/60 font-semibold">{orderTime}</span>
          </div>

          <p className="text-amber-200/50 text-[9px] uppercase tracking-widest font-black">Ticket Order ID</p>
          <h1 className="font-serif text-xl font-bold text-gradient-gold tracking-wider mt-0.5">
            #{orderId.slice(0, 10).toUpperCase()}
          </h1>
        </div>

        {/* Ticket Body portion */}
        <div className="card-cream rounded-b-3xl p-6 pt-5 shadow-2xl relative border-t border-t-amber-100/10 flex flex-col justify-between">
          
          {/* Status Alert Area */}
          <div className="text-center mb-5">
            <div className="flex justify-center mb-4">
              {isReady ? (
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-xl bg-green-500/20 animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full flex items-center justify-center border border-green-500/30 bg-green-500/10 text-green-600">
                    <Sparkles className="w-10 h-10 animate-bounce" />
                  </div>
                </div>
              ) : isCompleted ? (
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-xl bg-blue-500/20" />
                  <div className="relative w-20 h-20 rounded-full flex items-center justify-center border border-blue-500/30 bg-blue-500/10 text-blue-600">
                    <PartyPopper className="w-10 h-10" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-xl bg-amber-500/20 animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full flex items-center justify-center border border-amber-500/30 bg-amber-500/10 text-amber-600 animate-pulse">
                    <Coffee className="w-10 h-10" />
                  </div>
                </div>
              )}
            </div>

            <h2 className="text-xl font-black mb-1.5" style={{ color: isReady ? "#16a34a" : isCompleted ? "#2563eb" : "#c9a253" }}>
              {isReady ? "Ready for Pickup!" : isCompleted ? "Order Complete" : "Being Prepared"}
            </h2>
            <p className="text-[10px] text-muted-w font-semibold leading-relaxed px-2">
              {isReady
                ? "Your hot delicious story is fully melted. Show this pass at the counter!"
                : isCompleted
                ? "Picked up successfully. We look forward to sweetening your day again!"
                : "Our kitchen has received payment. We are crafting your dessert story with love."}
            </p>
          </div>

          <div className="gold-line mb-4" />

          {/* DYNAMIC QR CODE DISPLAY */}
          <div className="bg-white p-4 rounded-2xl border border-amber-200/40 shadow-inner flex flex-col items-center justify-center mb-5 max-w-[200px] mx-auto w-full group">
            {/* Styled dynamic SVG QR Code */}
            <svg viewBox="0 0 100 100" className="w-24 h-24 text-choco-900 group-hover:scale-105 transition-transform duration-300">
              <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" fill="currentColor" />
              <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" fill="currentColor" />
              <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" fill="currentColor" />
              <path d="M40,0 h20 v10 h-20 z M40,20 h10 v10 h-10 z M60,20 h10 v10 h-10 z" fill="currentColor" />
              <path d="M30,40 h10 v10 h-10 z M50,40 h20 v10 h-20 z M80,40 h20 v10 h-20 z" fill="currentColor" />
              <path d="M0,50 h10 v10 h-10 z M20,50 h20 v10 h-20 z" fill="currentColor" />
              <path d="M40,60 h20 v10 h-20 z M70,60 h10 v10 h-10 z M90,60 h10 v10 h-10 z" fill="currentColor" />
              <path d="M40,80 h10 v20 h-10 z M60,80 h30 v10 h-30 z M80,90 h20 v10 h-20 z" fill="currentColor" />
              <circle cx="50" cy="50" r="10" fill="#c9a253" />
            </svg>
            <span className="text-[8px] font-black uppercase text-gold tracking-widest mt-2 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" /> Lounge Pickup QR
            </span>
          </div>

          {/* Ticket Metadata list */}
          <div className="bg-amber-50/50 rounded-xl p-3.5 border border-amber-200/30 text-xs space-y-2 mb-4">
            <div className="flex justify-between items-center text-[10px] font-extrabold text-gold uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1"><Receipt className="w-3.5 h-3.5" /> Order Summary</span>
              <span>PAID</span>
            </div>
            
            {orderDetails?.items && orderDetails.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-start text-[10px] text-choco font-bold">
                <span className="pr-4 leading-snug">
                  {item.name} <span className="text-gold">x{item.quantity}</span>
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <span className="block text-[8px] text-muted-w font-normal">
                      + {item.selectedAddOns.map((a: any)=>a.name).join(", ")}
                    </span>
                  )}
                </span>
                <span className="flex-shrink-0 font-extrabold">₹{(item.price * item.quantity)}</span>
              </div>
            ))}
            
            <div className="border-t border-dashed border-amber-200/50 my-1.5 pt-1.5 flex justify-between items-center font-black">
              <span className="text-choco font-extrabold text-[10px]">Total Amount</span>
              <span className="text-gold text-xs font-black">₹{orderDetails?.total_amount || 0}</span>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Link href="/menu" className="inline-flex items-center gap-1.5 text-mocha hover:text-choco font-bold text-[10px] tracking-wide uppercase transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Lounge Menu
            </Link>
          </div>

        </div>

      </div>
    </main>
  );
}
