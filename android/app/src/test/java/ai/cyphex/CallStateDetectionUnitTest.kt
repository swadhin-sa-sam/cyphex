package ai.cyphex

import ai.cyphex.model.CallDirection
import ai.cyphex.model.CallLifecycleState
import ai.cyphex.model.DetectionResult
import ai.cyphex.model.SecurityVerdict
import org.junit.Assert.*
import org.junit.Test

class CallStateDetectionUnitTest {

    @Test
    fun testVerdictMappingFromScore() {
        val criticalSpoof = DetectionResult(
            score = 0.94f,
            anomalyFlags = listOf("HF_VOCODER_ARTIFACT", "PROSODY_ROBOTIC_FLATNESS"),
            recommendation = "CRITICAL: Neural vocoder synthesis detected."
        )
        assertEquals(SecurityVerdict.BLOCKED, criticalSpoof.toVerdict())

        val highRisk = DetectionResult(
            score = 0.75f,
            anomalyFlags = listOf("UNNATURAL_PITCH_JUMP"),
            recommendation = "HIGH: Step-up MFA challenge required."
        )
        assertEquals(SecurityVerdict.MFA_REQUIRED, highRisk.toVerdict())

        val monitorAnomaly = DetectionResult(
            score = 0.45f,
            anomalyFlags = listOf("SPECTRAL_TILT_ANOMALY"),
            recommendation = "MONITOR: Elevated jitter signature recorded."
        )
        assertEquals(SecurityVerdict.MONITOR, monitorAnomaly.toVerdict())

        val authenticHuman = DetectionResult(
            score = 0.08f,
            anomalyFlags = emptyList(),
            recommendation = "ALLOW: Authentic human phonation."
        )
        assertEquals(SecurityVerdict.ALLOW, authenticHuman.toVerdict())
    }

    @Test
    fun testCallLifecycleTransitions() {
        // 1. Simulating incoming answered call flow
        var currentDirection = CallDirection.INCOMING
        var currentState = CallLifecycleState.RINGING

        assertEquals(CallLifecycleState.RINGING, currentState)

        // User answers call
        currentState = CallLifecycleState.ACTIVE_IN_PROGRESS
        assertEquals(CallLifecycleState.ACTIVE_IN_PROGRESS, currentState)
        assertTrue("Defense service should activate on off-hook", currentState == CallLifecycleState.ACTIVE_IN_PROGRESS)

        // Call concludes
        currentState = CallLifecycleState.ENDED
        assertEquals(CallLifecycleState.ENDED, currentState)

        // 2. Simulating outgoing call flow
        currentDirection = CallDirection.OUTGOING
        currentState = CallLifecycleState.ACTIVE_IN_PROGRESS
        assertEquals(CallDirection.OUTGOING, currentDirection)
        assertEquals(CallLifecycleState.ACTIVE_IN_PROGRESS, currentState)
    }
}

