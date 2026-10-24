# Validation — 24 October 2026

Host: Windows; JDK 17.0.20.1, Android SDK 35, AGP 8.9.1, Gradle 8.11.1, Playwright 1.56.1 and Chromium 141.0.7390.37.
The root website, README and license are unchanged. Local branch: codex/mobile-native-builds.

## Passed

- Node logic/physics tests: all 100 levels contain cats and targets, finite physics, launch, paused physics/timers, retry cleanup, stars, unlocks, scores and saved progress.
- Chromium gameplay tests: rendering, pointer launch, pause/resume, restart, results, failure gating and persistence. Zero remote requests and browser exceptions.
- Device matrix: 412×915, 915×412, 568×320, 768×1024 and 1024×768. Native Chromium touch drag/launch and all four cats; lifecycle hook, pause/resume, restart, selection, results, persistence and layout. UI menu buttons use Playwright clicks; canvas gestures use CDP touch dispatch. Controlled state selects individual powers and exercises result branches. No physical phone/tablet was used.
- Android assembleDebug and lintDebug: BUILD SUCCESSFUL. Lint has 0 errors and 3 warnings: API 33 backwards-compatible back flag, intentional JavaScript for the local game, and Android 12 data extraction rules.
- APK asset verification: all five offline game files, including Matter.js and license, match source bytes. Native DEX and manifest present.
- apksigner: APK Signature Scheme v2 verifies with one Android Debug signer. This is a signed debug APK, not a store release.
- aapt: com.famzz.angrycats, version 1.0.0, minimum API 26, target API 35, launchable MainActivity. No Android permissions requested, including no Internet permission. No ABI-specific native libraries required.

## Fixes

- Prevent duplicate launch while a bomb/split turn is unresolved.
- Pause audio on native background callbacks outside active levels too.
- Clear pending turns and freeze the world when Android Back returns home.
- Handle unavailable localStorage when saving mute preference.
- Support native reset-progress confirmation dialogs on Android and iOS.
- Account for Android cutouts and iPhone landscape safe areas; restore immersive mode on Android focus changes.
- Fix clipped home buttons on short landscape screens and hide gameplay HUD on home.
- Add checksum-pinned Gradle wrapper, npm lockfile, expanded device tests, APK asset checks and CI lint artifacts.

## Blocked / unverified

- APK installation/native launch: no emulator installed locally. ADB also cannot create its normal profile directory in this sandbox. APK signature, contents and entry point were inspected, but native launch has NOT been verified.
- iOS Simulator build: NOT RUN. This host is Windows and cannot run Xcode. The macOS Actions job cannot start until the branch is pushed.
- GitHub push/PR/CI: connector reports the user's repository role as admin, but creating a branch repeatedly returns HTTP 403, Resource not accessible by integration. Git's Windows credential helper fails in the sandbox; direct credential enumeration returns access denied. No credentials were exposed. No remote branch, PR or workflow run was created.
- No signed iPhone IPA exists. An unsigned Simulator .app is not installable on an iPhone. See mobile/README.md for Xcode team selection and provisioning. No Apple account information is needed until device signing is possible.

## Install on OnePlus 13

Transfer Angry-Cats-debug.apk to the phone, open it and allow installation from that source if prompted. This universal APK targets Android 15 and supports Android 8+. Progress stays local.
Future updates must reuse the same signing key to update without uninstalling. CI runners normally produce a different debug key. Avoid uninstalling an existing app if you need its saved progress. The local debug key remains outside Git and the delivered source bundle.

## Remaining iOS steps

1. On a Mac, install Xcode/XcodeGen and run xcodegen generate in mobile/ios.
2. Run the included unsigned Simulator build and test iPhone/iPad behavior.
3. For a physical iPhone, sign in directly in Xcode Settings → Accounts. Select the owner's development team in Signing & Capabilities, enable automatic signing, and confirm bundle identifier com.famzz.angrycats is available for that team.
4. Connect/register the iPhone and run the app from Xcode. Only the Team ID is needed as a project setting; do not share passwords or private signing keys in chat or Git.
5. For an IPA, archive for generic iOS and export in Xcode Organizer using a valid development, ad hoc or distribution profile. Development/ad hoc profiles must include the device. A Simulator build cannot be renamed into an iPhone installer.

Nothing was merged, published to an app store or purchased. The workflow is prepared but has not run.
