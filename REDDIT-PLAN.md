# Reddit SRE / Manager / Code Interview — Research & Quiz Plan

**Created:** 2026-07-11  
**Updated:** 2026-07-11 — scoped to **code review only** (no live coding) per recruiter  
**Purpose:** Catalog Reddit community questions about Google SRE manager and code-related interviews, then plan how GSRE quiz content addresses each gap.  
**Companion:** `QUIZ-PLAN.md` (official sources), `todo.txt` (code review MCQ bank)

---

## ★ Your confirmed loop (recruiter)

| Round type | In your loop? | Quiz focus |
|------------|---------------|------------|
| **Code review** (Google Doc, find bugs + suggest fixes) | **Yes** | **`CR-REVIEW`** — P0, build first |
| **Live coding / scripting / LeetCode** | **No** — explicitly ruled out | **Skip** — do not prep `E1` or LeetCode for this interview |
| Systems Architecture (60 min) | Yes (per email) | `SA-VIDEO`, Part B |
| Googleyness & Leadership (45 min) | Yes (per email) | Part C |
| NALSD / troubleshooting / Linux (if scheduled) | Confirm with recruiter | `B5`, `E2`, `E3` only if in your loop |

**Implication:** Reddit threads about scripting rounds, LeetCode variance, and “coding vs code review” are **background context only**. Your technical code round is **review-only** — same family as Google EM code review (200-line snippet, manual trace, no IDE), not writing solutions from scratch.

---

## Executive summary

Reddit does **not** have a large dedicated corpus of “Google SRE Manager interview” posts (only a handful), but there is a **substantial body of related threads** across r/devops, r/sre, r/leetcode, r/ITCareerQuestions, and r/ExperiencedDevs covering:

- What to expect in **SRE manager vs IC** loops (code review, leadership fundamentals, NALSD, troubleshooting, Googleyness)
- **Code-related** rounds: mostly Reddit IC-track debates (scripting vs LeetCode) — **not your loop**; your code round is **review-only**
- **Code review** depth: bug finding, complexity, design, manual trace on Google Doc (Blind/IGotAnOffer/EM reports)
- **Prep anxiety**: recruiter prep guides feel too easy; which books/chapters; how deep on kernel structs
- **Behavioral / Googleyness**: STAR format, what assessors actually score

**Gap in current GSRE bank:** No dedicated **Code Review** module (todo item). For **your** interview, **`CR-REVIEW`** (~25 MCQs, expandable) is the **only** code-round prep module. Troubleshooting/Linux modules (`E2`, `E3`) remain optional unless recruiter confirms those rounds. **`E1` Scripting is explicitly out of scope.**

---

## 1. Reddit thread catalog (28 threads, scored by relevance)

### 1.1 Directly about SRE **manager** interviews

| Score | Subreddit | Title | URL | Key questions raised |
|------:|-----------|-------|-----|----------------------|
| 113 | r/devops | Google SRE Manager interview coming... any advice? | [link](https://reddit.com/r/devops/comments/da4h29/google_sre_manager_interview_coming_any_advice/) | Phone screen vs onsite? Manager = more or less technical? Prep list looks too easy (mutex, semaphores, FS internals). Relocation stress. |
| 22 | r/sre | Skills needed for SRE manager | [link](https://reddit.com/r/sre/comments/140ma5t/skills_needed_for_sre_manager/) | EM → Sr EM → Director skillset; how are manager interviews conducted; does prior Staff tech help? |
| 1 | r/sre (comment thread) | GTK interview for manager position | [o6ozcj comments](https://reddit.com/r/sre/comments/o6ozcj/google_sre_systems_interview_prep/) | “NALSD + GTK upcoming, manager position, very technical, no idea what GTK covers” |

**External corroboration (not Reddit, cited in threads):** Jointaro Google SRE Manager experience reports **leadership fundamentals + code review** in early rounds, then NALSD, troubleshooting, Googleyness; questions like high vs low performer management, unstructured-data trend system.

---

### 1.2 Code review (your round) vs Reddit IC coding threads (skip for prep)

> **Your loop:** code review only — the threads below are catalogued for completeness, not study priority.

| Score | Subreddit | Title | URL | Relevance to **your** loop |
|------:|-----------|-------|-----|----------------------------|
| — | Blind / IGotAnOffer / Exponent | Google EM / SRE EM code review | [IGotAnOffer](https://igotanoffer.com/en/advice/google-code-review-interview), [Exponent L6 EM](https://www.tryexponent.com/experiences/google-staff-engineering-manager-interview-fd33b1) | **Primary prep** — 45 min, Google Doc, find bugs + fix, no IDE |
| 113 | r/devops | Google SRE Manager interview advice | [link](https://reddit.com/r/devops/comments/da4h29/) | Manager loop includes **code review** in early rounds (Jointaro corroborates) |
| 13 | r/leetcode | Google Systems Engineer, SRE Interview | [link](https://reddit.com/r/leetcode/comments/1klu37j/) | IC track — **scripting** round; **skip** (not your loop) |
| 169 | r/leetcode | Surprised by Google Interview | [link](https://reddit.com/r/leetcode/comments/1fm8wmh/) | LeetCode variance for IC SWE/SRE-SWE; **skip** |
| 17 | r/leetcode | Google SRE only 3 onsite interviews | [link](https://reddit.com/r/leetcode/comments/1kdf6fn/) | Phone screen coding; **skip** unless your phone screen included coding |
| 755 | r/leetcode | Passed Google L4 SWE, AMA | [link](https://reddit.com/r/leetcode/comments/1k2er92/) | SWE coding loop; **skip** |
| 286 | r/ExperiencedDevs | My interview experience as an experienced dev | [link](https://reddit.com/r/ExperiencedDevs/comments/lm6w8t/) | Anti-LeetCode sentiment; tangential |
| 45 | r/sre | When do/would you walk away from an SRE interview? | [link](https://reddit.com/r/sre/comments/raabnp/) | Live coding preferences; **skip** |

**Code review:** No high-scoring Reddit thread titled “Google code review interview” was found; **Blind, IGotAnOffer, Exponent, and Jointaro SRE Manager reports** are the best public sources. **`CR-REVIEW`** module is built from those + [Google eng-practices](https://github.com/google/eng-practices/blob/master/review/reviewer/looking-for.md).

---

### 1.3 Linux internals / SRE-SE track depth

| Score | Subreddit | Title | URL | Key questions raised |
|------:|-----------|-------|-----|----------------------|
| 62 | r/sre | Advice for Google SRE/SE interview's Linux internals | [link](https://reddit.com/r/sre/comments/z5c3m7/advice_for_google_srese_interviews_linux_internals/) | Cloud admin background — how to go deep? Kerrisk vs Love? Hands-on without daily SSH? |
| 38 | r/sre | Google SRE Linux Internals Interview | [link](https://reddit.com/r/sre/comments/wc4ryg/google_sre_linux_internals_interview/) | Kernel `task_struct` depth vs user-space implications? LPI vs LKD vs LWN? |
| 39 | r/sre | Google SRE systems interview prep | [link](https://reddit.com/r/sre/comments/o6ozcj/google_sre_systems_interview_prep/) | Linux/OS focus confirmed? Coding = scripting or LeetCode? NALSD guaranteed? |
| ~10 | r/sre | Linux for Google SRE | [link](https://reddit.com/r/sre/comments/1fkwupo/linux_for_google_sre/) | Fundamentals vs K8s/Terraform? LeetCode enough for coding? Love vs Kerrisk? |
| 7 | r/sre | Google SRE interview next week | [link](https://reddit.com/r/sre/comments/1afnxlr/guys_i_have_sre_interview_at_google_next_week_any/) | Last-minute holistic prep. |

**Consensus from top comments (z5c3m7, wc4ryg, o6ozcj):**
- Study **process lifecycle, syscalls, signals, VM, filesystems** — explain *implications*, not necessarily memorize every kernel field.
- **Higher level = broader + faster**, not always deeper kernel trivia.
- **SE track:** practical scripting, complexity awareness, **not** graphs/DP; **SWE track:** full LeetCode bar.
- Books: **Kerrisk (LPI)** text intros, **Gregg Systems Performance** ch 1–9, **APUE**, optional **Linux From Scratch**.
- Recruiter prep for SE is “extremely light” — don’t rely on it alone.

---

### 1.4 NALSD / system design failures & prep

| Score | Subreddit | Title | URL | Key questions raised |
|------:|-----------|-------|-----|----------------------|
| 30 | r/devops | Failed to pass NALSD at Google | [link](https://reddit.com/r/devops/comments/c3lrks/failed_to_pass_nalsd_at_google_i_need_to_know/) | What did interviewer want? Workshop slides vs real interview gap. Napkin math / machine counts. |
| 37 | r/ExperiencedDevs | Help me understand NALSD example (SRE Workbook) | [link](https://reddit.com/r/ExperiencedDevs/comments/…) | Workbook chapter confusion; concrete vs abstract design. |

**Comment themes:** SRECon NALSD workshop slides help but **real interviews go deeper on calculations**; disengaged interviewer often means missing a critical requirement early; pair with a buddy for NALSD practice.

---

### 1.5 Googleyness / leadership / behavioral

| Score | Subreddit | Title | URL | Key questions raised |
|------:|-----------|-------|-----|----------------------|
| 8 | r/cscareerquestionsEU | How are Googleyness interviews assessed? | [link](https://reddit.com/r/cscareerquestionsEU/comments/u889b3/how_are_googleyness_interviews_assessed/) | Format? STAR required? |
| 220 | r/cscareerquestions | Am I only one who finds the Google interview process stupid? | [link](https://reddit.com/r/cscareerquestions/comments/…) | Googleyness + process frustration; culture fit skepticism. |
| 368 | r/ITCareerQuestions | Unsolicited perspective from a SRE interviewer | [link](https://reddit.com/r/ITCareerQuestions/comments/1346wln/unsolicited_perspective_from_a_sre_interviewer/) | What hiring teams look for; revenue vs cost center SRE; resume signals (not interview format but rubric). |
| 32 | r/ITCareerQuestions | SRE interviewer, Part 2 | [link](https://reddit.com/r/ITCareerQuestions/comments/138wumy/unsolicited_perspective_from_a_sre_interviewer/) | Career path from helpdesk; interview maturity signals. |
| 276 | r/ITCareerQuestions | Advice from FAANG SRE | [link](https://reddit.com/r/ITCareerQuestions/comments/niomfp/advice_from_a_different_perspective_working_at/) | Loop structure, compensation, LeetCode for senior hires, on-call reality. |

**G&L prep themes from 1kdf6fn comments:** conflict with manager, learned something new, be conversational; finish in ~25 min is fine.

---

### 1.6 SRE interview philosophy (informs behavioral MCQs)

| Score | Subreddit | Title | URL |
|------:|-----------|-------|-----|
| 368 | r/ITCareerQuestions | Unsolicited perspective from a SRE interviewer | [link](https://reddit.com/r/ITCareerQuestions/comments/1346wln/…) |
| 45 | r/sre | When do/would you walk away from an SRE interview? | [link](https://reddit.com/r/sre/comments/raabnp/…) |
| 9 | r/sre | Advice for SRE interview | [link](https://reddit.com/r/sre/comments/106aqls/…) |

---

## 2. Recurring Reddit questions → quiz answers

Grouped by frequency across threads and comments.

### Q1. “I'm interviewing for SRE **Manager** — is it more or less technical than IC?”

**Reddit signal:** da4h29 OP assumes manager = less coding; commenters split.

**Answer for quiz content:**
- Google **SRE Manager / SRE EM** loops include **technical** rounds; **your recruiter confirmed code review, not live coding** — the standard EM choice of “coding **or** code review” resolves to **code review** for you.
- Other rounds may still include **NALSD**, **troubleshooting**, **leadership fundamentals**, **Googleyness** — confirm with recruiter.
- Manager loops add **people management** scenarios (high/low performer, mentoring, conflict, reliability vs velocity at org level).

**Quiz action:** **`CR-REVIEW`** (P0), expand **A1** (+4 Q on “code review vs coding” loop structure), **C2** (+5 Q), **C5: SRE Manager scenarios** (+10 Q).

---

### Q2. “Recruiter prep says mutex/semaphore/filesystem — too easy. What's the real bar?”

**Reddit signal:** da4h29, o6ozcj, z5c3m7.

**Answer:**
- Phone screen topics (mutex, semaphores, FS) are **representative but not exhaustive**.
- **Your onsite code round:** **code review** on a snippet in Google Docs — find bugs, discuss complexity, suggest fixes; **not** writing a solution from scratch.
- Reddit’s “scripting/LeetCode” answers apply to **IC tracks only** — ignore for your prep.

**Quiz action:** **`CR-REVIEW`** (P0); **A1** process expectations; **`E2`** only if troubleshooting is in your loop.

---

### Q3. “What is the **Code Review** interview? What bugs do they hide?”

**Reddit signal:** Implicit in manager threads; explicit on Blind/IGotAnOffer/Exponent (200+ line Google Doc, interval logic, no IDE).

**Answer (public sources):**
- 45 min; review like a **senior TL**: correctness, edge cases, complexity, readability, error handling, concurrency, logging.
- Find bugs **and** propose fixes; trace logic manually; manual test cases when time runs out.
- Google eng-practices: design, functionality, complexity, tests, naming, comments, style, consistency.

**Quiz action:** New module **`CR-REVIEW`** — **25 MCQs** (todo.txt). See §4.

---

### Q4. “**Scripting** round — LeetCode or bash/python practical?”

**Reddit signal:** 1klu37j, o6ozcj — **IC track only**.

**Answer for your loop:** **Not applicable.** Recruiter confirmed **no coding round**. The Google Doc format Reddit mentions for scripting is the **same delivery mechanism** as code review (shared doc, no IDE) — but your task is **review existing code**, not implement new code.

**Quiz action:** **Skip `E1`.** Fold “read code for complexity/bugs” skills entirely into **`CR-REVIEW`**.

---

### Q5. “**Troubleshooting** — what format? Linux only?”

**Reddit signal:** 1klu37j, o6ozcj, wc4ryg (networking depth), HN/Google rubric echoes.

**Answer:**
- Hypothesis-driven: **mitigation first**, one change at a time, epistemic humility (“I don’t know, but I’d check…”).
- Layers: user impact → metrics → recent changes → **CPU/memory/disk/network** → app logs → dependencies.
- **D-state**, file descriptors, connection limits, I/O wait — not just `grep ERROR`.
- May be Linux scenario **or** distributed system symptom.

**Quiz action:** **`E2`** + expand **D1** scenario “what first?” (+5 troubleshooting scenarios).

---

### Q6. “**Linux internals** — kernel structs or user-space?”

**Reddit signal:** wc4ryg, z5c3m7, 1fkwupo.

**Answer:**
- Explain **behavior and implications** (fork/exec, signals, mmap, page cache, inodes, TCP states).
- Kernel struct memorization **rare**; **Simplification** round = teach concept clearly on whiteboard/doc.
- Networking troubleshooting can go **deep** even when kernel trivia does not.

**Quiz action:** New **`E3` Linux & OS fundamentals** (+18 Q) — conceptual MCQs, not `task_struct` field trivia.

---

### Q7. “**NALSD** — how much math? I failed; what did I miss?”

**Reddit signal:** c3lrks, o6ozcj, z5c3m7, ExperiencedDevs NALSD thread.

**Answer:**
- Back-of-envelope: QPS, storage/day, bandwidth, **machine counts**, latency budgets.
- Phases: possible → better → feasible → resilient (workbook ch 12).
- Failure mode: jumping to architecture without **requirements + numbers**; interviewer disengages when critical clarifier missed.

**Quiz action:** Already in **B5** — add **`reddit-nalsd`** tag + **8 Q** from failure patterns (missing capacity, ignoring transfer time, no failure section).

---

### Q8. “**Googleyness** — STAR? What gets scored?”

**Reddit signal:** u889b3, 1kdf6fn comments, cscareerquestions skepticism thread.

**Answer:**
- **Experience questions** → STAR/STAR-L with **your** actions and learnings.
- **Process/judgment questions** → framework answer, not forced story.
- Signals: ambiguity comfort, humility, ownership, emergent leadership, collaboration; **avoid** heroics-only incident stories.

**Quiz action:** **C1–C3** already cover; add **6 Q** on experience vs process question type detection.

---

### Q9. “**SRE-SWE vs SRE-SE** — which am I in?”

**Reddit signal:** 1fm8wmh, 1fkwupo, QUIZ-PLAN email track.

**Answer for your loop:**
- Email track: **SRE-SWE** with **Systems Architecture** + **G&L** (see `QUIZ-PLAN.md`).
- **Code round:** **code review only** — not the SWE LeetCode loop Reddit describes for SRE-SWE ICs.
- Manager/SRE EM candidates at Google typically **choose code review over live coding**; your recruiter has already made that choice for you.

**Quiz action:** Tag bank with `loop: "sre-swe-manager-code-review"`; default exam preset excludes all live-coding modules.

---

### Q10. “How do I prep in **3 days** / limited time?”

**Reddit signal:** da4h29, 1afnxlr.

**Prioritized plan (for quiz “crash path” preset — your loop):**
1. **`CR-REVIEW`** — primary code-round prep (bug patterns, complexity, eng-practices checklist)
2. **`SA-VIDEO`** + **B5** — Systems Architecture / NALSD (60 min round per email)
3. **C1–C4** + **C3** STAR stories (2 conflict, 1 failure, 1 incident, 1 influence)
4. **`E2` / `E3`** — only if recruiter confirms troubleshooting or Linux rounds
5. **Do not** grind LeetCode or **`E1`** scripting for this interview

---

## 3. New & expanded quiz modules

### 3.1 Module map (additions to `sections.json`)

| Module ID | Title | Questions | Priority | Your loop? |
|-----------|-------|-----------|----------|------------|
| **CR-REVIEW** | Code review interview | **25** (+10 stretch) | **P0** | **Yes — only code round** |
| ~~**E1**~~ | ~~Scripting & practical coding~~ | ~~12~~ | **Skip** | **No — recruiter confirmed** |
| **E2** | Troubleshooting methodology | 15 | P2 | Only if round scheduled |
| **E3** | Linux & OS fundamentals (SE) | 18 | P2 | Only if round scheduled |
| **C5** | SRE Manager leadership | 10 | P1 | Yes (if manager track) |
| A1 (expand) | Hiring process | +4 → 16 | P1 | Include “code review vs coding” |
| B5 (expand) | NALSD failures | +8 → 26 | P0 | Yes (Systems Arch) |
| C3 (expand) | Question-type detection | +6 → 21 | P1 | Yes (G&L) |
| D1 (expand) | Troubleshooting “what first?” | +5 → 20 | P2 | Only if E2 in loop |

**New question total for your path:** ~35–45 net new (CR-REVIEW + A1/C/B5 expansions). E1/E2/E3 omitted unless recruiter adds rounds.

### 3.2 Exam presets (add)

```json
{
  "id": "your-loop-full",
  "label": "Your loop (code review + Systems Arch + G&L)",
  "modules": ["CR-REVIEW", "SA-VIDEO", "B1", "B2", "B5", "B6", "B7", "C1", "C2", "C3", "C4", "C5"],
  "questionCount": 60,
  "minutes": 0,
  "note": "No E1/coding modules"
},
{
  "id": "code-review-45",
  "label": "Code review deep drill (45 min mock)",
  "modules": ["CR-REVIEW"],
  "questionCount": 25,
  "minutes": 45
},
{
  "id": "reddit-crash-3d",
  "label": "3-day crash path (your loop)",
  "modules": ["CR-REVIEW", "SA-VIDEO", "B5", "C1", "C2", "C3"],
  "questionCount": 30,
  "minutes": 0,
  "note": "CR-REVIEW first; no LeetCode"
}
```

---

## 4. CR-REVIEW module spec (25 questions — your only code round)

**This replaces live coding prep entirely for your interview.**

**Sources:** [Google eng-practices looking-for](https://github.com/google/eng-practices/blob/master/review/reviewer/looking-for.md), IGotAnOffer code review guide, Exponent L6 EM experience (200+ line Google Doc, interval logic, manual trace), Jointaro SRE Manager reports.

**Interview mechanics (from public EM/SRE EM reports):**
- ~45 minutes; code provided in **Google Doc** — no IDE, no run button
- Read like a **real CL review**: correctness first, then complexity, design, edge cases, naming, error handling
- Propose **concrete fixes**; walk through **manual test cases** when time is tight
- Large snippets (100–200+ lines) possible — prioritize **triage**: critical bugs before style nits

**Question categories:**

| Cat | Count | Example stem |
|-----|-------|----------------|
| CR-1 Bug finding | 8 | “This loop uses `<= size` — what fails?” / off-by-one / null deref |
| CR-2 Complexity & design | 5 | “Which refactor best reduces O(n²) nested scan?” |
| CR-3 Error handling & edge cases | 4 | “Empty input, negative index, concurrent map write” |
| CR-4 Readability & maintainability | 4 | “Which review comment follows Google style guidance?” |
| CR-5 Process & prioritization | 4 | “What do you comment on first in a 200-line CL?” / scope of review |

**Format:** Short code snippet in question text (4–15 lines); 4 options; `source` field cites eng-practices section.

**Not in scope:** Live coding, LeetCode-style “implement from scratch,” **`E1` scripting module**.

**Stretch (+10 Q, optional):** “What fix would you suggest?” MCQs mirroring Exponent’s interval-logic failure patterns.

---

## 5. E2 Troubleshooting — Reddit-derived scenario bank

Scenarios distilled from threads + SRE book ch:

1. **“System is slow”** (r/sre canonical) — CPU vs I/O wait vs lock contention
2. **API latency spike** after deploy — rollback vs feature flag vs cache cold
3. **Memory leak** — growth pattern, heap vs off-heap, restart mitigation
4. **Intermittent 502s** — LB health checks, backend pool, keepalive
5. **Disk full** — logs, temp files, inode exhaustion vs byte exhaustion
6. **DNS/intermittent connectivity** — TCP states, MTU, firewall change
7. **“Clean logs” but users impacted** — probe synthetic vs real traffic, D-state
8. **Cascading failure** — retry storm, circuit breaker, load shed

Each → 1–2 MCQs: “best **next** step” and “what **not** to do” (one-change rule).

---

## 6. C5 SRE Manager — question stems from Reddit + reports

1. High performer vs low performer — coaching vs PIP timing  
2. Error budget exhausted — negotiate with PM for feature freeze  
3. Team on-call burnout — rotation, alert hygiene, toil reduction  
4. Senior IC refuses SLO adoption — influence without authority  
5. Code review culture on team — quality bar without bottlenecking  
6. Hiring: what you look for in SRE IC vs traditional ops  
7. Incident during exec demo — communication priority  
8. Build vs buy for observability on budget  
9. Remote/distributed team — async communication norms  
10. Why SRE manager at Google vs staying IC Staff  

---

## 7. Implementation phases

### Phase 1 — P0 (your loop: code review + existing SA/G&L bank)
- [ ] Create `quiz/data/questions/cr-review.json` (25 Q) — **only code-round module**
- [ ] Update `sections.json` with `CR-REVIEW` + **`your-loop-full`** exam preset (no E1)
- [ ] Expand `a1-hiring.json` (+4 Q: code review vs coding loop structure)
- [ ] Validate with `scripts/validate_quiz.py`
- [ ] ~~`e1-scripting.json`~~ — **do not build** (not in your loop)

### Phase 2 — P1 (manager behavioral + NALSD depth)
- [ ] `c5-sre-manager.json` (10 Q)
- [ ] Expand `b5-nalsd.json` (+8 Q)
- [ ] Expand `c3-star.json` (+6 Q Googleyness question-type detection)

### Phase 3 — P2 (only if recruiter adds rounds)
- [ ] `e2-troubleshooting.json`, `e3-linux-os.json` — **conditional**
- [ ] Tag questions `loop: ["code-review-only", "ic-coding"]` for UI filtering
- [ ] `prep-materials/links/reddit-thread-index.md` — permalink archive

---

## 8. Source material beyond Reddit (for CR-REVIEW)

| Source | URL | Use |
|--------|-----|-----|
| Google eng-practices | https://github.com/google/eng-practices | Reviewer checklist → CR-4, CR-5 |
| IGotAnOffer code review | https://igotanoffer.com/en/advice/google-code-review-interview | Process + expectations |
| Exponent L6 EM experience | https://www.tryexponent.com/experiences/google-staff-engineering-manager-interview-fd33b1 | 200-line doc pattern |
| mxssl SRE prep guide | https://github.com/mxssl/sre-interview-prep-guide | Cited in 1klu37j comments |
| SRE book ch 12 / workbook NALSD | already on disk | B5, E2 |
| Effective Troubleshooting | already on disk | E2 |
| Brendan Gregg checklists | systems performance | E2, E3 |

---

## 9. Reddit threads — raw permalink index

```
# Manager / leadership
https://reddit.com/r/devops/comments/da4h29/google_sre_manager_interview_coming_any_advice/
https://reddit.com/r/sre/comments/140ma5t/skills_needed_for_sre_manager/

# Code / scripting / loop structure
https://reddit.com/r/leetcode/comments/1klu37j/google_systems_engineer_sre_interview/
https://reddit.com/r/leetcode/comments/1kdf6fn/google_sre_only_3_onsite_interviews_after_phone/
https://reddit.com/r/leetcode/comments/1fm8wmh/surprised_by_google_interview/

# Linux / SE track
https://reddit.com/r/sre/comments/z5c3m7/advice_for_google_srese_interviews_linux_internals/
https://reddit.com/r/sre/comments/wc4ryg/google_sre_linux_internals_interview/
https://reddit.com/r/sre/comments/o6ozcj/google_sre_systems_interview_prep/
https://reddit.com/r/sre/comments/1fkwupo/linux_for_google_sre/

# NALSD
https://reddit.com/r/devops/comments/c3lrks/failed_to_pass_nalsd_at_google_i_need_to_know/

# Googleyness / behavioral / hiring culture
https://reddit.com/r/cscareerquestionsEU/comments/u889b3/how_are_googleyness_interviews_assessed/
https://reddit.com/r/ITCareerQuestions/comments/1346wln/unsolicited_perspective_from_a_sre_interviewer/
https://reddit.com/r/ITCareerQuestions/comments/138wumy/unsolicited_perspective_from_a_sre_interviewer/
https://reddit.com/r/ITCareerQuestions/comments/niomfp/advice_from_a_different_perspective_working_at/

# General SRE interview philosophy
https://reddit.com/r/sre/comments/raabnp/when_dowould_you_walk_away_from_an_sre_interview/
https://reddit.com/r/ExperiencedDevs/comments/lm6w8t/my_interview_experience_as_an_experienced_dev/
```

---

## 10. Limitations

- Reddit search API (PullPush) is rate-limited; some threads are `[deleted]` (c3lrks body).
- **Code review** has richer coverage on Blind/Exponent than Reddit — plan uses both.
- Interviewer variance is real (1fm8wmh); quiz teaches **rubric-aligned** answers, not guaranteed question lists.
- User's confirmed loop: **SRE-SWE** Systems Architecture + G&L + **code review (no live coding)**. LeetCode/scripting Reddit threads are **not** prep targets.
- If recruiter adds troubleshooting/Linux rounds later, enable Phase 3 modules only then.

---

*Next step:* Implement Phase 1 — **`CR-REVIEW` only** for the code round, plus A1 loop-structure questions. No `E1`.
