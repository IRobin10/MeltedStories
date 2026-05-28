"use client";

import { useCart } from "@/components/CartProvider";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ShieldCheck, Smartphone, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "creating_order" | "waiting_for_payment" | "success" | "failed">("idle");
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const router = useRouter();  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const ADMIN_UPI = "ismailqudsi2004@okicici";
  const UPI_URL = `upi://pay?pa=${ADMIN_UPI}&pn=MeltedStories&am=${total}&cu=INR`;

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const userPhone = user.phone || user.user_metadata?.phone;
        if (userPhone) setPhone(userPhone);
      }
    };
    check();
    
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [router]);

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-luxury relative overflow-hidden">
        <div className="card-elevated rounded-3xl p-10 text-center max-w-sm w-full animate-scaleIn border border-amber-100/60">
          <div className="text-5xl mb-4">🍩</div>
          <h2 className="font-serif text-2xl text-gradient-gold mb-3">Cart is Empty</h2>
          <p className="text-muted-w text-xs mb-6">Indulge in our premium dessert menu first!</p>
          <Link href="/menu" className="inline-flex items-center gap-2 btn-choco px-6 py-3.5 rounded-xl text-xs">
            <ArrowLeft className="w-4 h-4" /> Browse Lounge Menu
          </Link>
        </div>
      </main>
    );
  }

  const handlePaymentInitiate = async () => {
    if (!phone) {
      alert("Please enter your phone number.");
      return;
    }
    
    setLoading(true);
    setPaymentStatus("creating_order");

    try {
      const orderPayload = {
        items,
        phone,
        total,
        paymentMethod: `GPay / UPI`,
        userId,
        status: "pending"
      };

      const dbRes = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (dbRes.ok) {
        const d = await dbRes.json();
        const createdOrderId = d.orderId;
        setActiveOrderId(createdOrderId);
        setPaymentStatus("waiting_for_payment");
        
        // Open GPay App
        window.location.href = UPI_URL;
        
        // Start Polling
        startPaymentPolling(createdOrderId);
      } else {
        throw new Error("Failed to save order");
      }
    } catch (err) {
      console.error("Order submission error:", err);
      alert("Could not submit order. Please try again.");
      setPaymentStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  const startPaymentPolling = (orderId: string) => {
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("status")
          .eq("id", orderId)
          .single();
          
        if (data && data.status === "paid") {
          // Payment confirmed!
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          setPaymentStatus("success");
          setShowConfetti(true);
          setTimeout(() => {
            clearCart();
            router.push(`/status/${orderId}`);
          }, 1800);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000); // Check every 3 seconds
  };
  
  const handleManualProceed = () => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    if (activeOrderId) {
      clearCart();
      router.push(`/status/${activeOrderId}`);
    }
  };

  return (
    <main className="min-h-screen bg-luxury pt-8 pb-24 px-4 relative overflow-hidden">
      {/* Success Overlay */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-choco-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="text-center p-8 bg-white/95 rounded-3xl max-w-sm border border-gold/40 shadow-2xl animate-scaleIn">
            <div className="text-6xl animate-bounce mb-4">🎉🍫</div>
            <h3 className="font-serif text-xl font-bold text-choco mb-2">Payment Detected!</h3>
            <p className="text-muted-w text-xs">Your payment was confirmed automatically. Kitchen is on it!</p>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto animate-fadeUp">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-muted-w hover:text-gold text-xs font-bold transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> BACK TO MENU
          </button>
          
        </div>

        <h1 className="font-serif text-2xl font-black text-gradient-gold mb-1 tracking-wide">Melted Stories Checkout</h1>
        <p className="text-muted-w text-xs mb-6">Secure checkout & order details</p>

        {/* Order Summary */}
        <div className="card-cream rounded-2xl p-5 mb-5 border-l-4 border-l-gold/60">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase font-black text-gold tracking-wider">Takeaway Order Summary</span>
            <span className="text-xs text-choco font-semibold bg-amber-100/50 px-2 py-0.5 rounded border border-amber-200/30">₹ INR</span>
          </div>
          <ul className="space-y-3 mt-3 mb-4">
            {items.map(item => (
              <li key={item.cartItemId} className="flex justify-between items-center text-xs">
                <div className="min-w-0 flex-1 pr-4">
                  <span className="text-choco font-bold truncate block">{item.name} <span className="text-gold font-normal">x{item.quantity}</span></span>
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <span className="text-[9px] text-muted-w truncate block">+ {item.selectedAddOns.map(a => a.name).join(", ")}</span>
                  )}
                </div>
                <span className="text-choco font-extrabold flex-shrink-0">₹{(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="gold-line mb-3" />
          <div className="flex justify-between items-center font-black">
            <span className="text-choco text-xs">Total Amount</span>
            <span className="text-gold text-base font-extrabold">₹{total}</span>
          </div>
        </div>

        {/* Contact Details */}
        <div className="card-warm rounded-2xl p-5 mb-5 border border-amber-200/20 space-y-4">
          <div>
            <h2 className="text-[10px] font-black text-gold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" /> Phone Number
            </h2>
            <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
              disabled={paymentStatus !== "idle"}
              className="input-cream w-full rounded-xl px-4 py-3 text-xs disabled:opacity-50" placeholder="+91 9999999999" />
          </div>
        </div>

        {/* Payment Action */}
        <div className="mb-5">
          {paymentStatus === "idle" || paymentStatus === "creating_order" ? (
            <button
              onClick={handlePaymentInitiate}
              disabled={loading || !phone}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 bg-[#1f1f1f] text-white hover:bg-black"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Preparing...</>
              ) : (
                <>
                  <span className="flex items-center justify-center bg-white p-1 rounded-full">
                    <svg viewBox="0 0 48 48" className="w-4 h-4">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                  </span>
                  Pay via GPay
                </>
              )}
            </button>
          ) : (
            <div className="card-cream rounded-2xl p-6 text-center border border-amber-200/40 shadow-inner">
              <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto mb-4" />
              <h3 className="font-serif font-black text-choco mb-2">Waiting for Payment...</h3>
              <p className="text-muted-w text-xs mb-5">
                Complete your payment of <b>₹{total}</b> in the GPay app. We are automatically listening for the bank confirmation.
              </p>
              <button 
                onClick={handleManualProceed}
                className="text-xs text-gold underline font-bold"
              >
                Skip waiting and view order status
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-muted-w text-[9px] mt-3 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-green-600" /> Secure automated payment verification
        </p>
      </div>
    </main>
  );
}

