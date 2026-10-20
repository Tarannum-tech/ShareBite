# 🍲 ShareBite – Food Donation Platform

**Connecting Food Donors, Charities, NGOs, and Volunteers to Reduce Food Waste**

ShareBite is a web-based food donation platform designed to reduce food waste and promote food redistribution. It connects food donors with charities, NGOs, volunteers, and people in need through a centralized digital platform.

The platform enables users to manage food donations, submit food requests, coordinate deliveries, and track donation status through a responsive and user-friendly interface.

## 🌐 Live Demo

- **Frontend:** "share-bite-liart.vercel.app"
- **Backend API:** "https://sharebite-api-ryvz.onrender.com"


## ✨ Features

- 🔐 **User Registration and Login** – Create an account and securely sign in.
- 👥 **Role-Based Workspaces** – Different interfaces and workflows for donors, charities, and volunteers.
- 🍱 **Food Donation Management** – Publish and manage available food donations.
- 📋 **Food Request Management** – Request available donations and manage request status.
- ✅ **Request Approval** – Charities can approve requests and coordinate deliveries.
- 🚚 **Delivery Coordination** – Create delivery tasks and update delivery progress.
- 📊 **Status Dashboard** – View donation, request, and delivery statuses in one place.
- 🌍 **Community Impact Overview** – Monitor food-sharing activities and their impact.
- 📱 **Responsive UI** – Access the platform through a modern, responsive interface.
- 🖼️ **Food Photography** – Food-themed visuals enhance the user experience.

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite 6
- JavaScript (ES6+)
- JSX
- HTML5
- CSS3
- Lucide React Icons

### Backend
- Node.js 18+
- Express.js 4
- REST API
- JSON Web Tokens (JWT) for authentication
- Node.js `crypto.scrypt` for password hashing

### Database
- MongoDB
- Mongoose 8

### Tools and Deployment
- Git and GitHub
- Vercel – Frontend hosting
- Render – Backend hosting
- MongoDB Atlas or a local MongoDB instance

## 🏗️ Project Structure

```text
ShareBite/
├── src/                      # React frontend
├── public/                   # Static assets
├── sharebite-backend/        # Express API and database logic
├── legacy-frontend/          # Legacy HTML, CSS and JS pages
├── index.html                # Vite entry HTML
├── package.json              # Frontend dependencies
└── vite.config.js             # Vite configuration
```


## ⚙️ Getting Started

Follow these instructions to run ShareBite locally.

### Prerequisites

Install the following before starting:

- Node.js 18 or later
- npm
- MongoDB local instance or a MongoDB Atlas database
- Git (recommended)

### 1. Clone the Repository

```bash
git clone YOUR-GITHUB-REPOSITORY-URL
cd ShareBite
```

Replace `YOUR-GITHUB-REPOSITORY-URL` with your actual GitHub repository URL.

### 2. Configure the Backend

Open a terminal in the backend directory:

```bash
cd sharebite-backend
npm install
```

Create a `.env` file inside `sharebite-backend/` and configure the following variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret_at_least_32_characters
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

- `MONGO_URI`: Your MongoDB connection string.
- `JWT_SECRET`: A strong, randomly generated secret used to sign authentication tokens.
- `PORT`: The backend server port.
- `CLIENT_ORIGIN`: The frontend origin allowed to access the API.

**Security:** Never commit your `.env` file or expose database credentials and JWT secrets in your repository.

### 3. Start the Backend

From the `sharebite-backend` directory, run:

```bash
npm run dev
```

The API should run on:

`http://localhost:5000`

Check the health endpoint:

`http://localhost:5000/api/health`

### 4. Configure and Start the Frontend

Open a second terminal in the project root:

```bash
npm install
npm run dev
```

Vite typically starts the frontend at:

`http://localhost:5173`

Open the URL displayed in your terminal.

> Ensure that your frontend and backend dependencies are installed and that the Vite proxy is configured correctly for local API requests.

## 🔐 Authentication and Security

ShareBite includes a sign-in and account creation flow backed by the backend API.

- User accounts are stored in MongoDB.
- Passwords are salted and hashed using Node.js `crypto.scrypt`.
- Plaintext passwords are not stored.
- API data routes use signed, expiring bearer tokens.
- Role-based workflows support the different responsibilities of platform users.

Production deployments should also enforce server-side role authorization, input validation, appropriate CORS restrictions, secure secret management, and food safety checks.

## 🔄 How ShareBite Works

1. **Register or Sign In:** Users access the platform through the account interface.
2. **Publish Donations:** Donors list food that is available for donation.
3. **Request Food:** Charities or eligible users request available donations.
4. **Approve Requests:** Charities manage requests and arrange delivery tasks.
5. **Coordinate Deliveries:** Volunteers update delivery progress and status.
6. **Track Impact:** The dashboard displays donation, request, and delivery information.

## 🚀 Deployment

ShareBite uses separate hosting services for the frontend and backend.

- **Frontend:** Deployed on Vercel.
- **Backend:** Deployed on Render.
- **Database:** MongoDB for persistent data storage.

For deployment, configure the required environment variables in the hosting dashboards. Set the production `CLIENT_ORIGIN` to the actual frontend URL and ensure the backend CORS configuration permits that origin.

Keep all database credentials and authentication secrets private.

## 🎯 Project Objective

The primary objective of ShareBite is to minimize food waste by making surplus food easier to redistribute to people and organizations that need it.

By connecting donors, charities, NGOs, and volunteers, the platform aims to support a more organized, accessible, and efficient food donation process.

## 🌱 Future Enhancements

- 📍 Location-based donation discovery
- 🔔 Real-time notifications for requests and deliveries
- 🗺️ Map-based delivery tracking
- 📈 Advanced analytics and impact reports
- 🏢 Verified NGO and charity profiles
- 🥗 Food expiry and safety validation
- 🌐 Multi-language support

## 👩‍💻 Built With

ShareBite is developed using React, Node.js, Express.js, and MongoDB, combining a responsive frontend with a REST API and persistent database storage.

**ShareBite – Share More Food, Waste Less, Help More.** 🍲💚
