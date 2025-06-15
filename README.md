🧠 Real Estate App Powered by AI

This is a modern and intelligent real estate application built with a powerful frontend and backend stack.
It uses Artificial Intelligence to enhance the user experience, automate tasks, and deliver smart features that make real estate operations more efficient and insightful.

🌍 Live backend: harmless-sheep-234

⸻

🧩 Project Structure
	•	Frontend: Located in the app directory, built with Vite for fast and efficient development.
	•	Backend: Located in the convex directory, using Convex for real-time data handling and reactive server functions.

To start both the frontend and backend locally, run:
npm run dev

⸻

🔐 Authentication

The app uses Convex Auth with Anonymous Authentication by default, allowing instant access without sign-up.
You can upgrade to more secure auth methods like Google, email, or JWT before deploying.

⸻

🤖 AI Features in the App

The app is designed with AI-first thinking, integrating the following intelligent functionalities:
	•	🔍 Smart Search: Understands user queries in natural language to find matching properties.
	•	📊 Dynamic Pricing Suggestions: Recommends property prices based on market data and trends.
	•	🧠 Behavior Tracking: Learns from user behavior to improve recommendations and layout.
	•	📷 Image Intelligence (Coming Soon): AI-based image tagging for property photos.

⸻

🚀 Development & Deployment

For best results and deployment:
	•	📘 Convex Overview
	•	☁️ Deployment Guide
	•	✅ Best Practices

⸻

🌐 Custom API Routes

Custom HTTP routes are defined in convex/router.ts.
This file is separated from convex/http.ts to ensure core auth routes are not modified, especially those integrated with AI logic.

⸻
