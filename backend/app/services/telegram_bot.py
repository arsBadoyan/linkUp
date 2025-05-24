import telebot
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from app.models.models import User, Event
import sys
import traceback
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('telegram_bot')

load_dotenv()
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WEB_APP_URL = os.getenv("WEB_APP_URL")

# Validate essential variables
if not BOT_TOKEN:
    logger.error("TELEGRAM_BOT_TOKEN not set in environment variables!")
if not WEB_APP_URL:
    logger.error("WEB_APP_URL not set in environment variables!")

# Initialize bot only if token is available
bot = None
if BOT_TOKEN:
    try:
        bot = telebot.TeleBot(BOT_TOKEN)
        logger.info(f"Bot initialized with token: {BOT_TOKEN[:4]}...{BOT_TOKEN[-4:] if BOT_TOKEN else ''}")
    except Exception as e:
        logger.error(f"Failed to initialize bot: {str(e)}")
        bot = None
else:
    logger.warning("Bot not initialized due to missing token")

def send_event_invitation(user_telegram_id: int, event_title: str, event_id: str):
    """Send invitation to a user when they are accepted to an event"""
    if not bot:
        logger.warning("Cannot send invitation: Bot not initialized")
        return False
        
    try:
        message = f"🎉 You've been invited to join the event: *{event_title}*!\n\nClick below to view details."
        
        # Create inline keyboard with button to open event details
        markup = telebot.types.InlineKeyboardMarkup()
        markup.add(telebot.types.InlineKeyboardButton(
            "View Event Details", 
            web_app=telebot.types.WebAppInfo(url=f"{WEB_APP_URL}/events/{event_id}")
        ))
        
        bot.send_message(
            chat_id=user_telegram_id,
            text=message,
            parse_mode="Markdown",
            reply_markup=markup
        )
        return True
    except Exception as e:
        print(f"Error sending invitation: {str(e)}")
        return False

def send_event_reminder(user_telegram_id: int, event_title: str, event_id: str):
    """Send reminder to a user about upcoming event"""
    if not bot:
        logger.warning("Cannot send reminder: Bot not initialized")
        return False
        
    try:
        message = f"⏰ Reminder: Event *{event_title}* is starting soon!\n\nClick below to view details."
        
        # Create inline keyboard with button to open event details
        markup = telebot.types.InlineKeyboardMarkup()
        markup.add(telebot.types.InlineKeyboardButton(
            "View Event Details", 
            web_app=telebot.types.WebAppInfo(url=f"{WEB_APP_URL}/events/{event_id}")
        ))
        
        bot.send_message(
            chat_id=user_telegram_id,
            text=message,
            parse_mode="Markdown",
            reply_markup=markup
        )
        return True
    except Exception as e:
        print(f"Error sending reminder: {str(e)}")
        return False

def send_event_updated_notification(user_telegram_id: int, event_title: str, event_id: str):
    """Notify user when an event they're part of has been updated"""
    if not bot:
        logger.warning("Cannot send update notification: Bot not initialized")
        return False
        
    try:
        message = f"📝 Event update: *{event_title}* has been modified by the organizer.\n\nClick below to view the updated details."
        
        # Create inline keyboard with button to open event details
        markup = telebot.types.InlineKeyboardMarkup()
        markup.add(telebot.types.InlineKeyboardButton(
            "View Updated Event", 
            web_app=telebot.types.WebAppInfo(url=f"{WEB_APP_URL}/events/{event_id}")
        ))
        
        bot.send_message(
            chat_id=user_telegram_id,
            text=message,
            parse_mode="Markdown",
            reply_markup=markup
        )
        return True
    except Exception as e:
        print(f"Error sending update notification: {str(e)}")
        return False

def send_response_notification(creator_telegram_id: int, responder_name: str, event_title: str, event_id: str):
    """Notify event creator when someone responds to their event"""
    if not bot:
        logger.warning("Cannot send response notification: Bot not initialized")
        return False
        
    try:
        message = f"👋 *{responder_name}* has responded to your event: *{event_title}*\n\nCheck out their profile and decide if you want to accept!"
        
        # Create inline keyboard with button to open event responses
        markup = telebot.types.InlineKeyboardMarkup()
        markup.add(telebot.types.InlineKeyboardButton(
            "View Responses", 
            web_app=telebot.types.WebAppInfo(url=f"{WEB_APP_URL}/events/{event_id}/responses")
        ))
        
        bot.send_message(
            chat_id=creator_telegram_id,
            text=message,
            parse_mode="Markdown",
            reply_markup=markup
        )
        return True
    except Exception as e:
        print(f"Error sending response notification: {str(e)}")
        return False

# Configure start command only if bot is available
def setup_bot_handlers():
    """Setup bot handlers only if bot is initialized"""
    if not bot:
        logger.warning("Cannot setup handlers: Bot not initialized")
        return
        
    @bot.message_handler(commands=['start'])
    def handle_start(message):
        # Create a button that opens the web app
        markup = telebot.types.InlineKeyboardMarkup()
        markup.add(telebot.types.InlineKeyboardButton(
            "Open LinkUp", 
            web_app=telebot.types.WebAppInfo(url=WEB_APP_URL)
        ))
        
        welcome_message = (
            "👋 Welcome to *LinkUp*!\n\n"
            "Meet new people through events and shared interests.\n\n"
            "• Create your own events\n"
            "• Join events that interest you\n"
            "• Connect with like-minded people\n\n"
            "Click the button below to get started!"
        )
        
        bot.send_message(
            message.chat.id, 
            welcome_message, 
            parse_mode="Markdown",
            reply_markup=markup
        )

def run_bot():
    """Run the Telegram bot"""
    if not bot:
        logger.error("Cannot start bot: Bot not initialized")
        return
    
    if not BOT_TOKEN:
        logger.error("Cannot start bot: No bot token provided")
        return
        
    try:
        # Setup handlers
        setup_bot_handlers()
        
        logger.info(f"Starting Telegram bot with token: {BOT_TOKEN[:4]}...{BOT_TOKEN[-4:] if BOT_TOKEN else ''}")
        logger.info(f"Web App URL: {WEB_APP_URL}")
        
        # Log successful start
        me = bot.get_me()
        logger.info(f"Bot started successfully: @{me.username} (ID: {me.id})")
        
        # Start polling
        bot.polling(none_stop=True)
    except Exception as e:
        error_msg = f"Bot polling error: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        # If critical error, we might want to restart the bot
        # This will be caught by the thread, and it will restart the function
        raise Exception(error_msg) 