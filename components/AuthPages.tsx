"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Sparkles, Mail, Lock, User, AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

type AuthMode = "login" | "signup" | "forgot";

export const AuthPages: React.FC = () => {
  const { 
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle,
    resetPassword
  } = useApp();

  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Field states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { text: "Empty", score: 0, color: "bg-border" };
    if (pass.length >= 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    switch (score) {
      case 0:
      case 1:
        return { text: "Weak", score: 25, color: "bg-red-500" };
      case 2:
        return { text: "Fair", score: 50, color: "bg-orange-500" };
      case 3:
        return { text: "Good", score: 75, color: "bg-yellow-500" };
      case 4:
        return { text: "Strong", score: 100, color: "bg-green-500" };
      default:
        return { text: "Empty", score: 0, color: "bg-border" };
    }
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    
    if (!email) {
      setError("Email address is required.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        if (!password) {
          setError("Password is required.");
          setLoading(false);
          return;
        }
        await loginWithEmail(email, password);
      } else if (mode === "signup") {
        if (!name) {
          setError("Full name is required.");
          setLoading(false);
          return;
        }
        if (!password) {
          setError("Password is required.");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        await registerWithEmail(name, email, password);
      } else if (mode === "forgot") {
        await resetPassword(email);
        setSuccessMsg("If this email exists, a password reset link has been sent.");
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || "Google Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background p-4 overflow-hidden transition-colors duration-300">
      {/* Glow Backdrops */}
      <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[90px] dark:bg-primary/5 animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-1/4 translate-y-1/2 w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[90px] dark:bg-purple-500/5 animate-pulse-glow" />

      {/* Main card */}
      <Card className="w-full max-w-md border border-border bg-card/70 backdrop-blur-md p-8 shadow-xl rounded-2xl relative z-10 overflow-hidden">
        {/* Top Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-16 h-16 overflow-hidden rounded-2xl shadow border border-border bg-card p-0.5">
            <Image
              src="/logo.png"
              alt="Noter Logo"
              fill
              sizes="64px"
              className="object-cover rounded-2xl"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground mt-2">Noter</span>
        </div>

        <AnimatePresence mode="wait">
          {mode === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center mb-6 space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Welcome Back! 👋</h2>
                <p className="text-xs text-muted-foreground">Login to continue your learning journey</p>
              </div>

              {/* Google Log in */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 h-11 border-border/80 text-foreground font-medium rounded-xl hover:bg-muted/70 hover:border-border transition cursor-pointer"
              >
                <GoogleIcon />
                Continue with Google
              </Button>

              {/* Separator */}
              <div className="flex items-center my-5">
                <div className="flex-grow border-t border-border/60"></div>
                <span className="px-3 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">or</span>
                <div className="flex-grow border-t border-border/60"></div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-9 h-11 border-border/80 bg-background/50 focus:bg-background transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs font-bold text-primary hover:underline transition cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-9 pr-10 h-11 border-border/80 bg-background/50 focus:bg-background transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 mt-2 text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Login
                      <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </form>

              {/* Bottom Nav */}
              <div className="text-center mt-6 text-xs text-muted-foreground font-medium">
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setError(null);
                    setMode("signup");
                  }}
                  className="font-bold text-primary hover:underline transition cursor-pointer"
                >
                  Sign up
                </button>
              </div>
            </motion.div>
          )}

          {mode === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center mb-6 space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Create Account 📝</h2>
                <p className="text-xs text-muted-foreground">Sign up to start your learning journey</p>
              </div>

              {/* Google Sign up */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 h-11 border-border/80 text-foreground font-medium rounded-xl hover:bg-muted/70 hover:border-border transition cursor-pointer"
              >
                <GoogleIcon />
                Continue with Google
              </Button>

              {/* Separator */}
              <div className="flex items-center my-5">
                <div className="flex-grow border-t border-border/60"></div>
                <span className="px-3 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">or</span>
                <div className="flex-grow border-t border-border/60"></div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-9 h-11 border-border/80 bg-background/50 focus:bg-background transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-9 h-11 border-border/80 bg-background/50 focus:bg-background transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-9 pr-10 h-11 border-border/80 bg-background/50 focus:bg-background transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <span>Password Strength</span>
                        <span className={
                          strength.text === "Strong" ? "text-green-500" :
                          strength.text === "Good" ? "text-yellow-500" :
                          strength.text === "Fair" ? "text-orange-500" : "text-red-500"
                        }>
                          {strength.text}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${strength.score}%` }}
                          className={`h-full ${strength.color} rounded-full`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-9 pr-10 h-11 border-border/80 bg-background/50 focus:bg-background transition"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 mt-2 text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign Up
                      <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </form>

              {/* Bottom Nav */}
              <div className="text-center mt-6 text-xs text-muted-foreground font-medium">
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setError(null);
                    setMode("login");
                  }}
                  className="font-bold text-primary hover:underline transition cursor-pointer"
                >
                  Login
                </button>
              </div>
            </motion.div>
          )}

          {mode === "forgot" && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center mb-6 space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Reset Password 🔒</h2>
                <p className="text-xs text-muted-foreground">Enter your email to receive a recovery link</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs">
                    <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-9 h-11 border-border/80 bg-background/50 focus:bg-background transition"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 mt-2 text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>

              {/* Bottom Nav */}
              <div className="text-center mt-6 text-xs text-muted-foreground font-medium">
                Back to{" "}
                <button
                  onClick={() => {
                    setError(null);
                    setSuccessMsg(null);
                    setMode("login");
                  }}
                  className="font-bold text-primary hover:underline transition cursor-pointer"
                >
                  Login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

// Re-export Card component to satisfy subcomponents inside AuthPages
import { Card } from "./ui/card";
