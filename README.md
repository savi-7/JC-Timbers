# 🌲 JC-TIMBERS – AI-Powered Premium Timber & Furniture Platform

### *Crafting Quality, Powered by AI*
A centralized MERN-stack and Flutter mobile ecosystem for premium timber/furniture catalog browsing, visual similarity product search, smart timber cutting & processing bookings, administrative scheduling, and AI-enabled customer chat support.

---

## 🌐 Live Demo & Deployments
* **Backend REST API (Vercel)**: `https://jc-timbersbackend.vercel.app`
* **Local Web Development Client**: `http://localhost:5173`
* **Local FastAPI Image Service**: `http://localhost:8000`

---

## 📖 Overview
**JC-Timbers** is a comprehensive enterprise platform tailored for a premium timber processing and furniture manufacturing business. It bridges the gap between traditional woodworking and modern tech by offering:

1. A full **MERN-Stack E-commerce Web Application** featuring advanced product categories (`timber`, `furniture`, `construction`).
2. A **Flutter Mobile Application** for customers to browse products, track bookings, and manage accounts on the go.
3. An **AI-Powered Customer Assistant** named "Woodpecker" (using Gemini 2.5 Flash) that recommends products and automatically books timber processing services using tool/function calling.
4. An **AI-Powered Computer Vision System** (FastAPI + CLIP + Pinecone Vector Database) for visual similarity search.
5. A **Machine Learning Intake Classifier** (Python models like SVM, Decision Trees, KNN, MLP) to evaluate wood quality based on physical dimensions, moisture content, and supplier metrics.
6. A robust **Admin Service Module** with machine availability checking, conflict detection, holiday calendar blocking, and service lifecycle tracking.

---

## ✨ Features

### 🎓 Customer Features (Web & Mobile)
* **Smart Catalog & Filter**: Browse and filter products with detailed wood dimensions, types, pricing, and customer ratings.
* **Visual similarity Search**: Upload a photo of furniture or timber, and query the FastAPI server to find visually similar items using CLIP cosine similarity (70%+ threshold).
* **Service Bookings**: Book timber processing services (Planing, Resawing, Debarking, Sawing) with customizable parameters (log count, dimensions, wood type) and real-time scheduling checks.
* **Interactive 3D Preview**: Visualize furniture/wood products directly in the browser via Three.js.
* **Secure Checkout**: Seamless purchase integration with Razorpay payment gateway.
* **Support & Ticket Desk**: Create after-sale requests (repair, installation, replacement) and submit product reviews.

### 🛡️ Admin Features
* **Timber Cutting Enquiry Management**: Monitor and filter service requests through a comprehensive workflow dashboard.
* **Machine Availability Checking**: Real-time collision/availability checks using current schedules and booked dates to prevent double-bookings.
* **Holiday Management**: Block out specific dates (with recurring options) to make them unavailable to customer bookings automatically.
* **Inventory & Stock Control**: Manage product levels, wood intakes, and vendor details.
* **Activity Logging & Analytics**: Trace admin status updates and notes with system activity logs.

### 🤖 AI-Powered Modules
* **Woodpecker Chatbot**:
  * Powered by Google Gemini 2.5 Flash.
  - Contextualized with the live catalog of products.
  - Performs function calling (`book_timber_processing` tool) to automatically register a user's service enquiry when matching details are provided.
* **Visual Similarity Search**:
  - Powered by FastAPI, Uvicorn, and a sentence-transformers CLIP model (`clip-ViT-L-14`).
  - Generates 512-dimensional image vectors ("fingerprints").
  - Stores and queries vectors in Pinecone with cosine similarity filters.
* **Wood Quality Classification**:
  - Implements KNN, Naive Bayes, Decision Trees (CART), Support Vector Machines (SVM), and Multi-layer Perceptron (MLP) Neural Networks.
  - Predicts wood quality (High, Medium, Low) from variables such as `WoodType`, `Dimensions`, `Moisture`, and `Cost_per_unit` during vendor intakes.

---

## 🏗️ System Architecture

```
                ┌──────────────────────────────────┐
                │        React.js Web Client       │
                │        & Flutter Mobile App      │
                └─────────────────┬────────────────┘
                                  │
                                  ▼
                ┌──────────────────────────────────┐
                │   Node.js + Express.js Backend   │
                └────────┬───────────────────┬─────┘
                         │                   │
                ┌────────▼─────────┐    ┌────▼──────────────┐
                │  MongoDB Atlas   │    │  FastAPI Image    │
                │     Database     │    │ Similarity Search │
                └──────────────────┘    └────────┬──────────┘
                                                 │
                                        ┌────────▼──────────┐
                                        │  Pinecone Vector  │
                                        │     Database      │
                                        └───────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend (Web)
* **React 19** & **Vite**
* **Tailwind CSS** & **Radix UI** (Accordion, Select, Dialog, Tabs, Switch, etc.)
* **Lucide React** (Icons) & **Framer Motion** (Animations)
* **Three.js** & **React Three Fiber/Drei** (Interactive 3D wood/furniture visualization)
* **jsPDF** & **jsPDF-AutoTable** (PDF invoice & receipt generation)
* **i18next** (Internationalization & language detection)
* **Axios** (HTTP requests)

### Backend (Server)
* **Node.js** & **Express.js** (v5)
* **Mongoose** (MongoDB ODM)
* **JWT Authentication** & **bcryptjs** (Security)
* **Cloudinary** & **Multer** (Cloud media storage)
* **Razorpay API** (Payment Gateway integration)
* **Nodemailer** (Email notifications)
* **@google/genai** (Google Gemini 2.5 Flash SDK)

### Mobile Application
* **Flutter** (Dart)
* Shared JWT authentication endpoints and JSON APIs
* Flutter Launcher Icons (Asset generation)

### AI & Machine Learning
* **FastAPI** & **Uvicorn** (REST API for image matching)
* **Sentence Transformers** (`clip-ViT-L-14`)
* **Pinecone Client** (Vector DB)
* **Python (v3.10+)** with Pandas, NumPy, Scikit-learn (for wood quality models)
* **Pillow** & **Dotenv**

---

## 🔐 Authentication & Security
* **JWT Authentication**: Role-based authentication headers for customers and admins.
* **Google OAuth Login**: Easy authentication using standard Google credentials.
* **Secure Storage**: Image assets handled via Cloudinary instead of storing heavy assets locally.
* **Vulnerability Mitigations**: API rate-limiting via `express-rate-limit` and headers hardening via `helmet`.

---

## 📈 Analytics & Calculations
* **Cubic Feet Volume Calculator**: Real-time volume calculation based on lumber dimensions (length × width × thickness).
* **Vendor Intake Dashboard**: Analytics displaying wood grades, moisture distributions, and supplier metrics.
* **Machine Load Status**: Real-time admin views of machine bookings and conflict warning statistics.

---

## 🎫 Timber Service Lifecycle

```
Customer/Chatbot Books Request
              │
              ▼
    Status: ENQUIRY_RECEIVED
              │
              ▼
   Admin Availability Check
              ├────────── Slot Available? ──────────┐
              │                                     │
              ▼ (Yes)                               ▼ (No)
     Confirm Booking                      Propose Alternate Time
              │                                     │
    Status: SCHEDULED                     Status: ALTERNATE_TIME_PROPOSED
              │                                     │
              │                             Customer Accepts/Rejects
              │                                     ├───────── Accept ─────────┐
              │                                     ▼ (Reject)                 ▼
              │                                 CANCELLED                   SCHEDULED
              ▼                                                                │
     Mark In Progress ◄────────────────────────────────────────────────────────┘
              │
    Status: IN_PROGRESS
              │
              ▼
      Mark Completed
              │
    Status: COMPLETED (Generates PDF slip)
```

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/savi-7/JC-Timbers.git
cd JC-Timbers
```

### 2. Backend Setup (Node.js Express Server)
```bash
cd server
npm install
```
Create a `.env` file in the `server/` directory:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GEMINI_API_KEY=your_gemini_api_key
FASTAPI_URL=http://localhost:8000
```
Start the server in development mode:
```bash
npm run dev
```

### 3. Frontend Setup (React Client)
```bash
cd ../client
npm install
```
Start the React application:
```bash
npm run dev
```

### 4. Mobile App Setup (Flutter)
Ensure you have the Flutter SDK installed.
```bash
cd ../jc_timber_mobile
flutter pub get
```
Run the mobile app:
```bash
flutter run
```
*(Optionally define target backend url using `--dart-define=API_BASE_URL=...`)*

### 5. AI Image Matching Service (FastAPI)
```bash
cd ../ml/image_matching
pip install -r api/requirements.txt
```
Create a `.env` file in the `ml/image_matching/` directory:
```env
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=furniture-images
FASTAPI_PORT=8000
```
Run the startup script:
* **Windows**: `cd api && start_api.bat`
* **Linux/Mac**: `cd api && chmod +x start_api.sh && ./start_api.sh`

### 6. Wood Quality Classification ML Training
```bash
cd ../wood_quality
pip install -r requirements.txt
python train_evaluate.py --data dataset.csv --out results
```

---

## ▶️ Running the Application
For full local development, run the following three services concurrently:

1. **Express Server**: `npm run dev` inside `server/` (runs on port 5001).
2. **React Client**: `npm run dev` inside `client/` (runs on port 5173).
3. **FastAPI Image Matching**: `uvicorn main:app --reload` inside `ml/image_matching/api/` (runs on port 8000).

---

## 🎯 Future Enhancements
* 3D Interactive Timber Cutting simulator in Web/Mobile using R3F.
* Real-time IoT machine load reporting using MachineReading models.
* Auto-routing driver dispatcher system for wood collection/delivery.
* Bulk invoice mailers and localized SMS updates.

---

## 👨‍💻 Developer
**Savio Joseph**
Full Stack Developer | AI & Mobile App Developer

### Connect With Me
* **LinkedIn**: [saviojoseph007](https://www.linkedin.com/in/saviojoseph007)
* **GitHub**: [savi-7](https://github.com/savi-7)
* **Email**: [saviojoseph2581@gmail.com](mailto:saviojoseph2581@gmail.com)

---

## 📄 License
This project is developed for educational and academic purposes.

⭐ **If you found this project interesting, consider giving it a star on GitHub.**
