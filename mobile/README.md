# Angry Cats — Android & iOS

A mobile edition of Fahmi Ahmed Ghazal's Angry Cats. The original root `index.html` stays intact. The mobile app shares an offline HTML/Canvas game and Matter.js 0.19.0 physics, hosted by a small native Android Activity and SwiftUI/WKWebView app. No paid services, accounts, ads, analytics, or remote game resources.

## Included

- Sunset garden home screen with original vector cat artwork.
- 100 progressive physics levels, star ratings, unlocks and local best scores.
- Four cats: direct hitter, ninja dash, bomb blast and triple split.
- Drag/release aiming, trajectory preview, pinch zoom, camera follow and camera controls.
- Pause/resume for physics and pending turn callbacks; backgrounding opens pause.
- Offline generated sound and music; mute preference is saved.
- Android adaptive layout/back handling and iPhone/iPad safe areas.

The art is a new implementation inspired by the supplied screenshots; it is not a pixel-perfect reproduction. The existing game uses mice as targets. Saves are local to each installation, not synced between devices.

## Android APK

GitHub Actions → **Angry Cats mobile builds** → successful run → **Angry-Cats-Android-APK**. Unzip the artifact and install `app-debug.apk` on Android 8 or newer. This is a development APK signed with the CI debug key, not a store release. A new runner may produce a different key, requiring uninstall before updating (which removes saved progress).

Local requirements: Android Studio / SDK 35, JDK 17 and Gradle 8.11.1. Open `mobile/android` in Android Studio, or run:

```sh
cd mobile/android
./gradlew :app:assembleDebug :app:lintDebug
```

For Google Play, configure your own release keystore and generate a signed AAB in Android Studio. Keep signing secrets out of git. The default application ID is `com.famzz.angrycats`; confirm ownership/availability before publishing.

## iPhone / iPad

The workflow creates an **iOS Simulator `.app`**, which cannot be installed on an iPhone.

On a Mac with Xcode and XcodeGen:

```sh
cd mobile/ios
xcodegen generate
open AngryCats.xcodeproj
```

In Xcode select the AngryCats target → Signing & Capabilities → your Apple development team, choose your connected iPhone, then Run. Free personal-team development signing may be used subject to Apple's limits. TestFlight and App Store distribution require the appropriate Apple Developer membership, signing and store setup. No signed IPA or store submission is included.

App icons are checked in. To regenerate, run `python3 mobile/scripts/make_icons.py` with Pillow installed.

## Preview and verification

```sh
cd mobile
python3 -m http.server 4173 --directory www
# In another terminal:
npm ci
npx playwright install chromium
npm test
```

Tests verify launch input, pausing physics and timers, retry timer cleanup, level generation, score persistence, unlocks, failure gating and local-only assets. They also capture portrait/landscape screenshots. Native WebView builds and real-device play still need testing; browser checks alone do not prove device compatibility.

The device matrix covers 412×915, 915×412, 568×320, 768×1024 and 1024×768.
Canvas dragging and abilities use Chromium's native touch dispatch. Menu actions use
Playwright clicks, independently of the touch gesture stream. Scoring and individual
ability setups use controlled state so every branch is exercised without solving 100
levels manually. These checks do not replace a physical Android/iPhone playthrough.

## Device signing on a Mac

No Apple credentials are required for the unsigned Simulator build. For a physical
iPhone, sign in through Xcode Settings → Accounts, connect the device, select your
Apple Development Team under Signing & Capabilities, and enable automatic signing.
The only project setting needed from the owner is the development Team ID. Keep
certificates, private keys, passwords, and provisioning secrets out of the repository
and chat. Confirm that `com.famzz.angrycats` is available for that team.

An archive can then be created on the Mac using:

```sh
xcodebuild -project AngryCats.xcodeproj -scheme AngryCats \
  -configuration Release -destination 'generic/platform=iOS' \
  -archivePath build/AngryCats.xcarchive DEVELOPMENT_TEAM=YOUR_TEAM_ID \
  CODE_SIGN_STYLE=Automatic -allowProvisioningUpdates archive
```

For an IPA, export the archive in Xcode Organizer using an eligible development,
ad hoc or distribution profile. Development/ad hoc installation must include the
device in the provisioning profile. A Simulator `.app` is a different build and
cannot be converted into an iPhone installer by renaming or zipping it.

## Source and licenses

Original game: https://github.com/Famz88/angry-cats, base commit `b74e6726a85650835de5db4696815ce0ff13e5c2`.
The existing MIT license applies. Matter.js is bundled with its MIT notice in `www/vendor/matter.min.js`. See `THIRD_PARTY_NOTICES.md`.
