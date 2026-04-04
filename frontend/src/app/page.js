import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      {/* NAV */}
      <nav className={styles.nav}>
        <a href="/" className={styles.logo}>
          day<span>log</span>
        </a>
        <ul className={styles.navLinks}>
          <li><a href="#">How it works</a></li>
          <li><a href="#">Features</a></li>
          <li><a href="#">Pricing</a></li>
          <li><a href="#">Log in</a></li>
          <li><a href="#" className={styles.navCta}>Get started</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div>
          <p className={styles.heroEyebrow}>Your daily intelligence layer</p>
          <h1 className={styles.heroH1}>
            Write your day.<br /><em>Understand</em> your life.
          </h1>
          <p className={styles.heroSub}>
            Daylog turns your raw daily notes into structured insight — tracking skills, habits, people, and patterns automatically, so you can focus on what matters.
          </p>
          <div className={styles.heroBtns}>
            <button className="btn btn-primary">Start journaling free</button>
            <button className="btn btn-secondary">See how it works</button>
          </div>
          <div className={styles.heroSocial}>
            <div className={styles.heroAvatars}>
              <div className={styles.av} style={{ background: '#a8c675', color: '#212844' }}>RK</div>
              <div className={styles.av} style={{ background: '#2081c3', color: 'white' }}>PS</div>
              <div className={styles.av} style={{ background: '#212844', color: '#fffff4' }}>AV</div>
              <div className={styles.av} style={{ background: '#fffed7', color: '#212844', borderColor: 'rgba(33,40,68,0.2)' }}>+</div>
            </div>
            <p className={styles.heroSocialText}>Joined by <strong>2,400+ students</strong> and builders</p>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div className={styles.journalCard}>
            <span className={styles.jcBadge}>Processed</span>
            <div className={styles.jcBar}>
              <div className={styles.jcDot} style={{ background: 'var(--c-green)' }}></div>
              <div className={styles.jcDot} style={{ background: 'var(--c-yellow)', border: '1px solid rgba(33,40,68,0.2)' }}></div>
              <div className={styles.jcDot} style={{ background: 'rgba(33,40,68,0.1)' }}></div>
              <span className={styles.jcDate}>Apr 3, 2026</span>
            </div>
            <h3 className={styles.jcTitle}>A focused, productive day</h3>
            <p className={styles.jcText}>
              You tackled system design concepts for 2 hours, hit the gym for chest day, and had a great lunch with Priya. Instagram cost you about an hour — something to watch.
            </p>
            <div className={styles.jcChips}>
              <span className="badge" style={{ background: 'rgba(168,198,117,0.2)', color: '#3a5a10' }}>rate limiter</span>
              <span className="badge" style={{ background: 'rgba(168,198,117,0.2)', color: '#3a5a10' }}>system design</span>
              <span className="badge" style={{ background: 'rgba(32,129,195,0.1)', color: '#145585' }}>Priya</span>
              <span className="badge" style={{ background: 'rgba(255,254,215,0.9)', color: '#7a6000', border: '1px solid rgba(33,40,68,0.1)' }}>productive</span>
            </div>
            <div className={styles.jcStats}>
              <div className={styles.jcStat}>
                <div className={styles.jcStatVal}>0.8</div>
                <div className={styles.jcStatLbl}>score</div>
              </div>
              <div className={styles.jcStat}>
                <div className={styles.jcStatVal}>4</div>
                <div className={styles.jcStatLbl}>activities</div>
              </div>
              <div className={styles.jcStat}>
                <div className={styles.jcStatVal}>12</div>
                <div className={styles.jcStatLbl}>day streak</div>
              </div>
            </div>
          </div>
          <div className={styles.jcShadow}></div>
        </div>
      </section>

      <hr className={styles.sectionDivider} />

      {/* HOW IT WORKS */}
      <section style={{ padding: '4rem 0' }}>
        <p className="section-label" style={{ textAlign: 'center', border: 'none', marginBottom: '0.75rem' }}>How it works</p>
        <h2 className="font-display" style={{ fontSize: '34px', textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '-0.02em', color: 'var(--c-navy)' }}>
          Three steps. Zero friction.
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(33, 40, 68, 0.55)', textAlign: 'center', lineHeight: '1.7', maxWidth: '480px', margin: '0 auto 3rem' }}>
          No templates, no forms. Just write like you think — daylog figures out the rest.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          {[
            { num: '01', title: 'Write freely', text: 'Dump your day in plain language. No structure required — write like you\'re texting a friend.' },
            { num: '02', title: 'AI processes it', text: 'Hit submit. Our LLM extracts skills, people, moods, habits and generates your journal narrative.' },
            { num: '03', title: 'Track your growth', text: 'See patterns over time — your skill trajectory, social graph, and productivity trends.' }
          ].map((step, idx) => (
            <div key={idx} style={{ padding: '1.5rem', background: 'white', border: '1px solid rgba(33,40,68,0.08)', borderRadius: '16px' }}>
              <div className="font-display" style={{ fontSize: '36px', color: 'rgba(33,40,68,0.08)', lineHeight: 1, marginBottom: '0.75rem' }}>{step.num}</div>
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--c-navy)', marginBottom: '0.5rem' }}>{step.title}</div>
              <p style={{ fontSize: '13px', color: 'rgba(33,40,68,0.6)', lineHeight: '1.6' }}>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className={styles.sectionDivider} />

      {/* FEATURES */}
      <section className={styles.features}>
        <p className="section-label" style={{ textAlign: 'center', border: 'none', marginBottom: '0.75rem' }}>Features</p>
        <h2 className="font-display" style={{ fontSize: '34px', textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '-0.02em', color: 'var(--c-navy)' }}>
          Built for people who think in text
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(33, 40, 68, 0.55)', textAlign: 'center', lineHeight: '1.7', maxWidth: '480px', margin: '0 auto 3rem' }}>
          Everything you need to turn a habit of writing into a system of self-knowledge.
        </p>
        <div className={styles.featGrid}>
          <div className={`${styles.featCard} ${styles.featCardNavy}`}>
            <span className={styles.featTag} style={{ background: 'rgba(168,198,117,0.2)', color: '#a8c675' }}>AI-powered</span>
            <div className={styles.featTitle} style={{ color: 'var(--c-cream)' }}>Entity extraction</div>
            <p className={styles.featText} style={{ color: 'rgba(255,255,244,0.6)' }}>Automatically pulls people, places, skills, mood, and activities from your raw text. No tagging required.</p>
          </div>
          <div className={`${styles.featCard} ${styles.featCardWhite}`}>
            <span className={styles.featTag} style={{ background: 'rgba(32,129,195,0.1)', color: '#145585' }}>Editor</span>
            <div className={styles.featTitle} style={{ color: 'var(--c-navy)' }}>Notion-like block editor</div>
            <p className={styles.featText} style={{ color: 'rgba(33,40,68,0.6)' }}>A clean, distraction-free writing surface. Autosaves every two seconds so you never lose a thought.</p>
          </div>
          <div className={`${styles.featCard} ${styles.featCardYellow}`}>
            <span className={styles.featTag} style={{ background: 'rgba(33,40,68,0.08)', color: '#7a6000' }}>Analytics</span>
            <div className={styles.featTitle} style={{ color: 'var(--c-navy)' }}>Productivity scoring</div>
            <p className={styles.featText} style={{ color: 'rgba(33,40,68,0.6)' }}>Every entry gets a 0–1 productivity score. Track your best days and your patterns over weeks.</p>
          </div>
          <div className={`${styles.featCard} ${styles.featCardGreen}`}>
            <span className={styles.featTag} style={{ background: 'rgba(33,40,68,0.07)', color: '#3a5a10' }}>Private</span>
            <div className={styles.featTitle} style={{ color: 'var(--c-navy)' }}>Fully private by default</div>
            <p className={styles.featText} style={{ color: 'rgba(33,40,68,0.6)' }}>Your journal is yours alone. Every entry is scoped to your account — no sharing, no leakage.</p>
          </div>
        </div>
      </section>

      <hr className={styles.sectionDivider} />

      {/* SOCIAL PROOF & TESTIMONIALS */}
      <section className={styles.social}>
        <p className="section-label" style={{ textAlign: 'center', border: 'none', marginBottom: '0.75rem' }}>Social proof</p>
        <h2 className="font-display" style={{ fontSize: '34px', textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '-0.02em', color: 'var(--c-navy)' }}>
          Loved by students and builders
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(33, 40, 68, 0.55)', textAlign: 'center', lineHeight: '1.7', maxWidth: '480px', margin: '0 auto 3rem' }}>
          People using daylog to track their learning, habits, and life.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
          {[
            { val: '2.4k', lbl: 'Active users' },
            { val: '38k', lbl: 'Entries processed' },
            { val: '0.73', lbl: 'Avg productivity score' },
            { val: '9 days', lbl: 'Avg streak length' }
          ].map((s, idx) => (
            <div key={idx} style={{ textAlign: 'center', padding: '1.5rem 1rem', background: 'white', border: '1px solid rgba(33,40,68,0.08)', borderRadius: '16px' }}>
              <div className="font-display" style={{ fontSize: '32px', color: 'var(--c-navy)', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '12px', color: 'rgba(33,40,68,0.5)', marginTop: '6px' }}>{s.lbl}</div>
            </div>
          ))}
        </div>
        <div className={styles.testimonials}>
          <div className={styles.testi}>
            <p className={styles.testiText}>"I've tried 10 journaling apps. This is the first one that actually shows me what I did — not just what I wrote."</p>
            <div className={styles.testiAuthor}>
              <div className={styles.testiAv} style={{ background: '#a8c675', color: '#212844' }}>RK</div>
              <div><div className={styles.testiName}>Rahul K.</div><div className={styles.testiRole}>CS student, IIT Delhi</div></div>
            </div>
          </div>
          <div className={styles.testi}>
            <p className={styles.testiText}>"The skill tracking alone is worth it. I can literally see how many hours I've put into system design this month."</p>
            <div className={styles.testiAuthor}>
              <div className={styles.testiAv} style={{ background: '#2081c3', color: 'white' }}>PS</div>
              <div><div className={styles.testiName}>Priya S.</div><div className={styles.testiRole}>SWE intern, Bangalore</div></div>
            </div>
          </div>
          <div className={styles.testi}>
            <p className={styles.testiText}>"Autosave + AI processing = I just write and forget. The structured output appears on its own. Genuinely magical."</p>
            <div className={styles.testiAuthor}>
              <div className={styles.testiAv} style={{ background: '#212844', color: '#fffff4' }}>AV</div>
              <div><div className={styles.testiName}>Arjun V.</div><div className={styles.testiRole}>Indie hacker, Pune</div></div>
            </div>
          </div>
        </div>
      </section>

      <hr className={styles.sectionDivider} />

      {/* PRICING */}
      <section className={styles.pricing}>
        <p className="section-label" style={{ textAlign: 'center', border: 'none', marginBottom: '0.75rem' }}>Pricing</p>
        <h2 className="font-display" style={{ fontSize: '34px', textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '-0.02em', color: 'var(--c-navy)' }}>
          Simple, honest pricing
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(33, 40, 68, 0.55)', textAlign: 'center', lineHeight: '1.7', maxWidth: '480px', margin: '0 auto 3rem' }}>
          Start free. Upgrade when you're ready.
        </p>
        <div className={styles.pricingGrid}>
          <div className={styles.priceCard}>
            <div className={styles.priceName} style={{ color: 'rgba(33,40,68,0.5)' }}>Free</div>
            <div className={styles.priceAmount} style={{ color: 'var(--c-navy)' }}>₹0</div>
            <div className={styles.pricePeriod} style={{ color: 'rgba(33,40,68,0.4)' }}>forever</div>
            <ul className={styles.priceFeatures}>
              <li style={{ color: 'rgba(33,40,68,0.7)' }}><span className={styles.pfDot} style={{ background: 'var(--c-green)' }}></span>Up to 30 entries/month</li>
              <li style={{ color: 'rgba(33,40,68,0.7)' }}><span className={styles.pfDot} style={{ background: 'var(--c-green)' }}></span>AI processing on every entry</li>
              <li style={{ color: 'rgba(33,40,68,0.7)' }}><span className={styles.pfDot} style={{ background: 'var(--c-green)' }}></span>Basic stats & streak tracking</li>
              <li style={{ color: 'rgba(33,40,68,0.35)' }}><span className={styles.pfDot} style={{ background: 'rgba(33,40,68,0.15)' }}></span>Advanced analytics</li>
              <li style={{ color: 'rgba(33,40,68,0.35)' }}><span className={styles.pfDot} style={{ background: 'rgba(33,40,68,0.15)' }}></span>Export & integrations</li>
            </ul>
            <button className={styles.priceBtn} style={{ background: 'transparent', color: 'var(--c-navy)', border: '1.5px solid rgba(33,40,68,0.2)' }}>Get started free</button>
          </div>
          <div className={`${styles.priceCard} ${styles.priceCardFeatured}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div className={styles.priceName} style={{ color: 'rgba(255,255,244,0.6)' }}>Pro</div>
              <span className="badge" style={{ background: 'var(--c-green)', color: 'var(--c-navy)', fontSize: '9px', fontWeight: 600 }}>Popular</span>
            </div>
            <div className={styles.priceAmount} style={{ color: 'var(--c-cream)' }}>₹199</div>
            <div className={styles.pricePeriod} style={{ color: 'rgba(255,255,244,0.4)' }}>per month</div>
            <ul className={styles.priceFeatures}>
              <li style={{ color: 'rgba(255,255,244,0.75)' }}><span className={styles.pfDot} style={{ background: 'var(--c-green)' }}></span>Unlimited entries</li>
              <li style={{ color: 'rgba(255,255,244,0.75)' }}><span className={styles.pfDot} style={{ background: 'var(--c-green)' }}></span>Full AI processing & insights</li>
              <li style={{ color: 'rgba(255,255,244,0.75)' }}><span className={styles.pfDot} style={{ background: 'var(--c-green)' }}></span>Advanced analytics dashboard</li>
              <li style={{ color: 'rgba(255,255,244,0.75)' }}><span className={styles.pfDot} style={{ background: 'var(--c-green)' }}></span>Skill & people graph over time</li>
              <li style={{ color: 'rgba(255,255,244,0.75)' }}><span className={styles.pfDot} style={{ background: 'var(--c-green)' }}></span>CSV export</li>
            </ul>
            <button className={styles.priceBtn} style={{ background: 'var(--c-green)', color: 'var(--c-navy)' }}>Start Pro free for 7 days</button>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <h2 className={styles.ctaH}>Start writing. Start knowing.</h2>
          <p className={styles.ctaSub}>It takes 60 seconds to set up. No credit card needed.<br />Just you, a blank editor, and your first entry.</p>
          <div className={styles.ctaBtns}>
            <button className={styles.btnCtaPrimary}>Create your free account</button>
            <button className={styles.btnCtaGhost}>See a sample entry</button>
          </div>
          <p className={styles.ctaNote}>Free forever plan available · No credit card required</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <span className={styles.footerLogo}>daylog</span>
        <ul className={styles.footerLinks}>
          <li><a href="#">About</a></li>
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Terms</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
        <span className={styles.footerCopy}>© 2026 daylog</span>
      </footer>

    </div>
  );
}
