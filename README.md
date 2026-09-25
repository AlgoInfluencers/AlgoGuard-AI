<div align="center">
  <img src="https://raw.githubusercontent.com/AlgoInfluencers/GDG-Solution-Challenge/main/frontend/public/logo.png" width="120" alt="AlgoGuard AI Logo">
  
  # 🛡️ AlgoGuard AI
  **Democratizing AI Equity for the Global South** <br>
  *Built for the Google Developer Groups (GDG) Solution Challenge 2026*
  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://gdg-solution-challenge-arghyadevs.vercel.app/)
  [![Backend](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://gdg-solution-challenge-rybg.onrender.com/docs)
  
  <br>
  
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/C%2B%2B-00599C?style=flat-square&logo=c%2B%2B&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat-square&logo=google&logoColor=white" />

  ---
</div>

## 🌟 Overview
Machine learning models often inherit historical biases based on attributes like Gender, Age, or Race. **AlgoGuard AI** tackles this problem by identifying instances of bias, measuring it mathematically, actively mitigating it using algorithmic strategies, and mapping out the structural isolation of demographic groups using graph theory.

To bridge the gap between engineering and compliance, we use **Google Gemini 3.8 Flash** to translate complex statistical mathematics into plain-English (and multilingual) AI Ethics Reports.

---

## 🚀 Live Demonstration
The platform is fully functional and live on the internet!
- **Frontend Dashboard:** [AlgoGuard AI on Vercel](https://gdg-solution-challenge-arghyadevs.vercel.app/)
- **Backend API Docs:** [FastAPI Swagger UI](https://gdg-solution-challenge-rybg.onrender.com/docs)

---

## 💡 Opportunities & Unique Selling Proposition (USP)

### How different is it from existing ideas?
Enterprise bias mitigation tools (like IBM's AI Fairness 360) are highly complex, command-line Python libraries designed strictly for PhD-level data scientists. **AlgoGuard AI disrupts this** by providing a "No-Code", Google Material Design web dashboard. Non-technical stakeholders (auditors, product managers) can simply upload a CSV and instantly visualize AI bias.

### How does it solve the problem?
AlgoGuard AI goes beyond merely *detecting* bias; it actively *solves* it:
1. **Mathematical Mitigation:** Uses a custom C++ Structural Engine and Resampling techniques to mathematically rebalance biased datasets *before* they are deployed.
2. **AI Translation:** Utilizes Google Gemini 3.8 Flash as an "AI Ethics Officer" to translate statistical mathematics into readable compliance reports.

### The USP
> **"Hyper-Accessible, Multilingual Algorithmic Equity."** 

Unlike Western-centric tools, AlgoGuard AI natively generates technical AI Ethics Reports in regional languages (**Hindi, Bengali, Tamil, Telugu**). By leveraging Gemini's multilingual capabilities, we democratize AI safety for massive, diverse populations across India.

---

## 🏗️ System Architecture

```mermaid
graph TD
    %% Styling
    classDef frontend fill:#4285f4,stroke:#fff,stroke-width:2px,color:#fff;
    classDef backend fill:#ea4335,stroke:#fff,stroke-width:2px,color:#fff;
    classDef ml fill:#fbbc04,stroke:#fff,stroke-width:2px,color:#000;
    classDef cpp fill:#34a853,stroke:#fff,stroke-width:2px,color:#fff;
    classDef google fill:#a142f4,stroke:#fff,stroke-width:2px,color:#fff;

    %% Nodes
    subgraph "Client Layer"
        UI["Next.js Frontend (React) <br/> Material Design UI"]:::frontend
        CSV["PapaParse <br/> Client-Side Preview"]:::frontend
    end

    subgraph "Orchestration Layer"
        API["FastAPI Server <br/> (Python / Uvicorn)"]:::backend
    end

    subgraph "Machine Learning Engine"
        PreProc["Data Preprocessing <br/> (Pandas / Scikit)"]:::ml
        BiasDet["Bias Detection <br/> (SPD, EOD Metrics)"]:::ml
        Mitig["Bias Mitigation <br/> (Reweighting, Resampling)"]:::ml
    end

    subgraph "Core Engines"
        CPP["C++ Graph Engine <br/> (Structural Similarity)"]:::cpp
    end

    subgraph "Google Cloud Services"
        Gemini["Google Gemini 3.8 Flash <br/> (Multilingual Ethics Report)"]:::google
    end

    %% Connections
    UI -- "Uploads CSV" --> API
    UI -. "Reads top 5 rows" .-> CSV
    API -- "Triggers Pipeline" --> PreProc
    PreProc -- "Extracts Features" --> BiasDet
    BiasDet -- "Flags Bias" --> Mitig
    Mitig -- "Computes Relationships" --> CPP
    CPP -- "Returns Graph Image" --> API
    Mitig -- "Exports Metrics" --> API
    API -- "Sends JSON + Prompt" --> Gemini
    Gemini -- "Returns Translated Report" --> API
    API -- "Returns Analysis Payload" --> UI
```

---

## 🛠️ Technologies Used

### 💻 Frontend
*   **Next.js 16 (React):** High-performance framework for building the reactive dashboard.
*   **Tailwind CSS v4:** Used for rapid, responsive UI styling and layout constraints.
*   **Google Material Design 3:** Strict adherence to official Google design tokens.

### ⚙️ Backend & Orchestration
*   **FastAPI:** Lightning-fast Python web framework exposing the `/api/analyze` endpoint.
*   **Uvicorn:** High-performance ASGI server handling concurrent API requests.

### 🧠 Machine Learning Engine
*   **Scikit-Learn & Pandas:** Core framework for Baseline Model training and Data Preprocessing.
*   **Imbalanced-Learn:** Utilized for `RandomUnderSampler` to execute Bias Mitigation.
*   **NetworkX & Matplotlib:** Used to visually plot complex bias relationship clusters.

### ⚡ Core Computing Engine
*   **C++:** High-speed, low-level execution engine (`graph.cpp`) to rapidly calculate structural similarity graphs.

### ☁️ Google Cloud Services
*   **Google Gemini 3.8 Flash API:** Integrated via the `google-genai` SDK to dynamically translate and generate multilingual ethics reports.

---

## 🏃‍♂️ Running Locally

1. **Backend:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
g++ -O3 graph.cpp -o g.exe
uvicorn api_server:app --port 8000 --reload
```

2. **Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to view the dashboard!
