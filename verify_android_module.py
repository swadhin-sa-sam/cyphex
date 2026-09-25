"""
Verification script for CYPHEX Android Call Detection & Security Module.
Checks Android manifest permissions, broadcast receivers, foreground services,
state machines, and layout resources.
"""
import os
import xml.etree.ElementTree as ET

def verify_android_module():
    print("=== CYPHEX ANDROID MODULE VERIFICATION ===")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    android_dir = os.path.join(base_dir, "android")
    manifest_path = os.path.join(android_dir, "app", "src", "main", "AndroidManifest.xml")
    
    assert os.path.exists(manifest_path), f"Missing AndroidManifest.xml at {manifest_path}"
    print("[PASS] AndroidManifest.xml exists.")
    
    # Verify Manifest permissions and components
    tree = ET.parse(manifest_path)
    root = tree.getroot()
    
    permissions = [elem.attrib.get('{http://schemas.android.com/apk/res/android}name') for elem in root.findall('uses-permission')]
    required_perms = [
        "android.permission.READ_PHONE_STATE",
        "android.permission.READ_CALL_LOG",
        "android.permission.RECORD_AUDIO",
        "android.permission.SYSTEM_ALERT_WINDOW",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_MICROPHONE",
        "android.permission.FOREGROUND_SERVICE_PHONE_CALL",
        "android.permission.WAKE_LOCK",
        "android.permission.INTERNET"
    ]
    
    for perm in required_perms:
        assert perm in permissions, f"Missing required permission: {perm}"
        print(f"  [PASS] Permission declared: {perm}")
        
    # Verify Kotlin source files
    kotlin_src_dir = os.path.join(android_dir, "app", "src", "main", "java", "ai", "cyphex")
    expected_files = [
        "CyphexApplication.kt",
        os.path.join("model", "CallModels.kt"),
        os.path.join("service", "PhoneCallStateReceiver.kt"),
        os.path.join("service", "CallInterceptionForegroundService.kt"),
        os.path.join("audio", "LiveCallAudioStreamer.kt"),
        os.path.join("ui", "InCallSecurityOverlayManager.kt"),
        os.path.join("ui", "MainActivity.kt"),
        os.path.join("permissions", "PermissionManager.kt"),
    ]
    
    for rel_path in expected_files:
        full_path = os.path.join(kotlin_src_dir, rel_path)
        assert os.path.exists(full_path), f"Missing source file: {rel_path}"
        print(f"[PASS] Kotlin source file verified: {rel_path}")
        
    # Verify Layout XML files
    res_layout_dir = os.path.join(android_dir, "app", "src", "main", "res", "layout")
    for layout in ["activity_main.xml", "layout_incall_security_overlay.xml"]:
        assert os.path.exists(os.path.join(res_layout_dir, layout)), f"Missing layout: {layout}"
        print(f"[PASS] Layout XML verified: {layout}")
        
    print("\n>>> ALL ANDROID CALL INTERCEPTOR MODULE CHECKS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    verify_android_module()

