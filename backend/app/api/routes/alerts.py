from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.alerts.alert_manager import alert_manager

router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])

class AlertConfig(BaseModel):
    profile: str = Field(default="STANDARD")
    channels: list[str] = Field(default=["webhook", "sms"])
    webhook_url: str | None = None

@router.post("/configure")
async def configure_alerts(config: AlertConfig):
    return {
        "status": "success",
        "configured_profile": config.profile,
        "channels": config.channels,
        "webhook_url": config.webhook_url
    }

@router.get("/history")
async def alert_history(limit: int = 50):
    return alert_manager.get_history(limit=limit)

@router.post("/test")
async def test_alert():
    dispatched = await alert_manager.send_alert(
        session_id="TEST-SIMULATION",
        risk_score=0.88,
        anomaly_flags=["TEST_FLAG", "HIGH_FREQ_CUTOFF"],
        recommendation="Verify caller identity via secondary channel"
    )
    return {
        "status": "success",
        "message": "Test alert simulated",
        "dispatched": dispatched
    }
