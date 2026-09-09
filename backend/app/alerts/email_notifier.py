import logging
from app.config import settings

logger = logging.getLogger(__name__)

class EmailNotifier:
    async def send(self, to: str, subject: str, body: str):
        if not settings.EMAIL_SMTP_HOST:
            logger.info(f"MOCK EMAIL to {to} | {subject} | {body}")
            return
            
        logger.info(f"Sending email to {to} via {settings.EMAIL_SMTP_HOST}")
