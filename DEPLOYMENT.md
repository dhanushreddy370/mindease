DEPLOYMENT GUIDE FOR MINDEASE
===========================

You can deploy MindEase used two strategies:
1. **Unified Deployment (Render)**: Easiest. Backend serves Frontend.
2. **Split Deployment (Vercel + Render)**: Best Performance. Vercel hosts frontend, Render hosts Backend.

OPTION 1: UNIFIED DEPLOYMENT (Recommended for Simplicity)
---------------------------------------------------------
**Platform:** Render (Web Service)

1. **Push** your code to GitHub.
2. **Create New Web Service** on Render.
3. **Connect** your GitHub repo.
4. **Settings:**
   - **Root Directory:** `mindease` (or leave empty if it's the repo root)
   - **Build Command:** `npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend`
     *(This installs everything and builds the React app into `frontend/dist`)*
   - **Start Command:** `npm start --prefix backend`
     *(This starts the Node server which serves the `dist` folder)*
5. **Environment Variables:**
   - `MONGODB_URI`: Your MongoDB Connection String.
   - `UPSTASH_REDIS_REST_URL`: Your Redis URL.
   - `UPSTASH_REDIS_REST_TOKEN`: Your Redis Token.
   - `NODE_ENV`: `production`

OPTION 2: SPLIT DEPLOYMENT (Recommended for Speed)
--------------------------------------------------
**Frontend -> Vercel | Backend -> Render**

### Part A: Backend (Render)
1. Follow "Option 1" steps, BUT:
   - **Build Command:** `npm install --prefix backend`
   - **Start Command:** `npm start --prefix backend`
   - You don't need to build the frontend here.
2. **Copy the URL** of your deployed backend (e.g., `https://mindease-api.onrender.com`).

### Part B: Frontend (Vercel)
1. **Import Project** in Vercel.
2. **Root Directory:** Select `mindease/frontend`.
3. **Build Command:** `vite build` (Default).
4. **Environment Variables:**
   - `VITE_API_URL`: Paste your Render Backend URL + `/api` (e.g., `https://mindease-api.onrender.com/api`).
     *(This is crucial so the frontend knows where to fetch data).*

LOCAL DEVELOPMENT
-----------------
1. **Backend:**
   `cd backend && npm run dev` (Runs on port 3000)
2. **Frontend:**
   `cd frontend && npm run dev` (Runs on port 8080)
