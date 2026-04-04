"use client";

import styles from "./dashboard.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      {/* TOPBAR */}
      <div className={styles.topbar}>
        <Link href="/" className={styles.tbLogo}>
          day<span>log</span>
        </Link>
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
          <div className={styles.tbAvatar}>RK</div>
        </div>
      </div>

      {children}
    </div>
  );
}
