"use client";

import styles from "./dashboard.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Get initials from user name (e.g., "Rahul Kumar" -> "RK")
  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={styles.shell}>
      {/* TOPBAR */}
      <div className={styles.topbar}>
        <div className={styles.tbLeft}>
          <Link href="/" className={styles.tbLogo}>
            day<span>log</span>
          </Link>
        </div>

        <div className={styles.tbNav}>
          <Link 
            href="/journal" 
            className={`${styles.tbLink} ${pathname.startsWith('/journal') ? styles.tbLinkActive : ''}`}
          >
            Journal
          </Link>
          <Link 
            href="/profile" 
            className={`${styles.tbLink} ${pathname === '/profile' ? styles.tbLinkActive : ''}`}
          >
            Profile
          </Link>
          <button 
            className={styles.tbLink} 
            onClick={logout}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontFamily: 'inherit',
              padding: '0 0.5rem'
            }}
          >
            Sign out
          </button>
          <div className={styles.tbAvatar} title={user?.name}>
            {getInitials(user?.name || user?.email)}
          </div>
        </div>
      </div>

      <div className={styles.dashboardContainer}>
        {children}
      </div>
    </div>
  );
}
