from typing import Optional, List, Dict
from datetime import datetime
from app.schemas.schemas import ContextRiskResult

class ContextRiskService:
    """
    Contextual Metadata & Transaction Risk Engine.
    Correlates caller phone lineage, transaction amount thresholds, beneficiary novelty, and operational context.
    """
    def __init__(self):
        # Known VIP directory
        self.known_vip_numbers = {
            "+91 98200 99887": "Rajesh Sharma (CFO Official)",
            "+91 98100 11223": "Vikramaditya Roy (SOC Director)"
        }
        # Whitelisted beneficiaries
        self.known_beneficiaries = {
            "TCS Payroll Solutions",
            "AWS Cloud Services India",
            "Airtel Enterprise Telecom"
        }

    def evaluate(
        self,
        caller_phone: str,
        claimed_identity: str,
        transaction_amount: float = 0.0,
        beneficiary_name: Optional[str] = None,
        scenario_override: Optional[str] = None
    ) -> ContextRiskResult:
        if scenario_override == "ai_impersonation":
            return ContextRiskResult(
                caller_anomaly=0.72,
                transaction_risk=0.92,
                context_risk=0.88,
                risk_factors=[
                    "Caller using unrecognized VoIP number (+91 98200 11223)",
                    "High-value transfer request (₹25,00,000 exceeds ₹10,00,000 policy threshold)",
                    "Unregistered beneficiary: 'ABC Trading Pvt Ltd'",
                    "Call initiated outside core operating financial clearing window"
                ]
            )
        elif scenario_override == "suspicious_caller":
            return ContextRiskResult(
                caller_anomaly=0.65,
                transaction_risk=0.70,
                context_risk=0.68,
                risk_factors=[
                    "Unverified vendor contact number",
                    "Attempt to modify existing disbursement routing instructions"
                ]
            )
        elif scenario_override == "genuine_executive":
            return ContextRiskResult(
                caller_anomaly=0.05,
                transaction_risk=0.10,
                context_risk=0.08,
                risk_factors=[]
            )

        risk_factors: List[str] = []
        caller_anomaly = 0.10
        transaction_risk = 0.05

        # 1. Caller recognition
        if caller_phone not in self.known_vip_numbers:
            caller_anomaly += 0.45
            risk_factors.append(f"Caller phone ({caller_phone}) is not recognized in executive directory")
        elif self.known_vip_numbers[caller_phone].split()[0] != claimed_identity.split()[0]:
            caller_anomaly += 0.60
            risk_factors.append(f"Caller phone mismatch with claimed persona '{claimed_identity}'")

        # 2. Transaction evaluation
        if transaction_amount > 0:
            if transaction_amount >= 1000000.0: # >= ₹10 Lakh
                transaction_risk += 0.50
                risk_factors.append(f"Transaction amount (₹{transaction_amount:,.2f}) exceeds high-value threshold")
            elif transaction_amount >= 500000.0:
                transaction_risk += 0.30

            if beneficiary_name and beneficiary_name not in self.known_beneficiaries:
                transaction_risk += 0.35
                risk_factors.append(f"Unregistered/First-time beneficiary: '{beneficiary_name}'")

        context_risk = round(float((caller_anomaly * 0.45) + (transaction_risk * 0.55)), 2)
        caller_anomaly = round(min(1.0, float(caller_anomaly)), 2)
        transaction_risk = round(min(1.0, float(transaction_risk)), 2)

        return ContextRiskResult(
            caller_anomaly=caller_anomaly,
            transaction_risk=transaction_risk,
            context_risk=context_risk,
            risk_factors=risk_factors
        )
