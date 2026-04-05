import styles from "./auth.module.css";
import Link from "next/link";

export default function AuthLayout({ children }) {
  return (
    <div className={styles.page}>
      {/* LEFT PANEL */}
      <div className={styles.left}>
        <Link href="/" className={styles.leftLogo}>
          day<span>log</span>
        </Link>

        <div className={styles.leftBody}>
          <p className={styles.leftEyebrow}>Your journal, structured</p>
          <h2 className={styles.leftH}>
            Every day you write<br />becomes data<br />you can <em>learn from.</em>
          </h2>
          <p className={styles.leftSub}>
            Daylog transforms your raw daily notes into structured insights — tracking skills, habits, moods, and patterns automatically.
          </p>

          <div className={styles.entryStrip}>
            <div className={styles.entryPill}>
              <div className={styles.epIcon} style={{ background: 'rgba(168,198,117,0.15)' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10l3-3 2 2 5-6" stroke="#a8c675" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div className={styles.epText}>
                <div className={styles.epTitle}>Studied rate limiter · gym · lunch with Priya</div>
                <div className={styles.epMeta}>Apr 3 · 4 activities detected</div>
              </div>
              <div className={styles.epScore}>0.8</div>
            </div>
            
            <div className={styles.entryPill}>
              <div className={styles.epIcon} style={{ background: 'rgba(32,129,195,0.15)' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="2" stroke="#2081c3" stroke-width="1.4"/><path d="M5 7h4M7 5v4" stroke="#2081c3" stroke-width="1.4" stroke-linecap="round"/></svg>
              </div>
              <div className={styles.epText}>
                <div className={styles.epTitle}>System design mock with Arjun · went well</div>
                <div className={styles.epMeta}>Apr 2 · 2 activities detected</div>
              </div>
              <div className={styles.epScore}>0.9</div>
            </div>

            <div className={styles.entryPill}>
              <div className={styles.epIcon} style={{ background: 'rgba(255,254,215,0.2)' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="4" stroke="#fffed7" stroke-width="1.4" opacity="0.7"/><circle cx="7" cy="7" r="1.5" fill="#fffed7" opacity="0.5"/></svg>
              </div>
              <div className={styles.epText}>
                <div className={styles.epTitle}>Chill day · movie with friends · might study</div>
                <div className={styles.epMeta}>Apr 1 · leisure · pending study</div>
              </div>
              <div className={styles.epScore} style={{ color: 'rgba(255,255,244,0.3)' }}>0.3</div>
            </div>
          </div>
        </div>

        <div className={styles.leftFooter}>© 2026 daylog · privacy · terms</div>
      </div>

      {/* RIGHT PANEL (Render children here) */}
      <div className={styles.right}>
        <div className={styles.rightInner}>
          {children}
        </div>
      </div>
    </div>
  );
}
