"use client";

import styles from "../auth.module.css";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const [showPw, setShowPw] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const { signup, loading } = useAuth();

  const getStrength = (v) => {
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    return score;
  };

  const strength = getStrength(password);
  const colors = ['#d94040','#e4a000','#2081c3','#a8c675'];
  const labels = ['weak','fair','good','strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!agreed) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const res = await signup({ firstName, lastName, email, password });
    if (!res.success) {
      setError(res.error || "Signup failed. Please try again.");
    }
  };

  return (
    <>
      <div className={styles.tabRow}>
        <Link href="/login" className={styles.tab}>Log in</Link>
        <Link href="/signup" className={`${styles.tab} ${styles.tabActive}`}>Sign up</Link>
      </div>

      <form id="signup-form" onSubmit={handleSubmit}>
        <h1 className={styles.formTitle}>Create account</h1>
        <p className={styles.formSub}>Start tracking your days in under a minute.</p>

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

        <div className={styles.fieldRow} style={{ marginBottom: '1rem' }}>
          <div className={styles.field} style={{ marginBottom: 0 }}>
            <label className={styles.label}>First name</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Rahul" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className={styles.field} style={{ marginBottom: 0 }}>
            <label className={styles.label}>Last name</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Kumar" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

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
              placeholder="Min. 8 characters" 
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
          
          {password && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', gap: '3px', marginBottom: '3px' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    style={{ 
                      height: '3px', 
                      flex: 1, 
                      borderRadius: '2px', 
                      background: i <= strength ? colors[strength-1] : 'rgba(33,40,68,0.1)',
                      transition: 'background 0.2s'
                    }} 
                  ></div>
                ))}
              </div>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: colors[strength-1] }}>
                {labels[strength-1] || 'weak'}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '1.25rem' }}>
          <input 
            type="checkbox" 
            id="s-terms" 
            style={{ width: '15px', height: '15px', marginTop: '1px' }} 
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <label htmlFor="s-terms" style={{ fontSize: '12px', color: 'rgba(33,40,68,0.55)', lineHeight: 1.5 }}>
            I agree to the <a href="#" style={{ color: 'var(--c-blue)', textDecoration: 'none' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--c-blue)', textDecoration: 'none' }}>Privacy Policy</a>
          </label>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '12px', marginBottom: '1.25rem' }}
          disabled={loading}
          type="submit"
        >
          {loading ? "Creating account..." : "Create account"}
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

        <p className={styles.switchText}>Already have an account? <Link href="/login">Log in</Link></p>
      </form>
    </>
  );
}
