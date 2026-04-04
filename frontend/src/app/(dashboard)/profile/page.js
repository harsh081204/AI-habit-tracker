"use client";

import styles from "./profile.module.css";
import { useState } from "react";

const STREAK_PATTERN = [0, 1, 2, 3, 2, 1, 3, 0, 2, 3, 3, 1, 0, 2, 3, 2, 1, 3, 2, 3, 0, 1, 3, 2, 3, 3, 2, 1, 3, 3];
const STREAK_COLORS = ['rgba(33, 40, 68, 0.07)', 'rgba(168, 198, 117, 0.3)', 'rgba(168, 198, 117, 0.6)', '#a8c675'];

const PROD_SCORES = [0.4, 0.7, 0.8, 0.6, 0.9, 0.5, 0.8, 0.7, 0.3, 0.9, 0.8, 0.6, 0.75, 0.8];
const PROD_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S'];

const SKILLS = [
  { name: 'system design', count: 18, max: 18, color: 'var(--c-blue)' },
  { name: 'rate limiter', count: 12, max: 18, color: 'var(--c-blue)' },
  { name: 'leetcode / dsa', count: 10, max: 18, color: 'var(--c-blue)' },
  { name: 'distributed sys', count: 8, max: 18, color: 'var(--c-blue)' },
  { name: 'os concepts', count: 6, max: 18, color: 'var(--c-blue)' },
];

const MOODS = [
  { name: 'productive', pct: 38, color: '#a8c675' },
  { name: 'happy', pct: 22, color: '#2081c3' },
  { name: 'neutral', pct: 18, color: 'rgba(33, 40, 68, 0.3)' },
  { name: 'tired', pct: 14, color: '#e4a000' },
  { name: 'anxious', pct: 8, color: '#d94040' },
];

const PEOPLE = [
  { initials: 'PS', name: 'Priya S.', count: 14, bg: '#2081c3', fg: 'white' },
  { initials: 'AV', name: 'Arjun V.', count: 9, bg: '#212844', fg: '#fffff4' },
  { initials: 'RN', name: 'Rohan N.', count: 6, bg: '#a8c675', fg: '#212844' },
  { initials: 'SK', name: 'Sneha K.', count: 4, bg: '#fffed7', fg: '#212844' },
];

const RECENT_ENTRIES = [
  { date: 'Apr 3', title: 'Focused and productive', score: 0.8, color: 'var(--c-green)' },
  { date: 'Apr 2', title: 'System design mock with Arjun', score: 0.9, color: 'var(--c-green)' },
  { date: 'Apr 1', title: 'Chill day', score: 0.3, color: 'rgba(33, 40, 68, 0.25)' },
  { date: 'Mar 31', title: 'Deep work on OS concepts', score: 0.85, color: 'var(--c-green)' },
];

export default function ProfilePage() {
  const avgProd = PROD_SCORES.reduce((a, b) => a + b, 0) / PROD_SCORES.length;

  return (
    <div className={styles.page}>
      
      {/* HEADER */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatarLg}>RK</div>
          <div className={styles.avatarBadge}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.profileName}>Rahul Kumar</div>
          <div className={styles.profileEmail}>rahul.kumar@example.com</div>
          <div className={styles.profileTags}>
            <span className={`${styles.ptag} ${styles.ptagGreen}`}>cs_student</span>
            <span className={`${styles.ptag} ${styles.ptagBlue}`}>IIT Delhi</span>
            <span className={`${styles.ptag} ${styles.ptagNavy}`}>42 entries</span>
          </div>
        </div>
        <div className={styles.profileActions}>
          <button className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '13px' }}>
            Edit profile
          </button>
          <span className={styles.memberSince}>member since Jan 2026</span>
        </div>
      </div>

      {/* STATS ROW */}
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.statCardNavy}`}>
          <div className={styles.statVal} style={{ color: 'var(--c-green)' }}>42</div>
          <div className={styles.statLbl} style={{ color: 'rgba(255,255,244,0.45)' }}>Total entries</div>
          <div className={styles.statSub} style={{ color: 'rgba(255,255,244,0.25)' }}>+6 this month</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statVal} style={{ color: 'var(--c-navy)' }}>13</div>
          <div className={styles.statLbl}>Current streak</div>
          <div className={styles.statSub} style={{ color: 'var(--c-green)' }}>best: 19 days</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardYellow}`}>
          <div className={styles.statVal} style={{ color: 'var(--c-navy)' }}>0.74</div>
          <div className={styles.statLbl}>Avg productivity</div>
          <div className={styles.statSub} style={{ color: 'rgba(33, 40, 68, 0.4)' }}>this month</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statVal} style={{ color: 'var(--c-blue)' }}>284</div>
          <div className={styles.statLbl}>Skills logged</div>
          <div className={styles.statSub} style={{ color: 'rgba(33, 40, 68, 0.35)' }}>across 18 topics</div>
        </div>
      </div>

      {/* CHARTS ROW 1 */}
      <div className={styles.twoCol}>
        <div className={styles.card}>
          <div className={styles.secLabel}>Activity streak — last 30 days</div>
          <div className={styles.streakGrid}>
            {STREAK_PATTERN.map((s, i) => (
              <div 
                key={i} 
                className={styles.streakCell} 
                style={{ background: STREAK_COLORS[s] }}
                title={`Day ${i+1}`}
              ></div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'rgba(33,40,68,0.3)' }}>less</span>
            {STREAK_COLORS.map(c => (
              <div key={c} style={{ width: '10px', height: '10px', borderRadius: '2px', background: c }}></div>
            ))}
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'rgba(33,40,68,0.3)' }}>more</span>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.secLabel}>Productivity — last 14 entries</div>
          <div className={styles.prodChart}>
            <div className={styles.prodBars}>
              {PROD_SCORES.map((s, i) => (
                <div key={i} className={styles.prodBarWrap}>
                  <div 
                    className={styles.prodBar} 
                    style={{ 
                      height: `${Math.round(s * 72)}px`,
                      background: s >= 0.7 ? 'var(--c-green)' : s >= 0.5 ? '#e4a000' : 'rgba(33,40,68,0.2)'
                    }}
                  />
                  <div className={styles.prodBarLbl}>{PROD_LABELS[i]}</div>
                </div>
              ))}
            </div>
            <div className={styles.prodAvgLine} style={{ top: `${Math.round((1 - avgProd) * 72)}px` }}></div>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div className={styles.twoCol}>
        <div className={styles.card}>
          <div className={styles.secLabel}>Top skills touched</div>
          <div className={styles.skillsList}>
            {SKILLS.map(s => (
              <div key={s.name} className={styles.skillRow}>
                <div className={styles.skillName}>{s.name}</div>
                <div className={styles.skillTrack}>
                  <div className={styles.skillFill} style={{ width: `${Math.round((s.count/s.max)*100)}%`, background: s.color }}></div>
                </div>
                <div className={styles.skillCount}>{s.count}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.secLabel}>Mood distribution</div>
          <div className={styles.moodBars}>
            {MOODS.map(m => (
              <div key={m.name} className={styles.moodRowItem}>
                <div className={styles.moodName}>{m.name}</div>
                <div className={styles.moodTrack}>
                  <div className={styles.moodFill} style={{ width: `${m.pct}%`, background: m.color }}></div>
                </div>
                <div className={styles.moodPct}>{m.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHARTS ROW 3 */}
      <div className={styles.twoCol}>
        <div className={styles.card}>
          <div className={styles.secLabel}>People met most</div>
          <div className={styles.peopleGrid}>
            {PEOPLE.map(p => (
              <div key={p.name} className={styles.personChip}>
                <div className={styles.personAv} style={{ background: p.bg, color: p.fg }}>{p.initials}</div>
                <div className={styles.personName}>{p.name}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.secLabel} style={{ marginBottom: '1.5rem' }}>Activity breakdown</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
             {/* Simulated Donut Chart using CSS or simple image placeholder */}
             <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'conic-gradient(var(--c-blue) 0% 32%, var(--c-green) 32% 52%, var(--c-navy) 52% 70%, var(--c-yellow) 70% 85%, rgba(33,40,68,0.2) 85% 100%)', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: '18px', background: 'white', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-display)', lineHeight: 1 }}>42</span>
                  <span style={{ fontSize: '7px', fontFamily: 'var(--font-mono)', color: 'rgba(33,40,68,0.4)' }}>entries</span>
                </div>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--c-blue)' }}></div>
                  <span style={{ flex: 1 }}>study</span>
                  <span style={{ color: 'rgba(33,40,68,0.4)', fontFamily: 'var(--font-mono)' }}>32%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--c-green)' }}></div>
                  <span style={{ flex: 1 }}>gym</span>
                  <span style={{ color: 'rgba(33,40,68,0.4)', fontFamily: 'var(--font-mono)' }}>20%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--c-navy)' }}></div>
                  <span style={{ flex: 1 }}>social</span>
                  <span style={{ color: 'rgba(33,40,68,0.4)', fontFamily: 'var(--font-mono)' }}>18%</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* RECENT ENTRIES */}
      <div className={styles.card}>
        <div className={styles.secLabel}>Recent entries</div>
        <div className={styles.recentList}>
          {RECENT_ENTRIES.map(e => (
            <div key={e.date} className={styles.recentItem}>
              <div className={styles.riDate}>{e.date}</div>
              <div className={styles.riTitle}>{e.title}</div>
              <div className={styles.riScore} style={{ color: e.color }}>{e.score.toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
