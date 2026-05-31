# Servio — Food Delivery Web App

> A full-stack food delivery platform that connects users with local restaurants through a smooth, intuitive ordering experience.

**Live Demo:** [servio-livid.vercel.app](https://servio-livid.vercel.app)

---

## Overview

Servio is a full-stack food delivery web application built with **React** on the frontend and **Node.js** on the backend, deployed live on **Vercel**. Built independently from planning to production, it demonstrates a complete full-stack development workflow — covering UI design, API integration, state management, and live deployment.

---

## Features

- **Restaurant Listings** — Browse local restaurants with category-based filtering and search functionality
- **Menu Explorer** — Detailed menu views with dynamic item rendering powered by live API data
- **Cart Management** — Real-time quantity controls with live order summary calculations
- **Checkout Flow** — Structured checkout process with address input and order confirmation
- **Client-Side Navigation** — Seamless page transitions using React Router
- **Backend API** — Node.js handles order processing, restaurant/menu data management, and client–database communication

---

## Tech Stack

<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="40" title="React"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="40" title="Node.js"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" width="40" title="JavaScript"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg" width="40" title="Vercel"/>
</p>

| Layer | Technology |
|-------|-----------|
| Frontend | React, React Router |
| Backend | Node.js |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ramsha1554/servio.git
cd servio

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Running Locally

```bash
# Start the backend server
cd backend
npm start

# In a separate terminal, start the frontend
cd frontend
npm start
```

The app will be available at `http://localhost:3000`.

---

## Project Structure

```
servio/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-level page components
│   │   └── ...
├── backend/           # Node.js server
│   ├── routes/        # API route handlers
│   ├── controllers/   # Business logic
│   └── ...
```

---

## Screenshots




---

## Author

**Ramsha** — Built and deployed independently as a full-stack project.

- GitHub: [@ramsha1554](https://github.com/ramsha1554)

---

## License

This project is open source and available under the [MIT License](LICENSE).
