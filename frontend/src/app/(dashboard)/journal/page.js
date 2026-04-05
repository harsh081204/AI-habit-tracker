"use client";

import { useState, useEffect, useRef } from "react";
import dashStyles from "../dashboard.module.css";
import styles from "./journal.module.css";

const MOCK_ENTRIES = [
  {
    id: 1,
    date: 'Apr 3, 2026',
    title: 'Focused and productive',
    preview: 'Studied rate limiter, gym, lunch with Priya at campus canteen...',
    score: 0.8,
    processed: true,
    raw: 'woke up at 8, did leetcode problem on trees for 2 hours, had lunch with Priya at campus canteen, went to gym (chest day), studied rate limiter concept in the evening, scrolled instagram for too long, slept at 1am',
    narrative: 'You had a highly productive day. Study sessions on rate limiters and trees showed strong technical focus, balanced with a solid gym session. Instagram cost you some late hours — worth watching.',
    mood: 'productive',
    chips_skills: ['rate limiter', 'binary trees', 'system design'],
    chips_people: ['Priya'],
    chips_places: ['campus canteen'],
    activity_entries: [
      { type: 'study', title: 'Leetcode — binary trees', meta: '2 hrs · morning', status: 'done' },
      { type: 'gym', title: 'Chest day', meta: '~1 hr · afternoon', status: 'done' },
      { type: 'social', title: 'Lunch with Priya', meta: 'campus canteen', status: 'done' },
      { type: 'study', title: 'Rate limiter concepts', meta: 'evening', status: 'done' },
      { type: 'leisure', title: 'Instagram scrolling', meta: 'late night', status: 'done' },
    ]
  },
  {
    id: 2,
    date: 'Apr 2, 2026',
    title: 'System design mock',
    preview: 'Mock interview with Arjun, went really well. Had chai at Brew House...',
    score: 0.9,
    processed: true,
    raw: 'Just finished system design mock interview with Arjun, went well. Had chai at Brew House after.',
    narrative: 'A sharp, high-signal day. The system design mock with Arjun went well — strong indicator you\'re interview-ready. Short but very intentional.',
    mood: 'happy',
    chips_skills: ['system design', 'distributed systems'],
    chips_people: ['Arjun'],
    chips_places: ['Brew House'],
    activity_entries: [
      { type: 'work', title: 'System design mock with Arjun', meta: 'interview prep', status: 'done' },
      { type: 'social', title: 'Chai at Brew House', meta: 'post-mock', status: 'done' },
    ]
  }
];

export default function JournalPage() {
  const [entries, setEntries] = useState(MOCK_ENTRIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentEntry, setCurrentEntry] = useState(MOCK_ENTRIES[0]);
  const [mode, setMode] = useState("result"); // editor, processing, result
  const [procStep, setProcStep] = useState(0);
  const [saveStatus, setSaveStatus] = useState("saved");
  const editorRef = useRef(null);

  const filteredEntries = entries.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleType = () => {
    setSaveStatus("saving");
    setTimeout(() => setSaveStatus("saved"), 1500);
  };

  const startNewEntry = () => {
    const fresh = {
      id: Date.now(),
      date: 'Apr 4, 2026',
      title: 'New draft',
      preview: 'Start writing...',
      score: 0,
      processed: false,
      raw: '',
      narrative: '',
      mood: 'neutral',
      chips_skills: [],
      chips_people: [],
      chips_places: [],
      activity_entries: []
    };
    setEntries([fresh, ...entries]);
    setCurrentEntry(fresh);
    setMode("editor");
  };

  const submitEntry = () => {
    setMode("processing");
    setProcStep(1);
    
    const steps = [1, 2, 3, 4];
    steps.forEach((step, idx) => {
      setTimeout(() => {
        setProcStep(step + 1);
        if (step === 4) {
          setTimeout(() => {
            const processed = { ...currentEntry, processed: true, narrative: "Simulated result narrative...", score: 0.7 };
            setCurrentEntry(processed);
            setMode("result");
          }, 800);
        }
      }, (idx + 1) * 800);
    });
  };

  return (
    <div className={styles.journalBody}>
      {/* SIDEBAR */}
      <div className={dashStyles.sidebar}>
        <div className={dashStyles.sbHead}>
          <button className={dashStyles.sbNewBtn} onClick={startNewEntry}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            New entry
          </button>
          <input 
            className={dashStyles.sbSearch} 
            placeholder="Search entries..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={dashStyles.sbEntries}>
          {filteredEntries.map(e => (
            <div 
              key={e.id} 
              className={`${dashStyles.entryItem} ${currentEntry?.id === e.id ? dashStyles.entryItemActive : ''}`}
              onClick={() => {
                setCurrentEntry(e);
                setMode(e.processed ? "result" : "editor");
              }}
            >
              <div className={dashStyles.eiDate}>{e.date}</div>
              <div className={dashStyles.eiRow}>
                <div className={dashStyles.eiTitle} style={{ flex: 1 }}>{e.title || "Untitled"}</div>
                {e.processed && <div className={dashStyles.eiScore}>{e.score.toFixed(1)}</div>}
              </div>
              <div className={dashStyles.eiPreview}>{e.preview}</div>
              {e.processed && (
                <div className={dashStyles.eiChips}>
                  {e.chips_skills.slice(0, 2).map(s => <span key={s} className={`${dashStyles.eiChip} ${dashStyles.eiChipG}`}>{s}</span>)}
                  {e.chips_people.slice(0, 1).map(p => <span key={p} className={`${dashStyles.eiChip} ${dashStyles.eiChipB}`}>{p}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className={styles.main}>
        {mode === "editor" && (
          <div className={styles.editorState}>
            <div className={styles.editorToolbar}>
              <div className={styles.etLeft}>
                <span className={styles.etDate}>{currentEntry?.date}</span>
                <span className={`${styles.etStatus} ${saveStatus === 'saved' ? styles.etStatusSaved : styles.etStatusSaving}`}>
                  {saveStatus}
                </span>
              </div>
              <div className={styles.etRight}>
                <button className={styles.btnFormat}><b>B</b></button>
                <button className={styles.btnFormat}><i>I</i></button>
                <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }} onClick={submitEntry}>
                  Submit
                </button>
              </div>
            </div>
            <div className={styles.editorArea}>
              <div 
                className={styles.editorContent} 
                contentEditable 
                onInput={handleType}
                ref={editorRef}
                suppressContentEditableWarning={true}
              >
                {currentEntry?.raw}
              </div>
            </div>
            <div className={styles.charCount}>0 words</div>
          </div>
        )}

        {mode === "processing" && (
          <div className={styles.processingState}>
            <div className={styles.procSpinner}></div>
            <div className={styles.procTitle}>Processing your entry</div>
            <p className={styles.procSub}>AI is reading your day...</p>
            <div className={styles.procSteps}>
              <div className={`${styles.procStep} ${procStep > 1 ? styles.procStepDone : procStep === 1 ? styles.procStepActive : ''}`}>
                <div className={styles.procStepDot}></div>Parsing activities and events
              </div>
              <div className={`${styles.procStep} ${procStep > 2 ? styles.procStepDone : procStep === 2 ? styles.procStepActive : ''}`}>
                <div className={styles.procStepDot}></div>Extracting skills and people
              </div>
              <div className={`${styles.procStep} ${procStep > 3 ? styles.procStepDone : procStep === 3 ? styles.procStepActive : ''}`}>
                <div className={styles.procStepDot}></div>Scoring productivity
              </div>
              <div className={`${styles.procStep} ${procStep > 4 ? styles.procStepDone : procStep === 4 ? styles.procStepActive : ''}`}>
                <div className={styles.procStepDot}></div>Writing your journal narrative
              </div>
            </div>
          </div>
        )}

        {mode === "result" && currentEntry && (
          <div className={styles.resultState}>
            <div className={styles.resultToolbar}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '7px 14px', fontSize: '12px' }}
                onClick={() => setMode("editor")}
              >
                Edit raw
              </button>
              <span className={styles.resultDate}>{currentEntry.date}</span>
              <button className="btn btn-green" style={{ padding: '7px 18px', fontSize: '12px' }}>
                Save entry
              </button>
            </div>
            <div className={styles.resultBody}>
              <div className={styles.resultMoodRow}>
                <span className="badge badge-green" style={{ background: 'rgba(168,198,117,0.2)', color: '#3a5a10', padding: '6px 14px' }}>
                  {currentEntry.mood}
                </span>
                <span className="badge" style={{ background: 'var(--c-yellow)', color: '#7a6000', border: '1px solid rgba(33,40,68,0.1)', padding: '6px 14px' }}>
                  productivity {currentEntry.score.toFixed(1)}
                </span>
                <span className="badge" style={{ background: 'rgba(33,40,68,0.06)', color: 'var(--c-navy)', padding: '6px 14px' }}>
                  13 day streak
                </span>
              </div>
              <div className={styles.resultNarrative}>"{currentEntry.narrative}"</div>
              
              <div className={styles.resultSection}>
                <div className={styles.rsLabel}>Activities ({currentEntry.activity_entries.length})</div>
                <div className={styles.entriesGrid}>
                  {currentEntry.activity_entries.map((a, i) => (
                    <div key={i} className={styles.entryCard}>
                      <div className={styles.ecType}>{a.type}</div>
                      <div className={styles.ecTitle}>{a.title}</div>
                      <div className={styles.ecMeta}>{a.meta}</div>
                      <span className={`${styles.ecBadge} ${a.status === 'done' ? styles.ecDone : styles.ecPending}`}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.resultSection}>
                <div className={styles.rsLabel}>Skills touched</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {currentEntry.chips_skills.map(s => (
                    <span key={s} className="badge" style={{ background: 'rgba(168,198,117,0.2)', color: '#3a5a10' }}>{s}</span>
                  ))}
                </div>
              </div>

              <div className={styles.resultSection}>
                <div className={styles.rsLabel}>People met</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {currentEntry.chips_people.map(p => (
                    <span key={p} className="badge" style={{ background: 'rgba(32,129,195,0.1)', color: '#145585' }}>{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
