# Smart Meet – An Online Meeting Platform with Engagement Tracking and Automated Reports

# Project Description

Smart Meet is an online meeting platform that helps hosts understand how engaged participants are during virtual meetings.
It uses computer vision techniques such as head pose and gaze tracking to monitor attentiveness in real time. At the end of each session, the system generates automated reports showing individual participation and overall meeting productivity, allowing hosts to evaluate meeting effectiveness objectively.

## Features Implemented 

The following features are fully implemented in the current MVP:

## Core Platform Features

* User authentication (Sign Up / Login)
* Host role with ability to create organizations
* Host can add participants to organizations and meetings
* Meeting scheduling and listing for hosts
* Real-time meeting controls:
    * Join / Leave meeting
    * Microphone on/off
    * Audio mute/unmute
    * In-meeting chat
    * Screen sharing
 
## Technologies Used

### Backend

* Node.js
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

## TODOs

The following items are planned for future sprints:

* Video mode during meetings (participants cannot currently see each other)
* Improvement and optimization of CV module
* Real-time warnings when participant attentiveness drops below a threshold
* Attendance calculation based on attention metrics
