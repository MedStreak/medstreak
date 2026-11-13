# Releasing MedStreak on Android (free, no stores, no Expo account)

GitHub builds the APK for you in the cloud. You only need a free GitHub account.

## One-time setup
1. Create a free GitHub account, then a **new public repository** named `medstreak` (public repos get free build minutes).
2. Upload this project to it (GitHub web: "uploading an existing file" and drag the unzipped folder contents, including the hidden `.github` folder; or use GitHub Desktop).
3. Repo -> Settings -> Secrets and variables -> Actions -> **New repository secret**, four times, with the values in `SECRETS.txt` (sent separately, never put that file in the repo):
   - `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`
4. Back up `medstreak-release.jks` and `SECRETS.txt` somewhere safe (cloud drive + USB). If you lose them you can never ship an update that installs over the old app.

## Each release
1. Bump `version` in `app.json` (e.g. 1.0.1).
2. Repo -> Releases -> **Draft a new release** -> create a new tag `v1.0.0` (must start with `v`) -> Publish.
   (Or Actions tab -> "Build Android APK" -> Run workflow to just get a file.)
3. Wait about 10-20 minutes. The workflow attaches `MedStreak-v1.0.0.apk` to that release.
4. Share the release page link. 

## What testers do
Open the link on their Android phone, download the APK, tap it, allow "Install unknown apps" for their browser when asked, then install. Play Protect may warn that the app is unknown; "Install anyway" is expected for apps outside the Play Store.

## Already done for you
- Android app `com.nesrynastrarose.medstreak` registered in Firebase with this key's SHA-1 (`A2:83:0F:54:20:03:05:70:E3:B7:EA:19:7A:D9:84:C3:6F:97:73:8C`) so Google sign-in is wired up.
- Firestore security rules published.

## Check before sharing widely
- Google Cloud Console -> APIs & Services -> OAuth consent screen / Audience: if it says **Testing**, only listed test users can sign in. Switch it to **In production** (email/profile scopes need no review).
- Install the first APK on your own phone and test: reminders, Taken/Snooze, chat sign-in, report flow.
- Tell Android users to set MedStreak's battery usage to "Unrestricted" so reminders always fire.

## Testing on your own phone
**Android (best, tests everything incl. reminders and chat sign-in):** after the first build finishes, open the repo's Releases page on your phone, download `MedStreak-v1.0.0.apk`, tap it, allow "Install unknown apps" when asked. For a build without publishing a release: repo -> Actions -> "Build Android APK" -> Run workflow, then download the `MedStreak-apk` artifact from the finished run (needs GitHub login; it arrives as a zip containing the apk).

**Quick preview, Android or iPhone (needs a computer with Node 20):**
1. Install the free **Expo Go** app on the phone.
2. On the computer: `npm install --legacy-peer-deps` then `npx expo start`.
3. Scan the QR code with Expo Go (Android) or the Camera app (iPhone). Phone and computer must be on the same Wi-Fi.
Limits in Expo Go: Google sign-in (so chat) does not work, and notification behaviour differs. Use the APK for full testing.
