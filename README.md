
<div align="center">

![SmartMeet Banner](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=220&section=header&text=SmartMeet&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Meet%20Smarter,%20Not%20Just%20Longer&descAlignY=55&descAlign=50)

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1000&color=A855F7&center=true&vCenter=true&width=650&lines=Track+real+engagement%2C+not+just+attendance.;Face+presence+%C2%B7+gaze+%C2%B7+head+pose+%C2%B7+in+real+time.;Automated+post-meeting+engagement+reports.;Built+with+Next.js%2C+WebRTC+%26+Computer+Vision." alt="Typing SVG" />

<br/>

[![Live Demo](https://img.shields.io/badge/🚀_LIVE_DEMO-4C1D95?style=for-the-badge)](https://smartmeet-platform.vercel.app/)
[![Watch Video](https://img.shields.io/badge/▶_WATCH_DEMO-FF0000?style=for-the-badge&logo=googledrive&logoColor=white)](https://drive.google.com/file/d/1vJCgurEKFQtbW6a0b-jdf42E78mo7WCF/view)
[![Jira](https://img.shields.io/badge/TRACKED_ON_JIRA-0052CC?style=for-the-badge&logo=jira&logoColor=white)](https://pucit-smartmeet.atlassian.net/jira)

<br/>

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![OpenCV](https://img.shields.io/badge/OpenCV-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-0097A7?style=for-the-badge&logo=google&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

<img src="https://raw.githubusercontent.com/Platane/snk/output/github-contribution-grid-snake.svg" width="0" height="0" alt="" />

</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">

## 🧠 What is SmartMeet?

Zoom, Meet, and Teams can tell you **who joined**. None of them can tell you **who was actually paying attention**.

**SmartMeet** is a full-stack online meeting platform that layers real-time **computer-vision-based engagement analysis** on top of standard video conferencing — face presence, gaze direction, and head pose are tracked live, and every session ends with an automated report scoring each participant's attentiveness. Built as a Final Year Design Project at the **Department of Software Engineering, University of the Punjab (PUCIT)**.

> 📊 Current systems measure *presence*. SmartMeet measures *attention*.

<img src="https://user-images.githubusercontent.com/74038190/212284136-03988914-d899-44b4-b1d9-4eeccf656e44.gif" width="100%">

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🗂️ Core Platform
- 🔐 Secure authentication (JWT-based sessions)
- 🏢 Organizations — hosts create orgs & add participants
- 📅 Meeting scheduling + link/ID-based joining
- 🎦 Real-time video, audio & chat (WebRTC)
- 🖥️ Screen sharing, mic/audio controls
- 📋 Automated attendance logging
- 📈 Host dashboard with analytics

</td>
<td width="50%" valign="top">

### 👁️ Engagement Intelligence
- **Real-time detection** (MediaPipe + OpenCV)
  - Face presence · gaze direction · head pose
- **Post-meeting deep analysis** (Flask service)
  - Posture + gaze detection
  - 16 frames sampled per 10-sec window
  - `Highly Engaged` · `Engaged` · `Not Engaged`
- 📄 Per-participant & session engagement reports
- 📝 AI meeting notes from audio/transcript

</td>
</tr>
</table>

<img src="https://user-images.githubusercontent.com/74038190/212284136-03988914-d899-44b4-b1d9-4eeccf656e44.gif" width="100%">

## 🏗️ Architecture

```
┌──────────────────────┐      ┌──────────────────────┐      ┌────────────────────┐
│   Frontend            │◄────►│   Backend              │◄────►│   Database          │
│   Next.js + Tailwind   │      │   Node.js + Express      │      │   PostgreSQL (Neon) │
│                         │      │   REST + GraphQL          │      │   Prisma ORM        │
└──────────┬────────────┘      └──────────┬─────────────┘      └────────────────────┘
           │                              │
           │   WebRTC (video/audio/chat)  │
           ▼                              ▼
┌──────────────────────┐      ┌──────────────────────────┐
│  Real-time CV          │      │  Post-meeting CV            │
│  MediaPipe + OpenCV     │      │  Flask microservice          │
│  (in-session)           │      │  (engagement scoring +        │
│                          │      │   meeting notes generation)   │
└──────────────────────┘      └──────────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js, Tailwind CSS |
| **Backend** | Node.js, Express.js — REST (writes) + GraphQL (reads) |
| **Database** | PostgreSQL (Neon), Prisma ORM |
| **Real-time Communication** | WebRTC |
| **Authentication** | JWT / NextAuth / Supabase Auth |
| **Computer Vision (real-time)** | Python, OpenCV, MediaPipe |
| **Computer Vision (post-processing)** | Flask, OpenCV, MediaPipe |
| **Deployment** | Vercel |
| **Version Control / PM** | GitHub, Jira |

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">

## 🚀 Getting Started

### Prerequisites
`Node.js v18+` · `npm` · `PostgreSQL` · `Python 3.9+`

### 1️⃣ Clone the repository
```bash
git clone https://github.com/laiba-ajmal-12/SmartMeetFYP.git
cd SmartMeetFYP
```

### 2️⃣ Backend setup
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 3️⃣ Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 4️⃣ Environment variables
Create a `.env` file in the backend directory:
```env
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
PORT=5000
```

### 5️⃣ AI / Computer Vision service (Flask)

The CV engine lives in its own service and is kept isolated from the Node/Next stack to avoid dependency conflicts.

```bash
cd ai-service

# Recommended: use a dedicated virtual environment
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the service
python app.py
```

**What it does:**
- Ingests short video clips (10-second windows → 16 sampled frames)
- Runs posture + gaze detection via MediaPipe
- Classifies engagement per window: `Highly Engaged` · `Engaged` · `Not Engaged`
- Aggregates results into per-participant and per-session engagement reports
- Generates meeting/class notes from audio or transcript on host request

> 💡 A consolidated copy of every other module lives alongside `app.py` for convenience during local development.

### 6️⃣ Access the app

```
http://localhost:3000
```

Or use the live deployment 👉 **[smartmeet-platform.vercel.app](https://smartmeet-platform.vercel.app/)**

**Demo credentials:**
| Email | Password |
|---|---|
| `admin@smartmeet.com` | `Admin@1234` |

<img src="https://user-images.githubusercontent.com/74038190/212284136-03988914-d899-44b4-b1d9-4eeccf656e44.gif" width="100%">

## 📁 Repository Structure & Branching

**Main branches**
- `master` — production-ready code
- `develop` — stable development branch

**Feature & supporting branches**
- `feature/ui` · `cv` · `Smart-Meet-Server-only` · `Backend` · `server` · `integration_b`

All features are developed in dedicated branches and merged into `develop` → `master` after integration and testing.

## 🗺️ Roadmap

- [ ] Cross-platform video transfer improvements
- [ ] Post-meeting engagement report enhancements
- [ ] Real-time low-attentiveness warnings for hosts
- [ ] Attendance weighting based on attention metrics
- [ ] Advanced AI/deep-learning models for emotion analysis
- [ ] Native Android / iOS apps
- [ ] Enterprise-scale deployment support

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">

## 👥 Team

<div align="center">

Developed by **Team SmartMeet**, Department of Software Engineering, FCIT — University of the Punjab, Lahore
*(BS Software Engineering, 2022–2026)*

| Name | Roll Number |
|---|---|
| AbdulAhad Tayyab | BSEF22M020 |
| Laiba Ajmal | BSEF22M030 |
| Areeha Zulfiqar | BSEF22M042 |
| Salal Shabbir | BSEF22M047 |

**Supervisor:** Dr. Muhammad Farooq, Assistant Professor

</div>

## 🔗 Links

- 🌐 Live App: [smartmeet-platform.vercel.app](https://smartmeet-platform.vercel.app/)
- 🎬 Demo Video: [Watch here](https://drive.google.com/file/d/1vJCgurEKFQtbW6a0b-jdf42E78mo7WCF/view)
- 📋 Jira Board: [pucit-smartmeet.atlassian.net](https://pucit-smartmeet.atlassian.net/jira)
- 💻 Source: [github.com/laiba-ajmal-12/SmartMeetFYP](https://github.com/laiba-ajmal-12/SmartMeetFYP)

## 📄 License

This project was developed for academic purposes as part of a Final Year Design Project. See [LICENSE](LICENSE) for details.

<div align="center">

![Footer](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer)

**Meet smarter, not just longer.** ⚡

</div>
* Express.js
* REST APIs (for create/update/delete operations)
* GraphQL (for data retrieval)

### Database

* PostgreSQL
* Prisma ORM

## Setup Instructions

### Prerequisites

* Node.js (v18 or above recommended)
* npm
* PostgreSQL

### Backend Setup

```termina(run these commands on terminal)
# First go to backend directory
npm install

# Generate Prisma client to develop the environment for prisma to run
npx prisma generate

# Run database migrations to apply all one by one
npx prisma migrate dev

# Start backend server
npm run dev
```

### Frontend Setup

```terminal(run these commands on terminal)
# Navigate to frontend directory
npm install

# Start frontend development server
npm run dev
```

### Environment Variables

A `.env` file is required for both frontend and backend. It typically includes:

. Database connection string
. Authentication secrets

## Repository Structure & Branching

### Main Branches

* `master` – Production-ready code
* `develop` – Stable development branch

### Feature & Supporting Branches 

* `feature/ui`
* `cv`
* `Smart-Meet-Server-only`
* `Backend`
* `server`
* `integration_b`

All Sprint 1 features were developed in feature-specific branches and merged into `develop` and `master` after integration.

## TODOs

The following items are planned for future sprints:

* Cross platform video transfer
* post meeting engagement reports
* Real-time warnings when participant attentiveness drops below a threshold
* Attendance calculation based on attention metrics
