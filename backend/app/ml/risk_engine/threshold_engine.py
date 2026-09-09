from dataclasses import dataclass

@dataclass
class ThresholdDecision:
    should_alert: bool
    should_block: bool
    requires_mfa: bool
    risk_level: str
    recommendation_text: str

class ThresholdEngine:
    PROFILES = {
        "STANDARD": {
            "alert": 0.70,
            "block": 0.90,
            "mfa": 0.75
        },
        "HIGH_VALUE_TRANSACTION": {
            "alert": 0.55,
            "block": 0.80,
            "mfa": 0.60
        },
        "PRIVILEGED_ACCESS": {
            "alert": 0.50,
            "block": 0.75,
            "mfa": 0.65
        }
    }

    def evaluate(self, score: float, profile: str = "STANDARD") -> ThresholdDecision:
        p = self.PROFILES.get(profile, self.PROFILES["STANDARD"])
        
        should_alert = score >= p["alert"]
        should_block = score >= p["block"]
        requires_mfa = score >= p["mfa"] and not should_block

        if should_block:
            level = "CRITICAL"
            rec = "Block and disconnect session"
        elif requires_mfa:
            level = "HIGH"
            rec = "Step-up authentication required"
        elif should_alert:
            level = "MEDIUM"
            rec = "Alert security team"
        else:
            level = "LOW"
            rec = "Allow"

        return ThresholdDecision(
            should_alert=should_alert,
            should_block=should_block,
            requires_mfa=requires_mfa,
            risk_level=level,
            recommendation_text=rec
        )
