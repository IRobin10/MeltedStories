"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowLeft, Mail, Lock, Eye, EyeOff, Phone } from "lucide-react";
import Link from "next/link";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "user";
  const isAdmin = role === "admin";
  const isEmployee = role === "employee";
  const isStaff = isAdmin || isEmployee;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        if (password !== confirmPassword) { alert("Passwords do not match!"); setLoading(false); return; }
        
        let signUpEmail = email;
        if (isEmployee) {
          if (!phone || phone.length < 10) { alert("Please enter a valid mobile number"); setLoading(false); return; }
          signUpEmail = `${phone}@employee.meltedstories.com`;
        } else {
          if (!phone) { alert("Please enter your mobile number"); setLoading(false); return; }
        }

        const { error } = await supabase.auth.signUp({
          email: signUpEmail,
          password,
          options: {
            data: { phone }
          }
        });
        if (error) throw error;
        alert("Account created successfully!");
        if (isEmployee) {
          router.push("/employee");
        } else {
          router.push("/menu");
        }
      } else {
        let signInEmail = email;
        if (isEmployee) {
          if (!phone || phone.length < 10) { alert("Please enter a valid mobile number"); setLoading(false); return; }
          signInEmail = `${phone}@employee.meltedstories.com`;
        }

        const { error } = await supabase.auth.signInWithPassword({ email: signInEmail, password });
        if (error) throw error;

        if (isAdmin && signInEmail === "meltedstoriesab@gmail.com") {
          router.push("/admin");
        } else if (isAdmin) {
          alert("You do not have admin access.");
          await supabase.auth.signOut();
        } else if (isEmployee) {
          const { data: sessionData, error: sessionError } = await supabase.from('employee_activity').insert([{
            employee_number: phone,
            login_time: new Date().toISOString()
          }]).select().single();
          if (!sessionError && sessionData) {
            localStorage.setItem('employee_session_id', sessionData.id);
          }
          router.push("/employee");
        } else {
          router.push("/menu");
        }
      }
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("invalid login credentials")) {
        alert(isEmployee ? "Invalid Number/Password" : "Incorrect email or password.");
      } else {
        alert(err.message || "An error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm animate-scaleIn">
      {/* Brand mark */}
      <div className="text-center mb-8 mt-4">
        <h1 className="font-serif text-3xl text-gradient-gold mb-1">
          {isAdmin ? "Admin Login" : isEmployee ? (isSignUp ? "Employee Signup" : "Employee Login") : (isSignUp ? "Create Account" : "Welcome Back")}
        </h1>
        <p className="text-muted-w text-sm">
          {isAdmin ? "Owner credentials required" : isEmployee ? "Staff credentials required" : (isSignUp ? "Join Melted Stories today" : "Sign in to your account")}
        </p>
      </div>

      {/* Card — dark chocolate for staff, cream for user */}
      <div className={isStaff ? "card-choco rounded-3xl p-8" : "card-elevated rounded-3xl p-8"}>
        <div className="mb-6">
          <Link href="/" className={`inline-flex items-center gap-2 text-xs font-medium transition-colors ${isStaff ? "text-amber-400/60 hover:text-amber-300" : "text-muted-w hover:text-gold"}`}>
            <ArrowLeft className="w-3.5 h-3.5" /> Back to portal
          </Link>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {/* Email */}
          {!isEmployee && (
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isStaff ? "text-amber-200/60" : "text-mocha"}`}>Email</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isStaff ? "text-amber-400/40" : "text-amber-700/40"}`} />
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input-cream w-full rounded-xl pl-11 pr-4 py-3.5 text-sm ${isStaff ? "bg-white/5 border-amber-400/20 text-amber-100 placeholder:text-amber-400/25 focus:border-amber-400/50" : ""}`}
                  placeholder="your@email.com"
                />
              </div>
            </div>
          )}

          {/* Mobile Number */}
          {(isEmployee || (!isAdmin && isSignUp)) && (
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isStaff ? "text-amber-200/60" : "text-mocha"}`}>Mobile Number</label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm ${isStaff ? "text-amber-400/40" : "text-amber-700/40"}`}>+91</span>
                <input
                  type="tel" required value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`input-cream w-full rounded-xl pl-12 pr-4 py-3.5 text-sm ${isStaff ? "bg-white/5 border-amber-400/20 text-amber-100 placeholder:text-amber-400/25 focus:border-amber-400/50" : ""}`}
                  placeholder="9999999999"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isStaff ? "text-amber-200/60" : "text-mocha"}`}>Password</label>
            <div className="relative">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isStaff ? "text-amber-400/40" : "text-amber-700/40"}`} />
              <input
                type={showPw ? "text" : "password"} required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`input-cream w-full rounded-xl pl-11 pr-12 py-3.5 text-sm ${isStaff ? "bg-white/5 border-amber-400/20 text-amber-100 placeholder:text-amber-400/25 focus:border-amber-400/50" : ""}`}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isStaff ? "text-amber-400/40 hover:text-amber-300" : "text-muted-w hover:text-mocha"}`}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          {isSignUp && (
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isStaff ? "text-amber-200/60" : "text-mocha"}`}>Confirm Password</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isStaff ? "text-amber-400/40" : "text-amber-700/40"}`} />
                <input
                  type="password" required value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input-cream w-full rounded-xl pl-11 pr-4 py-3.5 text-sm ${isStaff ? "bg-white/5 border-amber-400/20 text-amber-100 placeholder:text-amber-400/25 focus:border-amber-400/50" : ""}`}
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <div className="gold-line my-1" />

          <button
            type="submit" disabled={loading}
            className={`w-full py-4 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 ${isStaff ? "btn-gold" : "btn-choco"}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                Processing…
              </span>
            ) : (
              <>{isSignUp ? "Create Account" : "Sign In"} <CheckCircle2 className="w-4 h-4" /></>
            )}
          </button>
        </form>

        {!isAdmin && (
          <div className={`mt-6 pt-5 border-t text-center ${isStaff ? "border-amber-400/10" : "border-amber-800/10"}`}>
            <p className={`text-sm ${isStaff ? "text-amber-200/60" : "text-muted-w"}`}>
              {isSignUp ? "Already have an account?" : (isEmployee ? "New employee?" : "New to Melted Stories?")}
              <button onClick={() => setIsSignUp(!isSignUp)} className={`ml-2 font-semibold transition-colors ${isStaff ? "text-gold hover:text-amber-300" : "text-gold hover:text-amber-600"}`}>
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-luxury">
      <Suspense fallback={<div className="text-gold flex items-center gap-2"><span className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />Loading…</div>}>
        <LoginContent />
      </Suspense>
    </main>
  );
}
