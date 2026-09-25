package ai.cyphex.ui

import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import ai.cyphex.R
import ai.cyphex.model.CallDirection
import ai.cyphex.model.CallLifecycleState
import ai.cyphex.model.DetectionResult
import ai.cyphex.permissions.PermissionManager
import ai.cyphex.service.CallInterceptionForegroundService
import ai.cyphex.service.PhoneCallStateReceiver

class MainActivity : AppCompatActivity() {

    private lateinit var permissionManager: PermissionManager

    // UI elements
    private lateinit var tvDefenseStatus: TextView
    private lateinit var ivStatusPulse: ImageView
    private lateinit var tvTelephonyStatus: TextView
    private lateinit var tvMicStatus: TextView
    private lateinit var tvOverlayStatus: TextView
    private lateinit var tvBatteryStatus: TextView
    private lateinit var tvRecentCallLog: TextView

    private lateinit var btnGrantPermissions: Button
    private lateinit var btnGrantOverlay: Button
    private lateinit var btnSimulateIncoming: Button
    private lateinit var btnSimulateOutgoing: Button
    private lateinit var btnSimulateHangup: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        permissionManager = PermissionManager(this)
        bindViews()
        setupListeners()
        updatePermissionUI()

        // Register call state listener for live UI updates
        PhoneCallStateReceiver.onCallStateChangedListener = { direction, state, number ->
            runOnUiThread {
                val dirStr = if (direction == CallDirection.INCOMING) "INCOMING" else "OUTGOING"
                val logEntry = "\n[${System.currentTimeMillis()}] $dirStr $state - $number"
                tvRecentCallLog.append(logEntry)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        updatePermissionUI()
    }

    private fun bindViews() {
        tvDefenseStatus = findViewById(R.id.tvDefenseStatus)
        ivStatusPulse = findViewById(R.id.ivStatusPulse)
        tvTelephonyStatus = findViewById(R.id.tvTelephonyStatus)
        tvMicStatus = findViewById(R.id.tvMicStatus)
        tvOverlayStatus = findViewById(R.id.tvOverlayStatus)
        tvBatteryStatus = findViewById(R.id.tvBatteryStatus)
        tvRecentCallLog = findViewById(R.id.tvRecentCallLog)

        btnGrantPermissions = findViewById(R.id.btnGrantPermissions)
        btnGrantOverlay = findViewById(R.id.btnGrantOverlay)
        btnSimulateIncoming = findViewById(R.id.btnSimulateIncoming)
        btnSimulateOutgoing = findViewById(R.id.btnSimulateOutgoing)
        btnSimulateHangup = findViewById(R.id.btnSimulateHangup)
    }

    private fun setupListeners() {
        btnGrantPermissions.setOnClickListener {
            permissionManager.requestRequiredRuntimePermissions()
        }

        btnGrantOverlay.setOnClickListener {
            permissionManager.requestOverlayPermission()
        }

        // In-App Call Lifecycle Simulator for developer and enterprise testing
        btnSimulateIncoming.setOnClickListener {
            simulateCallState(CallDirection.INCOMING, "+91 98201 44821")
        }

        btnSimulateOutgoing.setOnClickListener {
            simulateCallState(CallDirection.OUTGOING, "Accounts Payable (Treasury Desk)")
        }

        btnSimulateHangup.setOnClickListener {
            val stopIntent = Intent(this, CallInterceptionForegroundService::class.java).apply {
                action = CallInterceptionForegroundService.ACTION_STOP_INTERCEPTION
            }
            startService(stopIntent)
            Toast.makeText(this, "Simulated Call Hangup / Idle", Toast.LENGTH_SHORT).show()
        }
    }

    private fun simulateCallState(direction: CallDirection, number: String) {
        val report = permissionManager.getStatusReport()
        if (!report.hasOverlayPermission) {
            Toast.makeText(this, "Please grant Overlay permission to view in-call HUD", Toast.LENGTH_LONG).show()
            permissionManager.requestOverlayPermission()
            return
        }

        val serviceIntent = Intent(this, CallInterceptionForegroundService::class.java).apply {
            action = CallInterceptionForegroundService.ACTION_START_INTERCEPTION
            putExtra(CallInterceptionForegroundService.EXTRA_PHONE_NUMBER, number)
            putExtra(CallInterceptionForegroundService.EXTRA_CALL_DIRECTION, direction.name)
        }
        ContextCompat.startForegroundService(this, serviceIntent)
        Toast.makeText(this, "Activated VoiceShield Interception for $number", Toast.LENGTH_SHORT).show()
    }

    private fun updatePermissionUI() {
        val report = permissionManager.getStatusReport()

        if (report.isFullyArmed) {
            tvDefenseStatus.text = "SOC DEFENSE ARMED & ACTIVE"
            tvDefenseStatus.setTextColor(Color.parseColor("#10B981"))
            ivStatusPulse.setColorFilter(Color.parseColor("#10B981"))
            btnGrantPermissions.visibility = View.GONE
            btnGrantOverlay.visibility = View.GONE
        } else {
            tvDefenseStatus.text = "PERMISSIONS REQUIRED"
            tvDefenseStatus.setTextColor(Color.parseColor("#F59E0B"))
            ivStatusPulse.setColorFilter(Color.parseColor("#F59E0B"))
            btnGrantPermissions.visibility = View.VISIBLE
            btnGrantOverlay.visibility = if (!report.hasOverlayPermission) View.VISIBLE else View.GONE
        }

        tvTelephonyStatus.text = if (report.hasTelephonyPermission) "GRANTED" else "REQUIRED"
        tvTelephonyStatus.setTextColor(if (report.hasTelephonyPermission) Color.parseColor("#10B981") else Color.parseColor("#EF4444"))

        tvMicStatus.text = if (report.hasMicrophonePermission) "GRANTED" else "REQUIRED"
        tvMicStatus.setTextColor(if (report.hasMicrophonePermission) Color.parseColor("#10B981") else Color.parseColor("#EF4444"))

        tvOverlayStatus.text = if (report.hasOverlayPermission) "GRANTED" else "REQUIRED"
        tvOverlayStatus.setTextColor(if (report.hasOverlayPermission) Color.parseColor("#10B981") else Color.parseColor("#EF4444"))

        tvBatteryStatus.text = if (report.isBatteryOptimizationIgnored) "UNRESTRICTED" else "OPTIMIZED"
        tvBatteryStatus.setTextColor(if (report.isBatteryOptimizationIgnored) Color.parseColor("#10B981") else Color.parseColor("#94A3B8"))
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PermissionManager.PERMISSION_REQUEST_CODE) {
            updatePermissionUI()
        }
    }
}

