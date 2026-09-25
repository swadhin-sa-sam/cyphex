package ai.cyphex

import android.app.Application
import android.util.Log

class CyphexApplication : Application() {
    companion object {
        lateinit var instance: CyphexApplication
            private set
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        Log.i("CYPHEX_APP", "CYPHEX Mobile Voice Biometrics & Deepfake Defense System Initialized.")
    }
}

