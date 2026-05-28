import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";

export const metadata: Metadata = {
  title: "Melted Stories | Cozy Waffles & Coffee",
  description: "Artisanal Waffles, Premium Chocolates & Slow-Brewed Coffee in a Warm Cozy Ambiance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('error', function(e) {
            alert('Crash: ' + e.message + ' in ' + e.filename + ' line ' + e.lineno);
          });
          window.addEventListener('unhandledrejection', function(e) {
            alert('Promise Crash: ' + (e.reason && e.reason.message ? e.reason.message : e.reason));
          });
          
          if (!Array.prototype.at) {
            Array.prototype.at = function(index) {
              return this[index >= 0 ? index : this.length + index];
            };
          }
          if (typeof structuredClone === 'undefined') {
            window.structuredClone = function(obj) { return JSON.parse(JSON.stringify(obj)); };
          }
        `}}></script>
      </head>
      <body className="font-sans bg-cream-50 text-espresso-950 antialiased min-h-screen relative transition-colors duration-500">
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] left-[15%] w-64 h-64 bg-gold/10 rounded-full blur-3xl animate-bokeh" style={{ animationDelay: '0s' }} />
            <div className="absolute top-[40%] right-[10%] w-96 h-96 bg-amber-400/10 rounded-full blur-3xl animate-bokeh" style={{ animationDelay: '2s', animationDuration: '9s' }} />
            <div className="absolute bottom-[20%] left-[20%] w-72 h-72 bg-orange-300/10 rounded-full blur-3xl animate-bokeh" style={{ animationDelay: '4s', animationDuration: '11s' }} />
          </div>
          <div className="relative z-10">
            <CartProvider>
              {children}
            </CartProvider>
          </div>
      </body>
    </html>
  );
}


