package ai.cyphex.service

import android.annotation.SuppressLint
import android.app.*
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import ai.cyphex.R
import ai.cyphex.audio.LiveCallAudioStreamer
import ai.cyphex.model.CallDirection
import ai.cyphex.model.DetectionResult
import ai.cyphex.ui.InCallSecurityOverlayManager
import ai.cyphex.ui.MainActivity
import java.util.UUID

/**
 * CYPHEX Android Foreground Service.
 * Runs with high priority throughout active phone call durations, coordinating
 * audio record sampling, WebSocket telemetry streaming, and in-call HUD rendering.
 */
class CallInterceptionForegroundService : Service() {

    companion object {
        private const val TAG = "CYPHEX_Service"
        const val CHANNEL_ID = "cyphex_call_defense_channel"
        const val NOTIFICATION_ID = 8941

        const val ACTION_START_INTERCEPTION = "ai.cyphex.ACTION_START_INTERCEPTION"
        const val ACTION_STOP_INTERCEPTION = "ai.cyphex.ACTION_STOP_INTERCEPTION"
        const val EXTRA_PHONE_NUMBER = "extra_phone_number"
        const val EXTRA_CALL_DIRECTION = "extra_call_direction"
    }

    private var audioStreamer: LiveCallAudioStreamer? = null
    private var overlayManager: InCallSecurityOverlayManager? = null
    private var wakeLock: PowerManager.WakeLock? = null

    private var currentSessionId: String = ""
    private var currentPhoneNumber: String = ""
    private var currentDirection: CallDirection = CallDirection.INCOMING

    override fun onCreate() {
        super.onCreate()
        Log.i(TAG, "CYPHEX CallInterceptionForegroundService created.")
        createNotificationChannel()
        overlayManager = InCallSecurityOverlayManager(this)

        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "CYPHEX:CallDefenseWakeLock")
    }

    @SuppressLint("WakelockTimeout")
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action

        if (action == ACTION_STOP_INTERCEPTION) {
            stopInterception()
            stopSelf()
            return START_NOT_STICKY
        }

        if (action == ACTION_START_INTERCEPTION) {
            currentPhoneNumber = intent.getStringExtra(EXTRA_PHONE_NUMBER) ?: "Unknown Caller"
            val directionStr = intent.getStringExtra(EXTRA_CALL_DIRECTION) ?: CallDirection.INCOMING.name
            currentDirection = CallDirection.valueOf(directionStr)
            currentSessionId = "SES-MOB-" + UUID.randomUUID().toString().substring(0, 8).uppercase()

            startInterception()
        }

        return START_NOT_STICKY
    }

    private fun startInterception() {
        Log.i(TAG, "🛡️ Starting In-Call Defense Session: $currentSessionId for $currentPhoneNumber")

        // 1. Acquire WakeLock
        try {
            wakeLock?.acquire(30 * 60 * 1000L /* 30 minutes max call timeout */)
        } catch (e: Exception) {
            Log.w(TAG, "WakeLock acquire notice: ${e.message}")
        }

        // 2. Start Foreground with Android 14+ Type Safety
        val notification = buildOngoingNotification("Active Call Defense: $currentPhoneNumber (Scanning)")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val serviceType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE or ServiceInfo.FOREGROUND_SERVICE_TYPE_PHONE_CALL
            } else {
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE
            }
            startForeground(NOTIFICATION_ID, notification, serviceType)
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }

        // 3. Show In-Call Floating Overlay HUD
        overlayManager?.showOverlay(currentPhoneNumber, currentDirection)

        // 4. Start Live Audio Streamer to CYPHEX Backend
        // Default to local development server or configure via settings
        val wsUrl = "ws://10.0.2.2:8000/ws/audio" // Android Emulator host or remote CYPHEX endpoint
        audioStreamer = LiveCallAudioStreamer(
            serverWsUrl = wsUrl,
            sessionId = currentSessionId,
            profile = "STANDARD",
            onDetectionUpdate = { result ->
                handleDetectionResult(result)
            },
            onError = { error ->
                Log.e(TAG, "AudioStreamer error: $error")
            }
        )
        audioStreamer?.startStreaming()
    }

    private fun handleDetectionResult(result: DetectionResult) {
        // Update Overlay HUD
        overlayManager?.updateDetectionResult(result)

        // Update Notification if Critical Spoof
        if (result.score >= 0.80f) {
            updateNotification("🚨 CRITICAL SPOOF DETECTED: ${result.toVerdict().label}")
        }
    }

    private fun stopInterception() {
        Log.i(TAG, "🛑 Stopping In-Call Defense Session.")

        audioStreamer?.stopStreaming()
        audioStreamer = null

        overlayManager?.hideOverlay()

        if (wakeLock?.isHeld == true) {
            wakeLock?.release()
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE)
        } else {
            @Suppress("DEPRECATION")
            stopForeground(true)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "CYPHEX Active Voice Defense",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Displays real-time voice spoofing and deepfake telemetry during active phone calls."
                setShowBadge(true)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildOngoingNotification(contentText: String): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(this, CallInterceptionForegroundService::class.java).apply {
            action = ACTION_STOP_INTERCEPTION
        }
        val stopPendingIntent = PendingIntent.getService(
            this,
            1,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("CYPHEX VoiceShield AI")
            .setContentText(contentText)
            .setSmallIcon(R.drawable.ic_cyphex_shield)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setContentIntent(pendingIntent)
            .addAction(R.drawable.ic_close, "Dismiss", stopPendingIntent)
            .build()
    }

    private fun updateNotification(newText: String) {
        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(NOTIFICATION_ID, buildOngoingNotification(newText))
    }

    override fun onDestroy() {
        stopInterception()
        super.onDestroy()
        Log.i(TAG, "CYPHEX CallInterceptionForegroundService destroyed.")
    }

    override fun onBind(intent: Intent?): IBinder? = null
}

