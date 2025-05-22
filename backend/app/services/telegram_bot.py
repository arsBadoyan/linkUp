import telebot
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from app.models.models import User, Event

load_dotenv()
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WEB_APP_URL = os.getenv("WEB_APP_URL")

bot = telebot.TeleBot(BOT_TOKEN)

def send_event_invitation(user_telegram_id: int, event_title: str, event_id: str):
    """Send invitation to a user when they are accepted to an event"""
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

# Configure start command
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
    print("Starting Telegram bot...")
    bot.polling(none_stop=True) 