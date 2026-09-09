import time
import logging
from collections import deque
from dataclasses import dataclass, asdict
from app.config import settings
from app.alerts.sms_notifier import SMSNotifier
from app.alerts.email_notifier import EmailNotifier
from app.alerts.webhook_notifier import WebhookNotifier

logger = logging.getLogger("cyphex.alerts")

@dataclass
class AlertRecord:
    id: str
    session_id: str
    timestamp: float
    risk_score: float
    anomaly_flags: list[str]
    recommendation: str
    channel: str
    delivered: bool

class AlertManager:
    def __init__(self, cooldown_window: float = 30.0, max_history: int = 200):
        self.cooldown_window = cooldown_window
        self.last_alert_time: dict[str, float] = {}
        self.alert_history: deque = deque(maxlen=max_history)
        
        self.sms = SMSNotifier()
        self.email = EmailNotifier()
        self.webhook = WebhookNotifier()

    async def send_alert(
        self,
        session_id: str,
        risk_score: float,
        anomaly_flags: list[str],
        recommendation: str
    ) -> bool:
        now = time.time()
        if session_id in self.last_alert_time:
            if (now - self.last_alert_time[session_id]) < self.cooldown_window:
                logger.debug(f"Alert suppressed for session {session_id} (in {self.cooldown_window}s cooldown)")
                return False
            
        self.last_alert_time[session_id] = now
        
        message = (
            f"CYPHEX ALERT [Session: {session_id}]: Critical Integrity Risk {risk_score:.1%}. "
            f"Anomalies: {', '.join(anomaly_flags)}. Action: {recommendation}"
        )
        logger.warning(message)

        delivered = True
        channel = "log"

        # Webhook
        if settings.WEBHOOK_URL:
            try:
                await self.webhook.send(settings.WEBHOOK_URL, {
                    "event": "voice_integrity_breach",
                    "session_id": session_id,
                    "risk_score": risk_score,
                    "anomaly_flags": anomaly_flags,
                    "recommendation": recommendation,
                    "timestamp": now
                })
                channel = "webhook"
            except Exception as e:
                logger.error(f"Webhook dispatch failed: {e}")
                delivered = False

        # SMS
        if settings.SMS_API_KEY:
            try:
                await self.sms.send("SECURITY_OFFICER", message)
                channel = f"{channel}+sms"
            except Exception as e:
                logger.error(f"SMS alert dispatch failed: {e}")

        # Record alert
        alert_id = f"ALT-{int(now * 1000)}"
        record = AlertRecord(
            id=alert_id,
            session_id=session_id,
            timestamp=now,
            risk_score=round(risk_score, 4),
            anomaly_flags=anomaly_flags,
            recommendation=recommendation,
            channel=channel,
            delivered=delivered
        )
        self.alert_history.append(record)
        return True

    def get_history(self, limit: int = 50) -> list[dict]:
        return [asdict(r) for r in list(self.alert_history)[-limit:]]

alert_manager = AlertManager()
