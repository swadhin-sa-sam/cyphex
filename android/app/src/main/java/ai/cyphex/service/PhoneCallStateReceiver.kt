package ai.cyphex.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager
import android.util.Log
import androidx.core.content.ContextCompat
import ai.cyphex.model.CallDirection
import ai.cyphex.model.CallLifecycleState

/**
 * CYPHEX Production BroadcastReceiver for Telephony Events.
 * Accurately tracks call state transitions across Android 8 through Android 14+.
 * Seamlessly starts the AI Voice Defense Foreground Service when an incoming or outgoing call begins,
 * and tears it down when the call concludes.
 */
class PhoneCallStateReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "CYPHEX_CallReceiver"

        // State Machine Tracking (prevent spurious or duplicate triggers)
        private var lastState: Int = TelephonyManager.CALL_STATE_IDLE
        private var isIncoming: Boolean = false
        private var savedNumber: String? = null
        private var callStartTime: Long = 0

        // Public listener for in-app or simulator testing
        var onCallStateChangedListener: ((direction: CallDirection, state: CallLifecycleState, number: String) -> Unit)? = null
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        Log.d(TAG, "Telephony Broadcast received: $action")

        if (action == Intent.ACTION_NEW_OUTGOING_CALL) {
            savedNumber = intent.getStringExtra(Intent.EXTRA_PHONE_NUMBER)
            isIncoming = false
            Log.i(TAG, "Outgoing call initiated to target: $savedNumber")
            return
        }

        if (action == TelephonyManager.ACTION_PHONE_STATE_CHANGED) {
            val stateStr = intent.getStringExtra(TelephonyManager.EXTRA_STATE) ?: return
            val number = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER)
            if (!number.isNullOrBlank()) {
                savedNumber = number
            }

            val state = when (stateStr) {
                TelephonyManager.EXTRA_STATE_RINGING -> TelephonyManager.CALL_STATE_RINGING
                TelephonyManager.EXTRA_STATE_OFFHOOK -> TelephonyManager.CALL_STATE_OFFHOOK
                TelephonyManager.EXTRA_STATE_IDLE -> TelephonyManager.CALL_STATE_IDLE
                else -> return
            }

            processCallState(context, state, savedNumber ?: "Unknown Number")
        }
    }

    private fun processCallState(context: Context, state: Int, number: String) {
        if (state == lastState) {
            // Duplicate event from multiple telephony subsystems
            return
        }

        when (state) {
            TelephonyManager.CALL_STATE_RINGING -> {
                isIncoming = true
                callStartTime = System.currentTimeMillis()
                Log.i(TAG, "📞 [RINGING] Incoming call detected from: $number. Standby for answer.")
                onCallStateChangedListener?.invoke(CallDirection.INCOMING, CallLifecycleState.RINGING, number)
            }

            TelephonyManager.CALL_STATE_OFFHOOK -> {
                if (lastState == TelephonyManager.CALL_STATE_RINGING) {
                    // Incoming Call Answered
                    isIncoming = true
                    Log.i(TAG, "🛡️ [OFFHOOK] Incoming call answered from: $number. Activating CYPHEX VoiceShield!")
                    onCallStateChangedListener?.invoke(CallDirection.INCOMING, CallLifecycleState.ACTIVE_IN_PROGRESS, number)
                    startVoiceShieldService(context, CallDirection.INCOMING, number)
                } else {
                    // Outgoing Call Started
                    isIncoming = false
                    callStartTime = System.currentTimeMillis()
                    Log.i(TAG, "🛡️ [OFFHOOK] Outgoing call active to: $number. Activating CYPHEX VoiceShield!")
                    onCallStateChangedListener?.invoke(CallDirection.OUTGOING, CallLifecycleState.ACTIVE_IN_PROGRESS, number)
                    startVoiceShieldService(context, CallDirection.OUTGOING, number)
                }
            }

            TelephonyManager.CALL_STATE_IDLE -> {
                if (lastState == TelephonyManager.CALL_STATE_RINGING) {
                    // Missed or Rejected incoming call
                    Log.i(TAG, "⚠️ [IDLE] Call from $number was MISSED or REJECTED before answer.")
                    onCallStateChangedListener?.invoke(CallDirection.INCOMING, CallLifecycleState.MISSED, number)
                } else if (lastState == TelephonyManager.CALL_STATE_OFFHOOK) {
                    // Call concluded normally
                    val durationSec = (System.currentTimeMillis() - callStartTime) / 1000
                    Log.i(TAG, "🛑 [IDLE] Active call ended with $number. Duration: ${durationSec}s. Deactivating CYPHEX.")
                    val direction = if (isIncoming) CallDirection.INCOMING else CallDirection.OUTGOING
                    onCallStateChangedListener?.invoke(direction, CallLifecycleState.ENDED, number)
                    stopVoiceShieldService(context)
                }
                // Reset state machine
                savedNumber = null
                isIncoming = false
            }
        }

        lastState = state
    }

    private fun startVoiceShieldService(context: Context, direction: CallDirection, phoneNumber: String) {
        val serviceIntent = Intent(context, CallInterceptionForegroundService::class.java).apply {
            action = CallInterceptionForegroundService.ACTION_START_INTERCEPTION
            putExtra(CallInterceptionForegroundService.EXTRA_PHONE_NUMBER, phoneNumber)
            putExtra(CallInterceptionForegroundService.EXTRA_CALL_DIRECTION, direction.name)
        }
        ContextCompat.startForegroundService(context, serviceIntent)
    }

    private fun stopVoiceShieldService(context: Context) {
        val serviceIntent = Intent(context, CallInterceptionForegroundService::class.java).apply {
            action = CallInterceptionForegroundService.ACTION_STOP_INTERCEPTION
        }
        context.startService(serviceIntent)
    }
}

