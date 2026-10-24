#!/usr/bin/env bash
set -euo pipefail
apk="${1:?APK path required}"
out=mobile/test-results/android
mkdir -p "$out"
adb logcat -c
adb install -r "$apk"
adb shell am start -W -n com.famzz.angrycats/.MainActivity
# Wait for WebView to expose the locally loaded menu to accessibility.
for attempt in $(seq 1 30); do
  adb shell uiautomator dump /sdcard/angry-cats-window.xml >/dev/null
  adb pull /sdcard/angry-cats-window.xml "$out/home.xml" >/dev/null
  if grep -Eiq 'Play|Levels|Slingshot game' "$out/home.xml"; then break; fi
  sleep 1
done
grep -Eiq 'Play|Levels|Slingshot game' "$out/home.xml"
adb shell pidof com.famzz.angrycats
adb exec-out screencap -p > "$out/home.png"
adb shell input keyevent KEYCODE_HOME
adb shell am start -W -n com.famzz.angrycats/.MainActivity
adb shell uiautomator dump /sdcard/angry-cats-window.xml >/dev/null
adb pull /sdcard/angry-cats-window.xml "$out/resumed.xml" >/dev/null
grep -Eiq 'Play|Levels|Slingshot game' "$out/resumed.xml"
adb exec-out screencap -p > "$out/resumed.png"
adb logcat -d > "$out/logcat.txt"
if grep -Eq 'FATAL EXCEPTION|Fatal signal' "$out/logcat.txt"; then
  echo 'Native crash detected; inspect logcat artifact'
  exit 1
fi
echo 'PASS: APK installed, local WebView menu rendered, process alive and home/resume succeeded'
