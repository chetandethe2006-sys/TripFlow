# TripFlow — Autonomous Precision for Next-Gen Logistics

TripFlow is a full-stack logistics and fleet management platform providing real-time tracking, trip dispatching, driver and vehicle management, customer accounts, and automated notifications.

---

## 1. Project Architecture

* **Frontend:** Vanilla Modern JavaScript (ES6+), HTML5, and Tailwind CSS (CDN-based). Deployed to Render as a high-performance **Static Site** on Render's global CDN.
* **Backend:** Java 21, Spring Boot 4.1.1 (Spring MVC REST API, Spring Data JPA, Spring Security with stateless JWT, Spring Mail). Containerized via a multi-stage **Docker** build (`eclipse-temurin:21`) and deployed to Render as a **Web Service** (`runtime: docker`).
* **Database Layer:**
  * **Default / Testing:** Embedded persistent H2 file database (`./data/tripflow;AUTO_SERVER=TRUE;DB_CLOSE_DELAY=-1`).
  * **Production:** Fully compatible with cloud PostgreSQL (Render Managed PostgreSQL, Supabase, Neon, AWS RDS).
  * **Migrations & Seeding:** Hibernate auto-migration (`spring.jpa.hibernate.ddl-auto=update`) and automatic initial seeding (`DataSeeder.java`).

---

## 2. Local Development

### Prerequisites
* JDK 21+
* Internet access for initial Maven dependency resolution and Tailwind CDN

### Running Locally
1. **Start Backend:**
   ```bash
   cd backend
   ./mvnw clean spring-boot:run
   ```
   *(On Windows: `.\mvnw.cmd clean spring-boot:run`)*
   The backend starts on `http://localhost:8080`.

2. **Run Frontend:**
   * Open `frontend/index.html` with VS Code Live Server (`http://localhost:5500`) or any static web server.
   * `frontend/js/api.js` automatically detects `localhost` and routes API calls to `http://localhost:8080/api`.

3. **Default Seed Credentials:**
   * **Owner/Admin:** Username: `owner` (or `admin`, `owner@tripflow.com`) | Password: `owner123`
   * **Driver:** ID: `DRV-01` | Password: `driver123`

---

## 3. Render Deployment Architecture

TripFlow uses Render's decoupled architecture:
1. **`tripflow-backend` (Web Service, `runtime: docker`):**
   * Multi-stage Docker image built from `backend/Dockerfile`.
   * Builder stage: `eclipse-temurin:21-jdk-jammy` packages the Spring Boot JAR with layer caching.
   * Runner stage: `eclipse-temurin:21-jre-jammy` runs as an unprivileged `spring` user.
   * Binds to Render's dynamic `PORT` and `0.0.0.0`.
   * Health Check: Verified via `GET /api/test` (returns HTTP 200).
2. **`tripflow-frontend` (Static Site):**
   * Serves static HTML/JS/CSS from `frontend/` across Render's global CDN.
   * SPA rewrite rule routes `/*` to `/index.html`.
   * Automatically targets `https://tripflow-backend.onrender.com/api` (configurable via `frontend/config.js` or `?api=` query parameter).

---

## 4. Deploying via Render Blueprints (1-Click Deployment)

The repository root includes a validated Render Blueprint (`render.yaml`).

### Step-by-Step Instructions:
1. Push your repository changes to GitHub (once approved).
2. Open the [Render Dashboard](https://dashboard.render.com/).
3. Click **Blueprints** in the top navigation -> click **New Blueprint Instance**.
4. Select your **TripFlow** repository.
5. Render reads `render.yaml` and will display the plan:
   * **`tripflow-backend`** (Web Service, Docker runtime, free tier, health check `/api/test`)
   * **`tripflow-frontend`** (Static Site, free tier, SPA rewrite rules)
6. Click **Apply**.
7. Render will build the Docker container for the backend, deploy the frontend static site, and provide live URLs:
   * Frontend: `https://tripflow-frontend.onrender.com`
   * Backend: `https://tripflow-backend.onrender.com`

---

## 5. Manual Render Deployment (Alternative)

If you prefer provisioning services manually instead of using Blueprints:

### Step 1: Deploy Backend Web Service
* Click **New +** -> **Web Service**.
* Connect your GitHub repository.
* Configure:
  * **Name:** `tripflow-backend`
  * **Root Directory:** `backend`
  * **Runtime:** `Docker`
  * **Dockerfile Path:** `./Dockerfile`
  * **Docker Context:** `.`
  * **Plan:** `Free`
  * **Health Check Path:** `/api/test`
* Environment Variables:
  * `SERVER_ADDRESS`: `0.0.0.0`
  * `JWT_SECRET`: *(Click "Generate")*
  * `OWNER_EMAIL`: `owner@tripflow.com`
  * `CORS_ALLOWED_ORIGINS`: `https://tripflow-frontend.onrender.com,http://localhost:5500,https://*.onrender.com`
  * `DB_URL`: `jdbc:h2:file:./data/tripflow;AUTO_SERVER=TRUE;DB_CLOSE_DELAY=-1`

### Step 2: Deploy Frontend Static Site
* Click **New +** -> **Static Site**.
* Connect your GitHub repository.
* Configure:
  * **Name:** `tripflow-frontend`
  * **Root Directory:** `frontend`
  * **Build Command:** *(Leave blank)*
  * **Publish Directory:** `.`
* Add a Rewrite Rule under **Redirects/Rewrites**:
  * Type: `Rewrite` | Source: `/*` | Destination: `/index.html`

---

## 6. Database Configuration & Persistence Notice

### Ephemeral Storage on Render Free Tier (H2 Notice)
On Render's Free tier, container filesystems are ephemeral. Any changes written to the local file database (`./data/tripflow.mv.db`) will be reset when the free container spins down due to inactivity or restarts.

### Connecting Render Managed PostgreSQL (Production Persistence)
For persistent data storage across restarts and deployments:
1. In the Render Dashboard, click **New +** -> **PostgreSQL**.
2. Name: `tripflow-postgres`, Database: `tripflow`, User: `tripflow`.
3. Copy the **Internal Database URL** (e.g. `postgresql://tripflow:password@dpg-xxxx-a:5432/tripflow`).
4. In `tripflow-backend` Environment Variables, configure:
   * **`DB_URL`**: `jdbc:postgresql://<host>:5432/tripflow` *(Prepend `jdbc:` to the PostgreSQL host string)*
   * **`DB_USERNAME`**: `tripflow`
   * **`DB_PASSWORD`**: `<your-db-password>`
5. Deploy or redeploy. Hibernate automatically creates all tables (`spring.jpa.hibernate.ddl-auto=update`), and `DataSeeder` inserts initial seed data.

---

## 7. Environment Variables Reference

| Variable Name | Required | Service | Default / Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | Auto (Render) | Backend | `8080` | Dynamic port assigned by Render container environment |
| `SERVER_ADDRESS` | Recommended | Backend | `0.0.0.0` | IP binding address |
| `JWT_SECRET` | Recommended | Backend | *(Render Generated)* | Secret key for signing and verifying JWT tokens |
| `OWNER_EMAIL` | Optional | Backend | `owner@tripflow.com` | Owner notifications recipient email |
| `CORS_ALLOWED_ORIGINS` | Recommended | Backend | `https://*.onrender.com,http://localhost:5500` | Allowed origins for cross-origin frontend requests |
| `DB_URL` | Optional | Backend | `jdbc:h2:file:./data/tripflow;AUTO_SERVER=TRUE;DB_CLOSE_DELAY=-1` | JDBC URL for H2 or cloud PostgreSQL |
| `DB_USERNAME` | Optional | Backend | `sa` | Database user credentials |
| `DB_PASSWORD` | Optional | Backend | *(empty)* | Database password credentials |
| `SMTP_HOST` / `SMTP_PORT` | Optional | Backend | `smtp.example.com` / `587` | Outgoing email configuration (if email alerts are used) |
