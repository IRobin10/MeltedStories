"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Phone, MapPin, Menu as MenuIcon, X, Instagram } from "lucide-react";
import { useState, useEffect } from "react";
import CinematicHero from "../components/CinematicHero";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSubject, setShowSubject] = useState(false);
  useEffect(() => {
    setMounted(true);

    // Check if open (5 PM - 12 AM)
    const checkOpenStatus = () => {
      const d = new Date();
      const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      const istDate = new Date(utc + (3600000 * 5.5));
      const hour = istDate.getHours();
      setIsOpen(hour >= 17);
    };

    checkOpenStatus();
    // Live update every minute
    const interval = setInterval(checkOpenStatus, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen relative font-sans text-espresso-900 selection:bg-caramel-400/30 selection:text-espresso-900">


      {/* Background */}
      <div className="fixed inset-0 z-[-1] bg-cream-50 transition-colors duration-500"></div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 py-5">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative">

          {/* Left Side: Mobile Toggle only (on mobile) */}
          <div className="flex-1 flex items-center justify-start">
            <button className="md:hidden text-espresso-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>

          {/* Center: Logo / Cinematic Hero Animation */}
          <div className="flex-shrink-0 flex items-center justify-center relative group pb-4 pt-10 md:pt-12 w-full max-w-lg mx-auto min-h-[80px]">
            <CinematicHero />
          </div>

          {/* Right Side: Desktop Nav */}
          <div className="flex-1 flex items-center justify-end">
            <div className="hidden md:flex items-center gap-8">
              <a href="#menu" className="text-lg font-medium text-espresso-700 hover:text-caramel-500 transition-colors">Menu</a>
              <a href="#contact" className="text-lg font-medium text-espresso-700 hover:text-caramel-500 transition-colors">Contact</a>
              
            </div>
            {/* Mobile Theme Toggle */}
            <div className="md:hidden ml-auto">
              
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-cream-50 pt-24 px-6 md:hidden flex flex-col gap-6 animate-fadeIn">
          <a href="#menu" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-serif text-espresso-900">Menu</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-serif text-espresso-900">Contact</a>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-6 transition-all duration-500 ${!mounted ? "opacity-0" : "opacity-100"} ${isOpen ? "bg-sage-50 border-sage-100 text-sage-700" : "bg-red-50 border-red-100 text-red-700"}`}>
            <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-sage-600 animate-pulse" : "bg-red-600"}`}></span>
            {isOpen ? "Now open for dine-in & delivery" : "Not for dine-in (Opens at 5 PM)"}
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-espresso-900 leading-[1.1] mb-6">
            Warm <span className="text-caramel-600 italic font-medium">waffles</span>.
          </h1>
          <p className="text-lg text-espresso-700 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
            Welcome to Melted Stories. A sweet retreat where every dessert is crafted with passion, bringing you comfort in every bite.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <Link href="/menu" className="w-full sm:w-auto bg-caramel-500 hover:bg-caramel-600 text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-lg shadow-caramel-500/25 flex items-center justify-center gap-2">
              View Menu <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#contact" className="w-full sm:w-auto bg-white border-2 border-espresso-100 hover:border-espresso-200 text-espresso-800 px-8 py-3.5 rounded-full font-semibold transition-all text-center">
              Find Us
            </Link>
          </div>
        </div>
        <div className="flex-1 relative w-full max-w-md md:max-w-none group">
          <div className="absolute inset-0 bg-caramel-100 rounded-[2rem] transform rotate-3 scale-[0.98] -z-10 transition-transform group-hover:rotate-6"></div>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto aspect-[5/6] object-cover rounded-[2rem] shadow-xl border-4 border-white relative z-10"
          >
            <source src="/mp_.mp4" type="video/mp4" />
          </video>
        </div>
      </section>


      {/* Featured Menu / Ambience */}
      <section id="menu" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-espresso-900 mb-4">Signature Dessert Stories</h2>
          <p className="text-espresso-700 max-w-xl mx-auto">A sneak peek of our hand-crafted melted chocolates and signature waffles.</p>
        </div>

        {/* Featured Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-cream-100 group">
            <div className="h-52 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=600&q=80"
                alt="London Love Triple Waffle"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-espresso-900/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-black">
                ₹110
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-serif text-lg font-bold text-espresso-900 mb-2">London Love Triple</h3>
              <p className="text-espresso-700 text-xs leading-relaxed">Warm waffle, fresh strawberries, and three layers of melted white, milk, and dark chocolates.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-cream-100 group">
            <div className="h-52 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80"
                alt="Nutella Dream Bowl"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-espresso-900/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-black">
                ₹140
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-serif text-lg font-bold text-espresso-900 mb-2">Nutella Dream Bowl</h3>
              <p className="text-espresso-700 text-xs leading-relaxed">Thick dynamic pool of warm Italian Nutella topped with crushed roasted hazelnuts.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-cream-100 group">
            <div className="h-52 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1532499016263-f2c3e89df9cd?w=600&q=80"
                alt="Biscoff Bliss Melt"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-espresso-900/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-black">
                ₹110
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-serif text-lg font-bold text-espresso-900 mb-2">Biscoff Bliss Melt</h3>
              <p className="text-espresso-700 text-xs leading-relaxed">Warm crispy Belgian waffle loaded with cookie butter drizzle and crushed Lotus Biscoff.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-cream-100 group">
            <div className="h-52 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1598214886806-c87b2a39f416?w=600&q=80"
                alt="Triple Chocolate Melt Bites"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-espresso-900/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-black">
                ₹105
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-serif text-lg font-bold text-espresso-900 mb-2">Triple Melt Pancakes</h3>
              <p className="text-espresso-700 text-xs leading-relaxed">Fluffy mini pancakes covered in a luxurious warm white, milk, and dark chocolate drizzle.</p>
            </div>
          </div>
        </div>



        <div className="mt-12 text-center">
          <Link href="/menu" className="inline-flex items-center gap-2 bg-espresso-800 hover:bg-espresso-700 text-white px-8 py-3.5 rounded-full font-semibold transition-all">
            Explore Full Menu <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer id="contact" className="bg-white border-t border-cream-100 py-16 px-6 transition-colors duration-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <motion.div 
              className="mb-6 relative w-64 h-52 md:w-72 md:h-40 ml-14 md:ml-24 cursor-pointer"
              animate={{ y: [0, -8, 0] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              onClick={() => setShowSubject(!showSubject)}
            >
              <Image
                src={showSubject ? "/Subject.png" : "/home.png"}
                alt="Melted Stories"
                fill
                className="object-contain object-left drop-shadow-sm"
              />
            </motion.div>
            <p className="text-espresso-700 mb-6 max-w-sm">
              Your neighborhood retreat for extraordinary desserts in a warm, welcoming atmosphere.
            </p>
          </div>

          <div>
            <h4 className="font-serif font-bold text-lg text-espresso-900 mb-4">Visit Us</h4>
            <ul className="space-y-4 text-espresso-700 text-sm">
              <li className="flex items-start gap-3">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Melted+Stories,+22,+Makan+Opp+Babulkah+Makan,+Jalal+Rd,+Vellore,+Tamil+Nadu+635802"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform shrink-0"
                  title="Open in Google Maps"
                >
                  <MapPin className="w-5 h-5 text-caramel-500" />
                </a>
                <span>22, Makan Opp Babulkah Makan,<br />Jalal Rd, Vellore,<br />Tamil Nadu 635802<br />(QPV9+G3 Ambur, Tamil Nadu)</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-caramel-500 shrink-0" />
                <span>073396 96422</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-bold text-lg text-espresso-900 mb-4">Hours</h4>
            <ul className="space-y-2 text-espresso-700 text-sm mb-6">
              <li className="flex justify-between">
                <span>Monday - Sunday</span>
                <span className="font-medium text-espresso-900">5:00 PM - 12:00 AM</span>
              </li>
            </ul>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com/meltedstories_ambur" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-espresso-700 hover:text-caramel-500 transition-colors">
                <Instagram className="w-5 h-5" />
                <span className="text-sm font-medium">@meltedstories_ambur</span>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-cream-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-espresso-500">© {new Date().getFullYear()} Melted Stories. All rights reserved.</p>
          <div className="flex flex-col items-end gap-2">
            <Link href="/login?role=admin" className="text-xs font-medium text-espresso-400 hover:text-caramel-500 transition-colors">
              Admin Portal
            </Link>
            <Link href="/login?role=employee" className="text-xs font-medium text-espresso-400 hover:text-caramel-500 transition-colors">
              Employee Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
