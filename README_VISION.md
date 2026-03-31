# 🎯 Project Vision: AI Identity & Trajectory Tracker

This document outlines the core vision of the project. We are not just building a habit tracker or a journal. We are building an **AI that reveals a person’s hidden trajectory over time**.

---

## 🧠 The Core Problem It Solves

When a user asks:
> “What skills have I built in the last 6 months, and what path am I following?”

The application will reply with structured, hidden patterns extracted from their messy daily logs.

**Example Insights:**
1. **Core Skills:** Backend Development, System Design, Machine Learning
2. **Topics Covered:** Rate Limiting, Load Balancing, Neural Networks
3. **Hidden Trajectory:** *"You are moving toward backend/system engineering with a growing interest in scalable systems, though you've shown a recent drift away from ML."*

---

## 🏗️ Architecture: The Magic Insight Layer

The system involves two distinct AI layers.

### Phase 1: Ingestion Layer (Daily Processing)
Takes unstructured daily logs and converts them into structured JSON.
* **Input:** *"Woke up at 8, did leetcode on trees, read about rate limiting..."*
* **Output:** Structured JSON with `category: coding`, `skills: [FastAPI]`, `topics: [Rate Limiting]`.
* **Current Status:** Implemented via `ai_processer.py`.

### Phase 2: Aggregation (The Pre-Processing Step)
*Crux: DO NOT send 6 months of raw logs to the AI (too expensive and inaccurate).*
Filter and group the DB data numerically before evaluating.
```json
{
  "skills_frequency": { "FastAPI": 25, "System Design": 18, "Machine Learning": 10 },
  "topics_frequency": { "Rate Limiting": 8, "Load Balancer": 6 }
}
```

### Phase 3: The Insight Engine Layer (Long-Term Trajectory)
Takes the aggregated metrics from Phase 2 and prompts the LLM to analyze the long-term patterns, detecting three signals:
1. **Frequency:** What appears most?
2. **Consistency:** Does it appear across many days?
3. **Clustering/Drift:** Are related topics grouped? Have interests shifted recently?

*Example Prompt:*
> "Based on this 6-month activity frequency data (attached JSON), identify core skills, topics covered, infer learning direction, and describe the user's trajectory."

---

## 🚀 Advanced Capabilities (Future Roadmap)

1. **Skill Graphing:** Mapping `System Design -> Rate Limiting, Load Balancer`. Helps AI reason better about related topics.
2. **Drift Detection:** Recognizing when a user shifts focus (e.g., from ML to Backend).
3. **Gap Analysis:** Reminding users of neglected skills ("You haven't revisited ML in 2 months").

**Verdict:** 
This isn't a habit tracker. It is an Identity & Trajectory Engine.
