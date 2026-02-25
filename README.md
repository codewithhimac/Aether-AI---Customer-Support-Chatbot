# Aether AI Chatbot

A modern full-stack AI chatbot built with a responsive conversational UI, persistent chat history, and backend AI processing.

Designed for real-world customer support use cases such as billing help, account queries, and technical assistance.

---

## 🚀 Features

* Clean and well structured interface
* Persistent conversations stored locally
* Markdown-formatted AI responses
* FastAPI backend with AI model integration
* Scroll management and message streaming UX
* Sidebar conversation management
* Fully responsive layout (desktop, tablet, mobile)

---

## 🛠 Tech Stack

**Frontend**
* React + TypeScript
* TailwindCSS
* Framer Motion
* React Markdown


**Backend**
* FastAPI (Python)
* AI model API integration
* History trimming for token control


## 📦 Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <repo-name>
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

---

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🔐 Environment Variables

Create a `.env` file inside the backend folder:

```
GEMINI_API_KEY=your_api_key_here
```

Never commit this file to GitHub.

---

## 📁 Project Structure

```
frontend/        → React UI
backend/         → FastAPI server
services/        → API + storage logic
routes/          → Backend endpoints
```

---

## 🧠 Future Scope

* Authentication & user accounts
* Database chat storage
* Streaming AI responses
* Industry-specific AI fine-tuning
* Production deployment pipeline

---

## 📄 License

For learning and demonstration purposes.
