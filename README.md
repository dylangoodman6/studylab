# StudyLab

StudyLab is an English-first, bilingual (English/Arabic) circuit-study web app. Questions and written practice remain in English in both interface languages. The interface switches between left-to-right English and right-to-left Arabic. Prepared by Mohammed Al-Quraini, Electrical Engineering student.

## Run locally

Requires Node.js 24+ and Python 3.11+. From this project directory:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r server/requirements.txt
npm install
./scripts/start.sh
```

Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/). Vite uses port 5173 and the SymPy API uses port 8765. On a computer without `npm`, `corepack pnpm install` also works. The problem bank and authored hints work without an AI key.

## Use the app

1. Complete the six short-answer diagnostic tasks. They cover nodes, reference directions, KCL, KVL, supernodes, and supermeshes.
2. Use the Chapter 3 solve table. Count nodes/meshes, select a method and write a reason, enter the KCL/KVL system, then enter the signed result and unit. Learn mode offers three hints. Test mode reveals hints and solutions only after submission.
3. Open **Quiz 2** for four original Chapter 3 written-response problems and five adapted from Nilsson/Riedel Problems 4.6, 4.13, 4.22, 4.32(a), and 4.49 (book printed pp. 130–135). All remain within lecture PDF pages 1–21. Each textbook exercise shows a redrawn SVG circuit with the same topology, values, polarities, and current arrows; the cited original book page can also be opened locally. **Chapter practice** separately contains 17 examples for Chapters 4, 6, 7, and 8. Show your derivation and enter the numerical result with the displayed unit. Numerical answers are checked; compare written reasoning with the worked solution. The questions are not multiple choice.
4. In EE247, start with Experiment 4 or choose Experiments 1–5. Enter any positive resistance with an SI unit (such as Ω, kΩ, or MΩ), or a nonzero voltage/current source with an SI unit (V, mV, kV, A, mA, or µA). Drag the element onto the board, or click it to create a preview that you can move. Click two socket groups to connect its terminals. For a cable, choose **Cable** and click its first and second groups. Components, leads, and cables remain visible; dragging a placed component moves its drawing without changing its electrical connection. Click a socket to light all nine sockets of its group. The reference topology checks connections and polarity rather than requiring the example's 220/330 Ω values. Check power ratings, then place probes and record Multisim and physical readings manually.
5. Use the top-bar controls to export or import local progress, including Quiz 2 attempts. The language button remembers your choice in this browser.

### Estimated study time

| Section | Time |
|---|---:|
| Chapter 3 · Methods of Analysis | 2 h |
| Chapter 4 · Circuit Theorems | 3 h |
| Chapter 6 · Capacitors and Inductors | 2 h |
| Chapter 7 · First-Order RC and RL | 3 h |
| Chapter 8 · Second-Order RLC | 4 h |
| **Quiz 2: Chapter 3 only** | **2 h** |
| **Later chapter practice** | **12 h** |

These are planning estimates, not measured completion times.

## Scope and sources

- Quiz 2 contains **only Chapter 3** and stops at the second slide on PDF page 21 of `EE241_Lect9-11_Ch3-Methods of Analysis.pdf` (slides 1–42, ending at the “Methods of Analysis-3” divider). Later by-inspection and method-comparison slides are excluded from Quiz 2. The existing full Chapter 3 solve-table bank remains available separately.
- Chapter 4 uses the circuit-theorems lecture; Chapter 7 uses the first-order lecture; Chapter 8 uses both source-free and step-response lectures.
- The newly supplied `EE241-Lecture17-18- Ch6- Capacitors and Inductors-2.pdf` covers capacitor and inductor laws, energy, DC steady state, and series/parallel equivalents. Chapter 6 practice cites its pages. Mutual inductance is outside the supplied slides and excluded.
- The provided book is **James W. Nilsson and Susan Riedel, Electric Circuits (10th ed., 2014)**. Only matching printed sections in Chapters 4, 6, 7, and 8 were reviewed; the book's Chapter 4 aligns with lecture Chapters 3 and 4. Problems are new StudyLab exercises and do not reproduce book examples or claim to be official KFUPM exam questions. Each question cites a lecture PDF page and a printed book page.
- The Chapter 3 circuit bank contains 12 original circuits. Quiz 2 additionally includes five concise adaptations of specified textbook exercises, each with the book problem number and page. The app does not include scans of the textbook and serves the user's own PDF only when running locally. SymPy independently solves circuits and crosschecks Quiz 2 numerical answers; the solve table also checks visual/polarity consistency and power balance. Written derivations are for comparison with worked solutions and are not automatically graded.
- Laboratory representation uses 35 groups of nine sockets. Experiment 4 at 10 V gives 45.45 mA and 30.30 mA in parallel (75.76 mA total), or 18.18 mA in series with 4 V and 6 V drops. Experiment 2 flags 4 W across a 100 Ω / 2 W resistor at 20 V. Connect the supply last, disconnect it first, and energize only with a supervisor present.

The PDF page links in the local app read files from `~/Downloads`. They are disabled when the production flag is set, so a future public deployment does not redistribute the supplied lecture slides or textbook. The app itself remains usable without those PDFs once its data has been generated.

## Course packs and optional AI

The [built-in course pack](public/course-packs/ee241-ee247.json) contains Chapter 3 verified circuit problems, lab data, learning objectives, prerequisites, and source-page references. The [general template](public/course-packs/template-general.json) starts a new course. Imported circuit problems are rejected unless their drawing, branches, polarities, equations, solution, and power balance pass server verification.

For optional AI explanations, copy `server/.env.example` to `server/.env` and set `OPENAI_API_KEY`. The key stays on the Python server. Hints and numeric grading do not depend on it.

## Publish on Render

The [public GitHub repository](https://github.com/dylangoodman6/studylab) contains the root [Dockerfile](Dockerfile) and [render.yaml](render.yaml). The Dockerfile builds React and runs the Python/SymPy API in one web service. It reads Render's `PORT`, listens on `0.0.0.0`, and sets `STUDYLAB_PUBLIC=1`. In public mode, every `/source/...` PDF request returns 404. Supplied PDFs, local dependencies, browser progress, and API keys are excluded from Git and the Docker image. GitHub Pages alone does not run the Python API, so deploy the complete app as a web service.

1. In Render, choose **New → Blueprint**, connect `dylangoodman6/studylab`, and select the root `render.yaml`. It defines one public Docker web service on the Free plan with `/api/health` as the health check and automatic redeployment on commits. Render gives the service a public `https://…onrender.com` address after a successful deploy. You can change the plan later in Render.
2. Open that address and verify Quiz 2, Chapter practice, and EE247. `/api/health` should return JSON with `"ok": true`; `/source/ch3` should return 404. If you later add a custom domain, set it in the Render service settings.

The verified banks and local hints work without an AI key. If you want optional AI explanations, set `OPENAI_API_KEY` in Render's service environment; never put the key in GitHub or the Dockerfile. Browser progress is saved on each visitor's device, and export/import JSON moves it between devices. Render's Free web services spin down after 15 minutes of no inbound traffic and take time to wake; choose a paid instance if uninterrupted availability matters.

For a local production preview without Docker, `STUDYLAB_PYTHON=.venv/bin/python ./scripts/serve-public.sh` builds the app and serves it on port 8765. Do not expose that local process directly to the Internet.

## Checks

```bash
.venv/bin/python -m unittest discover -s tests -p 'test_*.py'
npm test
npm run build
```

تم إعداد الموقع من الطالب محمد القريني، طالب الهندسة الكهربائية.
