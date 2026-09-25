package ai.cyphex.ui

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.provider.Settings
import android.util.Log
import android.view.*
import android.widget.ImageView
import android.widget.TextView
import ai.cyphex.R
import ai.cyphex.model.CallDirection
import ai.cyphex.model.DetectionResult
import ai.cyphex.model.SecurityVerdict

/**
 * Enterprise In-Call Security Floating Overlay HUD.
 * Renders a high-tech obsidian/cyan biometric security widget directly above the
 * Android native in-call screen.
 */
class InCallSecurityOverlayManager(private val context: Context) {

    companion object {
        private const val TAG = "CYPHEX_OverlayHUD"
    }

    private val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private var overlayView: View? = null
    private var isShowing = false

    // UI View References
    private var tvPhoneNumber: TextView? = null
    private var tvCallDirection: TextView? = null
    private var tvRiskPercentage: TextView? = null
    private var tvVerdictBadge: TextView? = null
    private var tvRecommendation: TextView? = null
    private var tvAnomalyFlags: TextView? = null
    private var ivStatusDot: ImageView? = null
    private var ivWarningShield: ImageView? = null

    @SuppressLint("InflateParams", "ClickableViewAccessibility")
    fun showOverlay(phoneNumber: String, direction: CallDirection) {
        if (isShowing || !canDrawOverlays()) {
            Log.w(TAG, "Cannot show overlay. isShowing=$isShowing, canDrawOverlays=${canDrawOverlays()}")
            return
        }

        try {
            val layoutParamsType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            } else {
                @Suppress("DEPRECATION")
                WindowManager.LayoutParams.TYPE_PHONE
            }

            val params = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                layoutParamsType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                        WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
                PixelFormat.TRANSLUCENT
            ).apply {
                gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
                y = 120
            }

            val inflater = LayoutInflater.from(context)
            overlayView = inflater.inflate(R.layout.layout_incall_security_overlay, null)

            // Bind Views
            tvPhoneNumber = overlayView?.findViewById(R.id.tvOverlayPhoneNumber)
            tvCallDirection = overlayView?.findViewById(R.id.tvOverlayDirection)
            tvRiskPercentage = overlayView?.findViewById(R.id.tvOverlayRiskScore)
            tvVerdictBadge = overlayView?.findViewById(R.id.tvOverlayVerdict)
            tvRecommendation = overlayView?.findViewById(R.id.tvOverlayRecommendation)
            tvAnomalyFlags = overlayView?.findViewById(R.id.tvOverlayAnomalyFlags)
            ivStatusDot = overlayView?.findViewById(R.id.ivOverlayStatusDot)
            ivWarningShield = overlayView?.findViewById(R.id.ivOverlayShield)

            tvPhoneNumber?.text = phoneNumber
            tvCallDirection?.text = if (direction == CallDirection.INCOMING) "INCOMING CALL INTERCEPT" else "OUTGOING CALL INTERCEPT"

            // Setup Touch Dragging
            var initialY = 0
            var initialTouchY = 0f

            overlayView?.setOnTouchListener { _, event ->
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialY = params.y
                        initialTouchY = event.rawY
                        true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        params.y = initialY + (event.rawY - initialTouchY).toInt()
                        windowManager.updateViewLayout(overlayView, params)
                        true
                    }
                    else -> false
                }
            }

            // Dismiss Button
            overlayView?.findViewById<View>(R.id.btnOverlayDismiss)?.setOnClickListener {
                hideOverlay()
            }

            windowManager.addView(overlayView, params)
            isShowing = true
            Log.i(TAG, "🛡️ In-Call Floating Security HUD displayed successfully.")

        } catch (e: Exception) {
            Log.e(TAG, "Failed to render floating overlay: ${e.message}", e)
        }
    }

    fun updateDetectionResult(result: DetectionResult) {
        if (!isShowing || overlayView == null) return

        overlayView?.post {
            val percentage = (result.score * 100).toInt()
            tvRiskPercentage?.text = "$percentage%"
            tvRecommendation?.text = result.recommendation

            val verdict = result.toVerdict()
            tvVerdictBadge?.text = verdict.label

            when (verdict) {
                SecurityVerdict.BLOCKED -> {
                    tvRiskPercentage?.setTextColor(Color.parseColor("#EF4444"))
                    tvVerdictBadge?.setBackgroundColor(Color.parseColor("#7F1D1D"))
                    tvVerdictBadge?.setTextColor(Color.parseColor("#FCA5A5"))
                    ivWarningShield?.setColorFilter(Color.parseColor("#EF4444"))
                }
                SecurityVerdict.MFA_REQUIRED -> {
                    tvRiskPercentage?.setTextColor(Color.parseColor("#F59E0B"))
                    tvVerdictBadge?.setBackgroundColor(Color.parseColor("#78350F"))
                    tvVerdictBadge?.setTextColor(Color.parseColor("#FDE68A"))
                    ivWarningShield?.setColorFilter(Color.parseColor("#F59E0B"))
                }
                SecurityVerdict.MONITOR -> {
                    tvRiskPercentage?.setTextColor(Color.parseColor("#06B6D4"))
                    tvVerdictBadge?.setBackgroundColor(Color.parseColor("#164E63"))
                    tvVerdictBadge?.setTextColor(Color.parseColor("#A5F3FC"))
                    ivWarningShield?.setColorFilter(Color.parseColor("#06B6D4"))
                }
                SecurityVerdict.ALLOW -> {
                    tvRiskPercentage?.setTextColor(Color.parseColor("#10B981"))
                    tvVerdictBadge?.setBackgroundColor(Color.parseColor("#064E3B"))
                    tvVerdictBadge?.setTextColor(Color.parseColor("#A7F3D0"))
                    ivWarningShield?.setColorFilter(Color.parseColor("#10B981"))
                }
            }

            if (result.anomalyFlags.isNotEmpty()) {
                tvAnomalyFlags?.visibility = View.VISIBLE
                tvAnomalyFlags?.text = result.anomalyFlags.joinToString(" • ")
            } else {
                tvAnomalyFlags?.visibility = View.GONE
            }
        }
    }

    fun hideOverlay() {
        if (!isShowing || overlayView == null) return

        try {
            windowManager.removeView(overlayView)
            overlayView = null
            isShowing = false
            Log.i(TAG, "In-Call Floating Security HUD dismissed.")
        } catch (e: Exception) {
            Log.w(TAG, "Error removing overlay view: ${e.message}")
        }
    }

    private fun canDrawOverlays(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(context)
        } else {
            true
        }
    }
}

