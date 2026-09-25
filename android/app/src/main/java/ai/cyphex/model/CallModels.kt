package ai.cyphex.model

import com.google.gson.annotations.SerializedName

enum class CallDirection {
    INCOMING,
    OUTGOING
}

enum class CallLifecycleState {
    IDLE,
    RINGING,
    ACTIVE_IN_PROGRESS,
    ENDED,
    MISSED,
    REJECTED
}

enum class SecurityVerdict(val label: String, val colorHex: String) {
    ALLOW("BONA FIDE HUMAN", "#10B981"),
    MONITOR("ACOUSTIC MONITOR", "#06B6D4"),
    MFA_REQUIRED("STEP-UP MFA REQUIRED", "#F59E0B"),
    BLOCKED("CRITICAL SPOOF BLOCKED", "#EF4444")
}

data class CallSession(
    val sessionId: String,
    val phoneNumber: String,
    val direction: CallDirection,
    val startedAt: Long = System.currentTimeMillis(),
    var state: CallLifecycleState = CallLifecycleState.IDLE,
    var riskScore: Float = 0.0f,
    var verdict: SecurityVerdict = SecurityVerdict.ALLOW,
    var anomalyFlags: List<String> = emptyList(),
    var latencyMs: Long = 0,
    var jitter: Float = 0.0f,
    var shimmer: Float = 0.0f,
    var hnr: Float = 0.0f,
    var speechActive: Boolean = false
)

data class DetectionResult(
    @SerializedName("score")
    val score: Float = 0.0f,

    @SerializedName("anomaly_flags")
    val anomalyFlags: List<String> = emptyList(),

    @SerializedName("recommendation")
    val recommendation: String = "ALLOW: Authentic human phonation",

    @SerializedName("latency_ms")
    val latencyMs: Long = 0,

    @SerializedName("jitter")
    val jitter: Float = 0.0f,

    @SerializedName("shimmer")
    val shimmer: Float = 0.0f,

    @SerializedName("hnr")
    val hnr: Float = 0.0f,

    @SerializedName("f0_mean")
    val f0Mean: Float = 0.0f,

    @SerializedName("speech_active")
    val speechActive: Boolean = false
) {
    fun toVerdict(): SecurityVerdict {
        return when {
            score >= 0.80f -> SecurityVerdict.BLOCKED
            score >= 0.60f -> SecurityVerdict.MFA_REQUIRED
            score >= 0.30f -> SecurityVerdict.MONITOR
            else -> SecurityVerdict.ALLOW
        }
    }
}

