# LinkUp - Telegram Web App for Event-Based Meetups

LinkUp is a Telegram Web App that facilitates offline meetups and connections through shared events and activities. Unlike traditional dating apps, LinkUp focuses on connecting people through shared activities and interests.

## 🚀 Features

- **Event-Based Connections**: Create events (e.g., "going to the park" or "watching a movie") that others can join
- **User Profiles**: Detailed profiles with photos, descriptions, and interests
- **Approval System**: Event creators can choose who to accept from respondents
- **Telegram Integration**: Seamless notifications through Telegram for event updates and matches
- **Gamification**: Achievement badges for active users and verified members

## 🏗️ Project Structure

The project is divided into two main parts:

### Frontend (Telegram Web App)
- React + TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Telegram Web App SDK for Telegram integration

### Backend (REST API)
- FastAPI (Python)
- PostgreSQL database
- SQLAlchemy ORM
- Telegram Bot API for notifications

## 🔄 Main User Flows

1. **Authentication**
   - User enters through Telegram Web App
   - Profile created or loaded with Telegram data
   - User completes profile with interests and description

2. **Event Creation**
   - User creates an event with title, description, time, location
   - Event appears in the feed

3. **Event Response**
   - Users can respond to available events
   - Responses go to a queue for the creator to review

4. **Response Approval**
   - Event creators can view respondent profiles
   - Accept or decline respondents
   - Telegram notifications sent upon acceptance

5. **Event Management**
   - Creators can edit or cancel events
   - Participants receive notifications about changes

## 📦 Data Models

- **User**: Profile information, interests, photos
- **Event**: Activity details including title, description, time, location
- **EventResponse**: Tracks responses to events and their status
- **Badge**: Achievement badges for user gamification

## 🔧 Setup and Installation

### Prerequisites
- Node.js and npm/yarn
- Python 3.8+
- PostgreSQL database
- Telegram Bot Token

### Backend Setup
1. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

3. Create a `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@localhost/linkup
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   WEB_APP_URL=https://your-webapp-url.com
   ```

4. Run the server:
   ```
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Create a `.env` file:
   ```
   VITE_API_URL=http://localhost:8000
   ```

3. Run the development server:
   ```
   npm run dev
   ```

## 🔒 Deployment

### Backend Deployment
- Deploy to a cloud provider (Heroku, DigitalOcean, AWS)
- Set up a PostgreSQL database
- Configure environment variables

### Frontend Deployment
- Build the frontend: `npm run build`
- Deploy to a static hosting service (Vercel, Netlify)
- Configure the Telegram Bot to use the deployed web app URL

## 🚀 Future Enhancements

- Real-time chat functionality
- Event recommendations based on interests
- Advanced filtering and search options
- Geolocation-based event discovery
- Integration with calendar applications
- Support for recurring events

## 📱 Mobile App Readiness

The project is designed with mobile applications in mind:
- Clean separation of business logic from UI
- REST API suitable for any client platform
- Authentication system that can adapt to mobile platforms
- Universal notification system architecture

## 👨‍💻 Development Team

This project is developed by [Your Name/Team].

## 📄 License

[Specify your license here] 