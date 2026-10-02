# DecisionOps Frontend

DecisionOps is a sophisticated industrial intelligence platform designed to bridge the gap between complex engineering data and actionable insights. This frontend application provides a powerful, interactive interface for managing P&IDs, document reviews, knowledge graphs, and AI-driven data analysis.


---

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [JavaScript]
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Visualization**: D3.js, Recharts, Plotly.js, Cytoscape.js, Highcharts
- **State Management**: React Hooks & Context API
- **Auth**: Azure MSAL Browser/React

---

## 📋 Detailed Prerequisites

Before you begin, ensure your development environment meets these requirements:

### 1. Node.js & NPM
- **Node.js**: Version **18.x or 20.x** (LTS recommended).
- **NPM**: Version **9.x or higher**.
- Check version: `node -v` and `npm -v`

### 2. Python (Optional - for data processing)
- **Python**: **3.8 or higher**.
- Required for running conversion scripts in the root directory.

---

## ⚙️ In-Depth Installation Guide

Follow these steps precisely to set up the project locally:

### 1. Clone the repository
```bash
git clone <repository-url>   
cd decision_ops_frontend
```

### 2. Clean Installation
If you are setting this up for the first time or encountering issues:
```bash
# Remove existing modules (if any)
rm -rf node_modules .next

# Install dependencies
npm install
```

### 3. Environment Configuration
The application requires several environment variables to function correctly.
1. Copy the example file: `cp .env.example .env.local`
2. Open `.env.local` and fill in the values:

```env
# AI & External APIs
GEMINI_API_KEY=your_gemini_api_key

# Backend URLs (Public endpoints)
NEXT_PUBLIC_INDUSTRIAL_BACKEND_URL=http://13.126.45.161:8000
NEXT_PUBLIC_MODEL_FACTORY_BACKEND_URL=http://13.201.105.53:8181
NEXT_PUBLIC_AI_BACKEND_URL=http://127.0.0.1:8000

# CDM API (Crucial for API rewrites and data fetching)
# This URL is used by next.config.ts to proxy requests for logs and pipeline jobs
CDM_API_URL=http://localhost:4400
```

---

## 🚀 Running the Application

### Development Mode
Start the development server with hot-reloading:
```bash
npm run dev
```
- Local URL: [http://localhost:3000](http://localhost:3000)
- The app will automatically reload when you change files in `app/`, `components/`, etc.

### Production Build
To test the production version of the app:
```bash
# Build the application
npm run build

# Start the production server
npm run start
```

## 📊 Data Processing Scripts

If you need to update the Knowledge Graph data:

1. **Prepare your source file** (CSV or Excel).
2. **Run the converter**:
   ```bash
   # For CSV files
   python convert_csv_to_kg.py
   
   # For Excel files
   python convert_excel_to_kg.py
   ```
3. The output will be saved to `app/Dashboard_User/Knowledge_Graph/testGraphData.json`, which the frontend consumes.

---

## 📁 Key Project Structure

| Directory | Description |
| :--- | :--- |
| `app/` | Core routing and page components (Next.js App Router). |
| `components/` | UI components. `AdminPanel.tsx` is the primary orchestrator for the admin interface. |
| `hooks/` | Custom hooks for state management and API data fetching. |
| `config/` | Application settings, constants, and API endpoints. |
| `public/` | Static assets like logos, images, and fonts. |
| `utils/` | Shared helper functions, Auth config, and UI utilities. |

---

## ❓ Troubleshooting

- **Module Not Found**: Ensure you ran `npm install`. If issues persist, try `npm ci`.
- **API Proxy Errors**: Ensure `CDM_API_URL` is set in `.env.local`. Check `next.config.ts` to see which `/api/*` paths are being rewritten.
- **Hydration Errors**: This can happen with heavy visualization libraries. Ensure you are using `'use client'` where necessary.
- **Node Version Mismatch**: If you see errors related to `async/await` or `top-level await`, ensure you are on Node.js 18+ 
---
