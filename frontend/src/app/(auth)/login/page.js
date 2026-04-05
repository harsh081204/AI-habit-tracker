"use client";

import styles from "../auth.module.css";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || "Login failed. Please check your credentials.");
    }
  };

  return (
    <>
      <div className={styles.tabRow}>
        <Link href="/login" className={`${styles.tab} ${styles.tabActive}`}>Log in</Link>
        <Link href="/signup" className={styles.tab}>Sign up</Link>
      </div>

      <form id="login-form" onSubmit={handleSubmit}>
        <h1 className={styles.formTitle}>Welcome back</h1>
        <p className={styles.formSub}>Log in to continue your journaling streak.</p>

        {error && (
          <div style={{ 
            padding: '10px', 
            background: 'rgba(217, 64, 64, 0.1)', 
            color: 'var(--c-error)', 
            borderRadius: '8px', 
            fontSize: '12px', 
            marginBottom: '1rem',
            border: '1px solid rgba(217, 64, 64, 0.2)'
          }}>
            {error}
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input 
            type="email" 
            className="input" 
            placeholder="you@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <div className={styles.pwWrap}>
            <input 
              type={showPw ? "text" : "password"} 
              className="input" 
              placeholder="Your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              className={styles.pwToggle} 
              onClick={() => setShowPw(!showPw)}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3"/>
                <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'right', marginBottom: '1.25rem' }}>
          <a href="#" style={{ fontSize: '12px', color: 'var(--c-blue)', textDecoration: 'none' }}>Forgot password?</a>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '12px', marginBottom: '1.25rem' }}
          disabled={loading}
          type="submit"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <div className={styles.orRow}>
          <div className={styles.orLine}></div>
          <span className={styles.orText}>or</span>
          <div className={styles.orLine}></div>
        </div>

        <button className={styles.btnGoogle} type="button">
          <svg className={styles.gIcon} width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className={styles.switchText}>Don't have an account? <Link href="/signup">Sign up free</Link></p>
      </form>
    </>
  );
}
