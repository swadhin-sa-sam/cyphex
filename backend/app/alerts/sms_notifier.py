import httpx
import logging
from app.config import settings

logger = logging.getLogger(__name__)

class SMSNotifier:
    async def send(self, phone: str, message: str):
        if not settings.SMS_API_KEY:
            logger.info(f"MOCK SMS to {phone}: {message}")
            return
            
        try:
            async with httpx.AsyncClient() as client:
                await client.post("https://api.sms-provider.local/send", json={
                    "api_key": settings.SMS_API_KEY,
                    "to": phone,
                    "text": message
                })
        except Exception as e:
            logger.error(f"Failed to send SMS: {e}")
