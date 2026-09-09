import httpx
import logging

logger = logging.getLogger(__name__)

class WebhookNotifier:
    async def send(self, url: str, payload: dict):
        if not url:
            return
            
        try:
            async with httpx.AsyncClient() as client:
                await client.post(url, json=payload, timeout=5.0)
        except Exception as e:
            logger.error(f"Webhook failed to {url}: {e}")
