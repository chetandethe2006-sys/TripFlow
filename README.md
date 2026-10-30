# TripFlow — Autonomous Precision for Next-Gen Logistics

TripFlow is a full-stack logistics and fleet management platform providing real-time tracking, trip dispatching, driver and vehicle management, customer accounts, and automated notifications.

---

## 1. Project Architecture

* **Frontend Framework:** Vanilla Modern JavaScript (ES6+), HTML5, and Tailwind CSS (CDN-based with container queries and forms plugins). Zero Node.js build dependencies required.
* **Backend Technology:** Java 21, Spring Boot 4.1.1 (Spring MVC, Spring Data JPA, Spring Security, JWT authentication via JJWT 0.12.6, and Spring Mail).
* **Database Layer:**
  * **Default (Out-of-the-Box):** Persistent embedded file database using H2 (`./data/tripflow;AUTO_SERVER=TRUE;DB_CLOSE_DELAY=-1`).
  * **Production (Render / Cloud):** Fully compatible with PostgreSQL (Render Managed PostgreSQL, Supabase, Neon, AWS RDS) via JDBC.
  * **Schema & Seeding:** Hibernate auto-migration (`spring.jpa.hibernate.ddl-auto=update`) and automatic initial seeding (`DataSeeder.java`).

---

## 2. Local Development

### Prerequisites
* JDK 21+ installed
* Internet access for initial Maven dependency resolution and Tailwind CDN

### Running Locally
1. **Start Backend:**
   ```bash
   cd backend
   ./mvnw clean spring-boot:run
   ```
   *(On Windows: `.\mvnw.cmd clean spring-boot:run`)*
   The backend will start on `http://localhost:8080`.

2. **Access Frontend:**
   * Option A (Embedded): Open `http://localhost:8080` in your browser.
   * Option B (Live Server / Static): Open `frontend/index.html` using VS Code Live Server (`http://localhost:5500`).

3. **Default Seed Credentials:**
   * **Owner/Admin:** Username: `owner` (or `admin`, `owner@tripflow.com`) | Password: `owner123`
   * **Driver:** ID: `DRV-01` | Password: `driver123`

---

## 3. Deployment on Render

TripFlow is optimized for deployment on [Render](https://render.com). You can deploy it using either **Model 1 (Single Web Service)** or **Model 2 (Decoupled Static Site + Web Service)**.

---

### Model 1: Full-Stack Web Service (Recommended — Single Service)

In this model, the backend builds and serves both the Spring Boot REST API and the static frontend assets from a single Render Web Service. This minimizes resource usage and eliminates cross-origin (CORS) complexity.

#### Step-by-Step Render Configuration:
1. Log in to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub repository containing the TripFlow source code.
3. Configure the following service settings:

| Setting | Value |
| :--- | :--- |
| **Name** | `tripflow-app` (or your chosen name) |
| **Region** | Oregon, Frankfurt, or your nearest region |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Java` |
| **Build Command** | `./mvnw clean package -DskipTests` |
| **Start Command** | `java -jar target/tripflow-backend-0.0.1-SNAPSHOT.jar` |
| **Plan** | `Free` (or `Starter`) |
| **Health Check Path** | `/api/test` |

4. Under **Environment Variables**, add the following:

| Key | Value | Purpose |
| :--- | :--- | :--- |
| `JAVA_VERSION` | `21` | Specifies Java 21 runtime on Render |
| `SERVER_ADDRESS` | `0.0.0.0` | Binds server to all interfaces |
| `JWT_SECRET` | *Click "Generate"* (or enter 32+ random characters) | Secret key for signing authentication tokens |
| `OWNER_EMAIL` | `owner@tripflow.com` | Owner alert and notifications email |
| `DB_URL` | *(See Database Configuration below)* | Database connection string |

5. Click **Create Web Service**. Render will automatically build the application and host it on `https://<your-service-name>.onrender.com`.

---

### Model 2: Decoupled Web Service + Static Site

If you prefer hosting the frontend on a Render global CDN Static Site and the backend on a Web Service:

1. **Deploy Backend Web Service:**
   * Follow the steps in Model 1 above.
   * Note down your backend URL: `https://tripflow-backend.onrender.com`.
   * Add environment variable on backend:
     * `CORS_ALLOWED_ORIGINS`: `https://tripflow-frontend.onrender.com,http://localhost:5500`

2. **Deploy Frontend Static Site:**
   * In `frontend/config.js`, set:
     ```javascript
     window.TRIPFLOW_API_URL = "https://tripflow-backend.onrender.com/api";
     ```
   * In Render Dashboard, click **New +** -> **Static Site**.
   * Root Directory: `frontend`
   * Build Command: *(Leave blank)*
   * Publish Directory: `.`
   * Click **Create Static Site**.

---

### 4. Database Setup on Render

#### Option A: Persistent H2 Database (Default — Zero Setup)
If no external database is configured, TripFlow runs with its built-in persistent H2 file database:
```properties
DB_URL=jdbc:h2:file:./data/tripflow;AUTO_SERVER=TRUE;DB_CLOSE_DELAY=-1
```
*Note: On Render Free tier web services without persistent disks, file database changes reset upon service restart.*

#### Option B: Render Managed PostgreSQL (Production)
1. In Render Dashboard, click **New +** -> **PostgreSQL**.
2. Name: `tripflow-db`, Database: `tripflow`, User: `tripflow`.
3. Once created, copy the **Internal Database URL** (e.g. `postgresql://tripflow:password@dpg-xxxx:5432/tripflow`).
4. In your `tripflow-app` Web Service Environment Variables, configure:
   * **`DB_URL`**: `jdbc:postgresql://<host>:5432/tripflow` (Prepend `jdbc:` to the PostgreSQL host string)
   * **`DB_USERNAME`**: `<your-db-user>`
   * **`DB_PASSWORD`**: `<your-db-password>`
5. Deploy or redeploy. Hibernate will automatically execute table creation (`ddl-auto=update`), and `DataSeeder` will populate the initial test data on startup.

---

### 5. Automated 1-Click Deployment (Render Blueprints)

TripFlow includes a pre-configured `render.yaml` Blueprint file in the repository root.
1. In Render Dashboard, click **Blueprints** -> **New Blueprint Instance**.
2. Select your TripFlow repository.
3. Render reads `render.yaml` and provisions the Web Service with the correct build and start commands automatically.

---

## 6. Environment Variables Reference

| Variable Name | Required | Default / Example | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Auto (Render) | `8080` | Port assigned dynamically by Render |
| `SERVER_ADDRESS` | Optional | `0.0.0.0` | IP binding address |
| `JAVA_VERSION` | Yes | `21` | Java version for the Render build environment |
| `DB_URL` | Optional | `jdbc:h2:file:./data/tripflow;AUTO_SERVER=TRUE;DB_CLOSE_DELAY=-1` | JDBC URL for H2 or PostgreSQL |
| `DB_USERNAME` | Optional | `sa` | Database user |
| `DB_PASSWORD` | Optional | *(empty)* | Database password |
| `DB_DRIVER` | Optional | *(auto-detected)* | JDBC driver class name |
| `JWT_SECRET` | Recommended | `TripFlowSecureSuperSecretKey...` | Cryptographic secret for JWT signing |
| `OWNER_EMAIL` | Optional | `owner@tripflow.com` | Primary owner notification email |
| `SMTP_HOST` | Optional | `smtp.example.com` | Outgoing mail server (if email notifications enabled) |
| `SMTP_PORT` | Optional | `587` | Outgoing mail port |
| `SMTP_USERNAME` | Optional | *(empty)* | SMTP login username |
| `SMTP_PASSWORD` | Optional | *(empty)* | SMTP login password |
| `CORS_ALLOWED_ORIGINS` | Optional | `http://localhost:5500,https://*.onrender.com` | Comma-separated allowed origins |
