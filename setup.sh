#!/bin/bash

# Setup script for LinkUp project

echo "Setting up LinkUp project..."

# Create backend .env file if it doesn't exist
if [ ! -f backend/.env ]; then
  echo "Creating backend/.env file..."
  cat > backend/.env << EOL
DATABASE_URL=postgresql://postgres:postgres@localhost/linkup
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
WEB_APP_URL=http://localhost:5173
EOL
  echo "Backend .env file created. Please update with your actual credentials."
fi

# Create frontend .env file if it doesn't exist
if [ ! -f frontend/.env ]; then
  echo "Creating frontend/.env file..."
  cat > frontend/.env << EOL
VITE_API_URL=http://localhost:8000
EOL
  echo "Frontend .env file created."
fi

echo "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "Installing backend dependencies..."
pip install -r backend/requirements.txt

echo "Setup complete!"
echo "To start the backend server: 'source venv/bin/activate && cd backend && uvicorn app.main:app --reload'"
echo "To setup the frontend: 'cd frontend && npm install && npm run dev'" 