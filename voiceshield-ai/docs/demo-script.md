# VoiceShield AI — SIH 2026 Judge Demonstration Script

Use this step-by-step walkthrough for evaluating the prototype:

---

### Step 1: Sign In
1. Navigate to `http://localhost:3000/#/login`.
2. Click **👤 Operations Officer** (`employee@demo.com`) to auto-fill credentials.
3. Click **Access Security Console**.

---

### Step 2: Overview Dashboard (`/dashboard`)
1. Point out the top 4 SOC KPIs:
   - **Calls Scanned Today**: 142
   - **Suspicious Intercepts**: 18
   - **Critical Threats Blocked**: 4
   - **Transactions Protected**: ₹85.0 Lakh
2. Highlight the **Risk Score Over Time** graph displaying the 10:00 AM threat spike.
3. Demonstrate language switching in the top bar across 11 Indian languages (Hindi, Odia, Bengali, Tamil, etc.).

---

### Step 3: Flagship Attack Simulation (`/demo`)
1. Navigate to **Attack Simulator Demo** (`/demo`).
2. Show **Scenario 1 (Genuine Executive)**: Risk is 12 🟢 (TRUSTED).
3. Show **Scenario 2 (Suspicious Caller)**: Risk is 67 🟠 (VERIFY).
4. Click **Scenario 3 (AI Voice Impersonation)**:
   - Click **Run Live Attack Simulation**.
   - Watch the animated score progression: `10 → 24 → 42 → 61 → 78 → 94`!
   - The oscilloscope lights up with active speech phonemes.
   - The **VOICE INTEGRITY Card** jumps to **94 / 100 CRITICAL THREAT**.
   - The **Why is this risky?** card expands, highlighting:
     - Synthetic voice characteristics detected (86%)
     - Speaker mismatch vs enrolled CFO voiceprint (78%)
     - Urgency detected ("immediately before 4 PM")
     - Unrecognized caller number (+91 98200 11223)
   - The automated circuit breaker activates: **TRANSACTION PLACED ON HOLD** for ₹25,00,000.

---

### Step 4: Secondary Identity Verification (`/verification`)
1. Click **Verify Identity** on the hold banner.
2. Select **Registered Mobile (SMS OTP)**.
3. Click **Dispatch Verification Challenge**.
4. Enter evaluation token: `123456`.
5. Click **Confirm Authorization**:
   - The risk drops dramatically from **91 / 100** down to **12 / 100 (LOW)**.
   - The hold is safely released.

---

### Step 5: Incident Investigation (`/incidents/VC-28491`)
1. Navigate to `/incidents`.
2. Click **Investigate** on Incident **#VC-28491**.
3. View the forensic signal decomposition and chronological audit timeline proving full DPDP Act 2023 compliance.
