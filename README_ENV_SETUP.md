# Environment Variables Setup for Railway

## Required Railway Backend Environment Variables

Add these environment variables in Railway dashboard for the backend service:

```
TELEGRAM_BOT_TOKEN=your_actual_telegram_bot_token
WEB_APP_URL=https://linkup-frontend-production.up.railway.app
DEBUG_MODE=false
```

## How to add variables in Railway:

1. Go to Railway dashboard
2. Select your backend project 
3. Go to Settings > Environment
4. Add each variable with its value
5. Deploy the changes

## Getting Telegram Bot Token:

1. Message @BotFather on Telegram
2. Create a new bot or use existing one
3. Get the token from BotFather
4. Set the Web App URL using this command:
   `/setmenubutton` - then send the web app URL

## Setting up Web App in Bot:

After setting environment variables, configure the bot:

1. Message your bot: `/start`
2. The bot should show "Open LinkUp" button
3. If not, contact @BotFather and set up Web App properly

## Debug Web App:

Add `?debug=true` to the URL to see debug information about Telegram Web App integration. 