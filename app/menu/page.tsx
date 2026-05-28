"use client";

import { useCart } from "@/components/CartProvider";
import { supabase } from "@/lib/supabase";
import {
  Home, ShoppingCart, User, Search, Plus, Minus, Trash2,
  LogOut, CheckCircle2, Clock, Package, ArrowRight, ArrowLeft, Mail, Loader2, X, Info
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Transcribed premium Indian Rupee menu
const MENU_ITEMS = [
  { id: "strawberry-1", name: "London Love Triple Waffle", description: "Luscious layers of premium white, milk, and dark melted chocolate drizzled over fresh strawberries on a warm bubble waffle.", price: 110, category: "London Strawberry Drips", image_url: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=400&q=80" },
  { id: "bowl-1", name: "Double Melt Bowl", description: "Double scoop of rich creamy cocoa base with a deep pool of warm premium melted chocolate.", price: 120, category: "Classic Melt Bowls", image_url: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80" },
  { id: "bowl-2", name: "Triple Melt Bowl", description: "Triple dynamic layer of smooth milk, silky white, and intense dark chocolates served warm.", price: 120, category: "Classic Melt Bowls", image_url: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&q=80" },
  { id: "bowl-3", name: "Nutella Dream Bowl", description: "Signature chocolate warm bowl loaded with authentic Italian Nutella and roasted hazelnut crunchies.", price: 140, category: "Signature Melt Bowls", image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80" },
  { id: "bowl-4", name: "Berry Bliss Melt Bowl", description: "Decadent melted chocolate topped with handpicked organic wild blueberries and fresh local strawberries.", price: 140, category: "Signature Melt Bowls", image_url: "https://images.unsplash.com/photo-1511081692775-0574dba3d9f9?w=400&q=80" },
  { id: "waffle-2", name: "White Melt Waffle", description: "Freshly-baked crispy Belgian waffle covered with smooth, warm gourmet white chocolate rain.", price: 80, category: "Classic Waffles", image_url: "https://images.unsplash.com/photo-1562376552-0d160a2f142c?w=400&q=80" },
  { id: "waffle-3", name: "Milk Melt Waffle", description: "Freshly-baked waffle drenched in classic creamy milk chocolate drip.", price: 80, category: "Classic Waffles", image_url: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&q=80" },
  { id: "waffle-4", name: "Dark Melt Waffle", description: "Our signature high-cocoa dark chocolate waffle for true chocolate connoisseurs.", price: 80, category: "Classic Waffles", image_url: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&q=80" },
  { id: "special-1", name: "KitKat Crush Waffle", description: "Fresh waffle loaded with crushed crispy KitKat bars and milk chocolate fudge drizzle.", price: 100, category: "Room Specials", image_url: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&q=80" },
  { id: "special-2", name: "Nutella Dream Special", description: "Our special recipe waffle loaded with thick layers of premium Nutella spread and cocoa powder.", price: 100, category: "Room Specials", image_url: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&q=80" },
  { id: "special-3", name: "Triple Chocolate Melt", description: "A triple dynamic chocolate storm: White, Milk, and Dark melts combined over a golden waffle.", price: 100, category: "Room Specials", image_url: "https://images.unsplash.com/photo-1517093602195-b40af9688b46?w=400&q=80" },
  { id: "special-4", name: "Butterscotch Crunch Waffle", description: "Delightful caramelised butterscotch drizzle with hand-pulled praline crunchies.", price: 100, category: "Room Specials", image_url: "https://images.unsplash.com/photo-1541795795328-f073b763494e?w=400&q=80" },
  { id: "premium-1", name: "Biscoff Bliss Melt", description: "Warm waffle topped with crushed Lotus Biscoff cookies and golden melted Biscoff spread drizzle.", price: 110, category: "Premium Melts", image_url: "https://images.unsplash.com/photo-1532499016263-f2c3e89df9cd?w=400&q=80" },
  { id: "premium-2", name: "Red Velvet Royale Waffle", description: "Royal red velvet cake crumbs with premium melted white chocolate drizzle on a light red velvet base.", price: 110, category: "Premium Melts", image_url: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=400&q=80" },
  { id: "pancake-1", name: "Nutella Melt Bites", description: "Fluffy, bite-sized mini pancakes smothered in rich, warm premium Nutella spread.", price: 105, category: "Mini Melt Pancakes", image_url: "https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?w=400&q=80" },
  { id: "pancake-2", name: "Triple Chocolate Melt Bites", description: "Fluffy mini pancakes drenched in a luxurious trifecta of warm melted chocolates.", price: 105, category: "Mini Melt Pancakes", image_url: "https://images.unsplash.com/photo-1598214886806-c87b2a39f416?w=400&q=80" },
];

const ADD_ONS_LIST = [
  { name: "Extra Chocolate", price: 20 },
  { name: "Choco Chips", price: 10 },
  { name: "Sprinkles", price: 10 }
];

export default function Menu() {
  const { items, addToCart, updateQuantity, updateAddOns, removeFromCart, clearCart, total } = useCart();
  const [activeTab, setActiveTab] = useState("home");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const router = useRouter();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Unique categories list
  const categories = ["All", ...Array.from(new Set(MENU_ITEMS.map(i => i.category)))];

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");
      }

    };
    init();
  }, [router]);



  const filtered = MENU_ITEMS.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) || 
                          i.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || i.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const tabs = [
    { id: "home", label: "Menu", icon: Home },
    { id: "cart", label: "Cart", icon: ShoppingCart, badge: cartCount },
    { id: "profile", label: "Profile", icon: User },
  ];



  return (
    <main className="min-h-screen bg-luxury pb-24 relative overflow-hidden">
      {/* Decorative ambient chocolate/strawberry glowing blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] rounded-full bg-rose-200/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[45%] rounded-full bg-amber-200/15 blur-[130px] pointer-events-none" />

      {/* Premium Header */}
      <header className="sticky top-0 z-40 header-cream">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/60 hover:bg-white text-choco shadow-sm transition-all border border-amber-200/30 group" aria-label="Go Home">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <span className="text-xl font-serif font-extrabold text-gradient-gold tracking-[0.15em] drop-shadow-sm hidden sm:inline-block">MELTED STORIES</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-mocha px-3 py-1 bg-amber-100/50 rounded-full border border-amber-200/40 hidden sm:inline-block">
              Premium Dessert Lounge
            </span>
            
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-6">

        {/* ── HOME TAB ── */}
        {activeTab === "home" && (
          <div className="animate-fadeUp">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="font-serif text-2xl font-bold text-choco">{greeting} ✨</h2>
                <p className="text-muted-w text-sm mt-0.5">Indulge in our freshly handcrafted melts</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-w block font-medium">Pricing Localized</span>
                <span className="text-xs font-bold text-choco bg-amber-100/60 px-2 py-0.5 rounded-md border border-amber-200/40">INR (₹)</span>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/35" />
              <input type="text" placeholder="Search delicious waffles, bowls, pancakes..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-cream w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm"
              />
            </div>

            {/* Horizontal Categories Filter */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none -mx-4 px-4 mask-gradient">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === cat
                      ? "btn-choco scale-105 shadow-[0_4px_12px_rgba(44,24,10,0.15)]"
                      : "bg-white/60 text-mocha hover:bg-white/90 border border-amber-200/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 gap-4 mb-8 stagger">
              {filtered.map(p => (
                <div key={p.id} className="card-cream product-card rounded-2xl overflow-hidden group hover:scale-[1.025] transition-all duration-350 flex flex-col justify-between">
                  {/* Image */}
                  <div className="h-36 overflow-hidden img-overlay relative">
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" />
                    {/* Category pill on image */}
                    <span className="absolute top-2 left-2 text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "rgba(44,24,10,0.78)", color: "#e8c87a", backdropFilter: "blur(6px)" }}>
                      {p.category}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-choco leading-tight mb-1 group-hover:text-amber-800 transition-colors line-clamp-1">{p.name}</h3>
                      <p className="text-[10px] text-muted-w line-clamp-2 leading-relaxed mb-3">{p.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-gold font-extrabold text-sm">₹{p.price}</span>
                      <button
                        onClick={() => {
                          addToCart(p, []);
                          setAddedId(p.id);
                          setTimeout(() => setAddedId(null), 900);
                        }}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          addedId === p.id
                            ? "bg-green-500 scale-110 shadow-[0_0_12px_rgba(74,222,128,0.5)]"
                            : "btn-choco hover:scale-105"
                        }`}
                      >
                        {addedId === p.id ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-amber-300" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!filtered.length && (
              <div className="card-cream rounded-2xl p-10 text-center py-14">
                <Search className="w-8 h-8 text-muted-w mx-auto mb-3 opacity-60" />
                <p className="text-muted-w text-sm font-medium">No sweet stories match &quot;{search}&quot;</p>
              </div>
            )}


            {items.length > 0 && (
              <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-md">
                <button 
                  onClick={() => setActiveTab('cart')}
                  className="w-full bg-green-600 text-white shadow-xl rounded-2xl py-3.5 px-5 flex items-center justify-between font-bold text-sm tracking-wide transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    <span>{cartCount} Item{cartCount !== 1 ? 's' : ''}</span>
                  </div>
                  <span>View Cart • ₹{total}</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* ── CART TAB ── */}
        {activeTab === "cart" && (
          <div className="animate-fadeUp">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-bold text-choco">Your Cart</h2>
              <p className="text-muted-w text-sm mt-0.5">{items.length === 0 ? "Nothing here yet" : `${cartCount} item${cartCount !== 1 ? "s" : ""} selected for checkout`}</p>
            </div>

            {items.length === 0 ? (
              <div className="card-cream rounded-2xl p-12 text-center">
                <ShoppingCart className="w-12 h-12 text-muted-w mx-auto mb-4 opacity-50" />
                <p className="text-choco font-semibold mb-2">Your sweet bag is empty</p>
                <p className="text-muted-w text-xs mb-6">Browse the menu and add your delicious stories!</p>
                <button onClick={() => setActiveTab("home")} className="btn-choco px-6 py-3 rounded-xl text-xs">Browse Menu</button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-5">
                  {items.map(item => (
                    <div key={item.cartItemId} className="card-cream rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-4">
                        <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-xl object-cover ring-1 ring-amber-200/60" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-choco font-bold text-xs truncate leading-snug">{item.name}</h3>
                          <p className="text-gold font-extrabold text-xs mt-1.5">₹{(item.price * item.quantity)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.cartItemId, -1)} className="w-8 h-8 rounded-lg bg-amber-50/50 hover:bg-red-50 text-mocha hover:text-red-500 flex items-center justify-center transition-all border border-amber-200/50">
                            {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                          </button>
                          <span className="text-choco font-bold w-6 text-center text-xs">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartItemId, 1)} className="w-8 h-8 rounded-lg bg-amber-50/50 hover:bg-amber-100 text-mocha hover:text-gold flex items-center justify-center transition-all border border-amber-200/50">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="bg-white/40 rounded-xl p-2.5 border border-amber-200/20">
                        <p className="text-[9px] font-bold text-gold uppercase tracking-wider mb-2">Enhance with Add-Ons</p>
                        <div className="flex flex-wrap gap-2">
                          {ADD_ONS_LIST.map(addon => {
                            const isSelected = item.selectedAddOns?.some(a => a.name === addon.name);
                            return (
                              <button
                                key={addon.name}
                                onClick={() => {
                                  const newAddOns = isSelected 
                                    ? item.selectedAddOns.filter(a => a.name !== addon.name)
                                    : [...(item.selectedAddOns || []), addon];
                                  updateAddOns(item.cartItemId, newAddOns);
                                }}
                                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border transition-all text-[9px] ${
                                  isSelected
                                    ? "bg-amber-100 border-amber-400 text-amber-900 shadow-sm"
                                    : "bg-white border-amber-200/40 text-mocha hover:bg-amber-50"
                                }`}
                              >
                                {isSelected ? <CheckCircle2 className="w-3 h-3 text-amber-600" /> : <Plus className="w-3 h-3 text-amber-400" />}
                                <span className="font-bold">{addon.name} <span className="text-gold font-extrabold">+₹{addon.price}</span></span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout summary card with redirect button */}
                <div className="card-cream rounded-2xl p-5 border-t-2 border-t-gold/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-w text-xs">Subtotal</span>
                    <span className="text-choco text-xs font-semibold">₹{total}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-[10px] text-green-700 font-semibold">
                    <span>Takeaway Package Fee</span>
                    <span>FREE</span>
                  </div>
                  <div className="gold-line my-3" />
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-choco font-bold text-sm">Total Amount</span>
                    <span className="text-gold font-extrabold text-lg">₹{total}</span>
                  </div>
                  
                  {/* Info Notice about "Pay First" Takeaway policy */}
                  <div className="flex items-start gap-2 bg-amber-50/70 p-3 rounded-xl border border-amber-200/40 mb-4 text-[10px] text-amber-800 leading-relaxed">
                    <Info className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                    <p>
                      <strong>Pay First Policy:</strong> Dynamic UPI Scan or Credit Card payment is required at checkout to confirm takeaway orders. Your order will be crafted instantly.
                    </p>
                  </div>

                  <button onClick={() => router.push("/checkout")}
                    className="btn-gold w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-xs">
                    <ShoppingCart className="w-4 h-4" /> Proceed to Checkout · ₹{total}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div className="animate-fadeUp">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-bold text-choco">My Profile</h2>
              <p className="text-muted-w text-sm mt-0.5">Your personal sweet lounge account</p>
            </div>

            {/* Avatar card */}
            <div className="card-cream rounded-2xl p-6 text-center mb-5 border-b-2 border-b-gold/30">
              <div className="w-16 h-16 rounded-full btn-gold flex items-center justify-center mx-auto mb-4 text-xl font-bold text-choco ring-4 ring-amber-100">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <p className="text-choco text-sm font-bold">{userEmail}</p>
              <p className="text-muted-w text-[10px] font-semibold mt-1 bg-amber-100/50 inline-block px-3 py-0.5 rounded-full uppercase tracking-wider border border-amber-200/30">
                Lounge Customer
              </p>
            </div>

            <button onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-red-600 text-xs font-bold border border-red-200/40 bg-red-50/50 hover:bg-red-100/60 transition-all">
              <LogOut className="w-4 h-4" /> Sign Out from Melted Stories
            </button>
          </div>
        )}
      </div>



      {/* Bottom premium tab bar */}
      <nav className="!fixed bottom-0 left-0 w-full nav-cream z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-around h-16 px-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${active ? "text-gold" : "text-muted-w hover:text-mocha"}`}>
                {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-gold" />}
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? "scale-110" : ""}`} />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-2 -right-3 bg-rose-600 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] mt-1 font-extrabold ${active ? "text-gold" : ""}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
