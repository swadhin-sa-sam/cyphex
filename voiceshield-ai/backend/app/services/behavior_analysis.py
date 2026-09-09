import re
from typing import List, Optional
from app.schemas.schemas import BehaviorResult

class BehaviorAnalysisService:
    """
    Social Engineering & Linguistic Behavioral Risk Analyzer.
    Detects high-pressure cues, credential harvesting, secrecy, and policy bypass attempts.
    """
    def __init__(self):
        self.patterns = {
            "urgency": [
                r"\b(immediately|right now|urgent|hurry|emergency|asap|before market close|without delay)\b",
                r"\b(can't wait|time-sensitive|critical deadline)\b"
            ],
            "secrecy": [
                r"\b(don't tell|keep this between us|confidential|secret|off the record|strictly private)\b",
                r"\b(don't mention this to anyone|do not email|do not document)\b"
            ],
            "financial_request": [
                r"\b(wire transfer|transfer money|send funds|escrow|payment|lakh|crore|remit|invoice)\b",
                r"\b(immediate transfer|release the payment|settle the balance)\b"
            ],
            "otp_request": [
                r"\b(otp|one-time password|read me the code|verification code|sms code|auth code)\b"
            ],
            "credential_request": [
                r"\b(password|login|credentials|username|pin|security question|access token)\b"
            ],
            "policy_bypass": [
                r"\b(bypass|skip the procedure|waive the review|override protocol|don't bother checking)\b",
                r"\b(ignore the approval|i take full responsibility|exception)\b"
            ],
            "authority_claim": [
                r"\b(i am the (cfo|ceo|director|founder|president|chairman))\b",
                r"\b(executive order|board approved|direct instruction from management)\b"
            ],
            "unusual_instruction": [
                r"\b(new account|different account|unregistered bank|personal account|changed routing)\b",
                r"\b(offshore|cryptocurrency|unusual vendor)\b"
            ]
        }

    def analyze(self, text: str, scenario_override: Optional[str] = None) -> BehaviorResult:
        if scenario_override == "ai_impersonation":
            return BehaviorResult(
                behavior_risk_score=0.85,
                urgency_detected=True,
                secrecy_detected=True,
                financial_request=True,
                otp_request=False,
                credential_request=False,
                policy_bypass=True,
                authority_claim=True,
                unusual_instruction=True,
                detected_phrases=[
                    "Urgency: 'transfer immediately before 4 PM'",
                    "Financial Request: 'wire ₹25 lakh to ABC Trading'",
                    "Policy Bypass: 'skip normal secondary review'",
                    "Authority Claim: 'I am the CFO Rajesh Sharma'"
                ]
            )
        elif scenario_override == "suspicious_caller":
            return BehaviorResult(
                behavior_risk_score=0.55,
                urgency_detected=True,
                secrecy_detected=False,
                financial_request=True,
                otp_request=False,
                credential_request=False,
                policy_bypass=False,
                authority_claim=False,
                unusual_instruction=True,
                detected_phrases=[
                    "Urgency: 'need to update invoice ASAP'",
                    "Unusual Instruction: 'new account routing details'"
                ]
            )
        elif scenario_override == "genuine_executive":
            return BehaviorResult(
                behavior_risk_score=0.08,
                urgency_detected=False,
                secrecy_detected=False,
                financial_request=False,
                otp_request=False,
                credential_request=False,
                policy_bypass=False,
                authority_claim=False,
                unusual_instruction=False,
                detected_phrases=[]
            )

        text_lower = text.lower()
        detected_flags = {}
        detected_phrases: List[str] = []

        total_weight = 0
        for category, regex_list in self.patterns.items():
            matched = False
            for reg in regex_list:
                match = re.search(reg, text_lower)
                if match:
                    matched = True
                    detected_phrases.append(f"{category.replace('_', ' ').title()}: '{match.group(0)}'")
                    break
            detected_flags[category] = matched
            if matched:
                total_weight += 1

        # Max score scaling
        risk_score = min(1.0, total_weight * 0.22)

        return BehaviorResult(
            behavior_risk_score=round(risk_score, 2),
            urgency_detected=detected_flags.get("urgency", False),
            secrecy_detected=detected_flags.get("secrecy", False),
            financial_request=detected_flags.get("financial_request", False),
            otp_request=detected_flags.get("otp_request", False),
            credential_request=detected_flags.get("credential_request", False),
            policy_bypass=detected_flags.get("policy_bypass", False),
            authority_claim=detected_flags.get("authority_claim", False),
            unusual_instruction=detected_flags.get("unusual_instruction", False),
            detected_phrases=detected_phrases
        )
