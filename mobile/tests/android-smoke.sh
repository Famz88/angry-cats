#!/usr/bin/env bash
set -euo pipefail
apk="${1:?APK path required}"
out=mobile/test-results/android
mkdir -p "$out"
trap 'adb logcat -d > "$out/logcat.txt"; adb exec-out screencap -p > "$out/final.png"' EXIT
adb logcat -c
adb shell settings put secure immersive_mode_confirmations confirmed
adb install -r "$apk"
adb shell am start -W -n com.famzz.angrycats/.MainActivity
# Wait for WebView to expose the locally loaded menu to accessibility.
for attempt in $(seq 1 30); do
  if adb shell uiautomator dump /sdcard/angry-cats-window.xml >/dev/null &&
     adb pull /sdcard/angry-cats-window.xml "$out/home.xml" >/dev/null &&
     grep -Eiq 'Play|Levels|Slingshot game' "$out/home.xml"; then break; fi
  if test -f "$out/home.xml" && grep -q 'immersive_cling_title' "$out/home.xml"; then
    python3 - "$out/home.xml" <<'PY'
import re, subprocess, sys, xml.etree.ElementTree as ET
for node in ET.parse(sys.argv[1]).iter('node'):
    if node.get('resource-id') == 'android:id/ok':
        x1,y1,x2,y2 = map(int,re.findall(r'\d+',node.get('bounds')))
        subprocess.run(['adb','shell','input','tap',str((x1+x2)//2),str((y1+y2)//2)],check=True)
PY
  fi
  sleep 1
done
grep -Eiq 'Play|Levels|Slingshot game' "$out/home.xml"
adb shell pidof com.famzz.angrycats
adb exec-out screencap -p > "$out/home.png"
adb shell input keyevent KEYCODE_HOME
adb shell am start -W -n com.famzz.angrycats/.MainActivity
for attempt in $(seq 1 15); do
  if adb shell uiautomator dump /sdcard/angry-cats-window.xml >/dev/null &&
     adb pull /sdcard/angry-cats-window.xml "$out/resumed.xml" >/dev/null &&
     grep -Eiq 'Play|Levels|Slingshot game' "$out/resumed.xml"; then break; fi
  sleep 1
done
grep -Eiq 'Play|Levels|Slingshot game' "$out/resumed.xml"
adb exec-out screencap -p > "$out/resumed.png"
adb logcat -d > "$out/logcat.txt"
if grep -Eq 'AndroidRuntime.*Process: com.famzz.angrycats|Cmdline: com.famzz.angrycats' "$out/logcat.txt"; then
  echo 'Native crash detected; inspect logcat artifact'
  exit 1
fi
echo 'PASS: APK installed, local WebView menu rendered, process alive and home/resume succeeded'
