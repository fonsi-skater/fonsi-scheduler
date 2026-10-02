# Phases 2–5 — Release readiness

Last checked against official documentation: 2026-10-02. This guide is release preparation, not evidence that an account, backend, or store listing has been configured. Replace each manual value with verified publisher data before building or submitting.

## Phase 2 — Environments and EAS

`eas.json` defines development, preview, and production profiles. The development profile is a development client using demo data; preview and production builds disable the mock adapter. Preview creates an internally distributed Android APK, while production creates a store Android App Bundle and a store iOS archive. Production build numbers use EAS remote versioning and auto-increment. The user-facing version remains `1.0.0` until the publisher deliberately changes `version` in `app.config.ts`.

The app config uses the `fingerprint` runtime-version policy. It separates updates by native compatibility: a change that alters the native fingerprint requires a new binary. `expo-updates` is not installed in this repository, and the Expo project has not been initialized here; OTA delivery is therefore **not enabled** by this config alone.

### Manual EAS setup

1. Create or select the publisher-controlled Expo account and project. From the repository root, run `npx eas-cli@latest init` and link the project. Do not change the bundle ID or Android package unless the publisher has verified that they are unclaimed and approved a different permanent identity.
2. Create the `development`, `preview`, and `production` EAS environments. Set `EXPO_PUBLIC_API_URL` in each to the verified API endpoint for that environment. This URL is compiled into the client and is public; do not put a credential in it.
3. Set `EXPO_PUBLIC_USE_MOCK=true` in `development`, and `false` in `preview` and `production`. The build profiles also explicitly set this flag for predictable behavior.
4. Example command for a verified preview URL (replace the value; never use this example URL as a real endpoint):

   ```sh
   npx eas-cli@latest env:set --name EXPO_PUBLIC_API_URL --value https://<verified-staging-api-host> --environment preview --visibility plaintext
   ```

   Repeat for `development` and `production` with the approved endpoints. Expo documents plaintext/sensitive visibility for values embedded in client code; client-side values are not secrets.

5. Before using the `development` profile, add `expo-dev-client` using the Expo SDK-compatible installer and commit the dependency change in a separately approved app/dependency change. It is not in this repo's current dependency manifest and was not added because the release brief restricts the allowed file scope.
6. After linking the EAS project, install `expo-updates` at the SDK-compatible version and run `npx eas-cli@latest update:configure`. This requires an app dependency/native configuration change outside the present release-only scope. Confirm that EAS preserves the `fingerprint` runtime policy and the `preview` and `production` channels.
7. Remote build numbers are initialized from the current native versions when the first EAS build runs. If the app has already shipped, use `eas build:version:set` for each platform and initialize with the latest store build number before enabling automatic increments.

**Version policy:** use semantic `version` in `app.config.ts` for each store release (major for incompatible product changes, minor for compatible user-visible capability, patch for compatible fixes). EAS remote versioning owns Android `versionCode` and iOS `buildNumber`; do not manually reuse them. The fingerprint runtime policy is recalculated from the native project, and OTA updates are only appropriate when a compatible `expo-updates`-enabled binary exists.

**Important store target:** the currently checked Google Play policy requires new apps and updates to target Android 16 / API 36 from August 31, 2026. The repository is on Expo SDK 52. Do not assume its generated Android target meets this requirement; upgrade to an Expo SDK that supports the required target and verify the built manifest before a Play submission. This dependency/native upgrade is outside the current release-only file scope.

## Phase 3 — Signing, credentials, and push

### Android signing

- Use EAS-managed Android credentials. EAS creates/manages an **upload key** used to sign the bundle uploaded by the publisher. With Play App Signing enabled, Google protects and uses the separate **app signing key** to sign APKs delivered to users. Losing the upload key can be recovered by rotating the upload key through Play Console; losing/control of the app signing key is a more serious app-identity risk.
- On the first authorized Android build, choose EAS-managed credentials and Play App Signing. Verify the app-signing enrollment in Play Console before a public release.
- Inspect or manage credentials with `npx eas-cli@latest credentials --platform android`. Back up credentials only into the publisher's encrypted credential vault with a named custodian and recovery procedure; never put keystores or passwords in Git, issues, or CI logs.

### iOS signing

- Use EAS-managed Apple Distribution credentials and provisioning profiles. A distribution certificate identifies the signing publisher; a provisioning profile binds the app ID, certificate, and permitted capabilities/devices.
- On the first authorized build, sign in to the correct Apple Developer team and let EAS manage distribution credentials. Inspect them with `npx eas-cli@latest credentials --platform ios`.
- Record the Apple team owner, credential custodian, renewal owner, and recovery procedure in the organization's password manager. Do not export certificates or private keys into this repository. Expiration or revocation requires renewal and a new signed build; verify current status in EAS and Apple Developer before release.

### Push credentials and on-device verification

1. In the publisher's Firebase project, enable Firebase Cloud Messaging V1 and create a service-account key with only the required FCM permissions. Upload it in the EAS project credentials UI for Android. Store the downloaded JSON only in the approved secret vault, then securely remove temporary copies.
2. In the Apple Developer account, enable Push Notifications for the final App ID. Create or let EAS create an APNs authentication key, then associate it with the correct Apple team and EAS project. APNs keys can authorize push delivery for multiple apps in the team, so restrict access and record ownership.
3. Configure credentials using the EAS dashboard or `npx eas-cli@latest credentials --platform android` and `npx eas-cli@latest credentials --platform ios`. Never commit FCM service-account JSON, APNs private keys, or Apple signing credentials.
4. **Blocked in the current client:** `src/features/tasks/notifications.ts` schedules local notifications only; it does not obtain/register an Expo push token with the service. Do not claim remote push is integrated or tested. After an authorized app/backend change adds token registration and a production push path, produce a preview **native build**, install it on a physical Android device and physical iPhone, opt in to notifications from Settings, and obtain each platform's Expo push token. Send a test using [Expo's push notification tool](https://expo.dev/notifications); confirm foreground/background delivery and tap behavior. A web preview or Expo Go is not proof that store-build push credentials work.
5. Keep each credential in its originating provider/EAS credential store, grant access only to the release owner and named backup, rotate/revoke credentials when ownership changes, and document recovery without copying secrets into this repository.

## Phase 4 — Observability and updates

Neither `@sentry/react-native` nor `expo-updates` is installed, and this release-only change cannot safely initialize SDKs or alter the app entry point. Sentry and OTA delivery are **blocked**, not claimed as integrated.

After the publisher authorizes the necessary dependency and app-instrumentation changes:

1. Create a Sentry React Native project and store its DSN as a public client setting and its `SENTRY_AUTH_TOKEN` as a sensitive EAS environment variable. Initialize the SDK early in the app lifecycle, configure Expo's Sentry Metro/config integration, and verify an intentional test event from a preview build. Never expose the auth token in app code; do not send real user/task contents as telemetry.
2. Install `expo-updates` with `npx expo install expo-updates` after linking the EAS project, configure updates, and build/install a new preview binary. Set the preview/production channels through the profiles in `eas.json`. Publish a preview update first, test on that matching runtime, then use a reviewed and explicitly approved production update.
3. OTA is only for JavaScript/assets compatible with the installed native binary. Native dependency, permission, SDK, entitlement, or runtime changes need new store builds.
4. Roll back a bad update through the EAS Update dashboard or CLI rollback operation for the affected channel/branch, then verify the prior known-good update on a device. Keep store-build rollback instructions separate: halt a staged rollout in the store console and submit a fixed build if native code is affected.
5. Configure Sentry alerts for release crashes and monitor update-specific crash/error rate before widening an OTA rollout.

## Phase 5 — Store assets, copy, and privacy

### Assets currently in the repo

| Asset                            | Current file                                   | Current dimensions | Readiness                                                                                                                                                                                |
| -------------------------------- | ---------------------------------------------- | -----------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Expo app icon                    | `assets/images/icon.png`                       |          1024×1024 | Existing app artwork; verify crop, transparency, and store-specific icon requirements in each console.                                                                                   |
| Android adaptive icon foreground | `assets/images/adaptive-icon.png`              |          1024×1024 | Existing config asset; inspect on device against light/dark launcher backgrounds.                                                                                                        |
| Splash artwork                   | `assets/images/splash.png`                     |            512×512 | Existing app artwork; verify in the native preview build.                                                                                                                                |
| Google Play store icon           | `assets/store/google-play-icon.png`            |            512×512 | Resized from the existing app icon; 32-bit PNG, RGB artwork, under 1 MB. Verify appearance and current Play Console requirements before upload.                                          |
| Google Play feature graphic      | `assets/store/google-play-feature-graphic.jpg` |           1024×500 | Draft marketing artwork, JPEG/RGB without alpha. Alt text: “Fonsi Scheduler daily plan with task times, categories, and an add-task action.” Review against the final app before upload. |
| Store screenshots                | —                                              |                  — | Not present; capture real screens from native preview builds in both light and dark themes.                                                                                              |

Google Play currently requires its feature graphic to be JPEG or 24-bit PNG without alpha at 1024×500. The store icon must be 512×512 32-bit PNG, sRGB, and no larger than 1 MB; Play applies its own masking and shadow. Phone screenshots must be JPEG or 24-bit PNG, at least 320px and at most 3840px on either dimension, with the longest dimension no more than twice the shortest; current listing guidance requests at least two screenshots. Use 9:16 portrait captures where possible, keep them true to the shipped app, and add concise alt text in Play Console. Tablet assets are not needed unless tablet distribution is declared; if declaring a large-screen experience, follow the current console's device-specific screenshot minimums.

Apple's current screenshot reference lists the supported display-size pixel dimensions, which vary by device and status-bar treatment; select the exact device slots in App Store Connect and capture those native simulator/device resolutions. Do not upsample the 390×844 web preview into a purported store screenshot. Capture a consistent light-mode set and a dark-mode set on actual iOS/Android builds; submit the required formats and exact sizes shown for the selected device slots in each console.

**Screenshot plan:** capture Today with tasks, Schedule view, create/edit task, search/filter, reminder settings, and About. Use only synthetic tasks and no personal data. Capture separate light and dark sets, keep text legible and status bars unobstructed, and review each image at store listing size. Do not claim server sync, sign-in, or account deletion until those flows are present and verified.

### Listing copy draft

- **Name:** Fonsi Scheduler
- **iOS subtitle draft:** Plan your day with focus
- **Google Play short description draft:** Plan daily tasks, shape your schedule, and set reminders that fit your day.
- **Full description draft:**
  Plan a calmer day with Fonsi Scheduler. Keep your tasks in one place, see what is coming up, and make room for focused work. Add tasks with dates, times, priorities, and categories, then review them in a daily list or schedule. Set optional reminders when you need a nudge, and choose a light, dark, or system appearance. Fonsi Scheduler is designed to make everyday planning clear and flexible, without adding unnecessary complexity.
  Reminder delivery depends on device notification permissions and the configured service. Feature availability and data handling must be checked against the release build before publication.
- **iOS keywords draft:** planner, daily tasks, schedule, reminders, focus, to do
- **Promotional text draft:** Make space for what matters with a clearer view of your day.
- **Category draft:** Productivity
- **What's New draft (initial release):** Plan your day with tasks, schedule views, priorities, categories, and optional reminders.

These are honest drafts, not approved final store metadata. Verify each current character limit and localization in App Store Connect/Play Console immediately before entry. Add the real support email, support URL, and public marketing URL only after the publisher provides and verifies them.

### Privacy policy publication

The accompanying `privacy-policy-draft.md` is not a public, approved privacy policy. The brief mentions email, tasks, push tokens/device information, and crash data, but this repository does not contain the deployed backend or Sentry integration needed to verify collection, sharing, retention, deletion, or subprocessors. The publisher and counsel must reconcile it with production behavior, fill verified contact/retention details, host it at a stable public HTTPS URL, link it in the app and store consoles, and keep it updated when data practices change.

## Phase 6 gate — stop before store submission

The repository has no in-app account deletion screen/action or deletion request API call. The supplied release brief says account creation is supported by the deployed service; if users can create accounts, this is a **release blocker**:

- Add an in-app account deletion request path that is easy to find, obtains the required confirmation, explains any retention exceptions, revokes credentials, and deletes the account and associated data through the real service.
- Provide a public web deletion request URL that names Fonsi Scheduler and lets users submit a deletion request without reinstalling the app; verify it loads and works before listing submission.
- Test complete deletion across primary records, tasks, refresh tokens, device/push tokens, backups/retention policy, and any Sentry/user-identifying data. Ensure support can trace and complete requests.
- Update the privacy policy and answer Play Data safety deletion questions and Apple App Privacy/App Review disclosures from verified production behavior.
- Re-run this phase gate only after the app/backend change and the public request URL are independently verified.

**STOP:** do not create production builds or submit store listings until the publisher resolves this gate and verifies account-creation behavior. No account-deletion feature was added because the supplied release brief explicitly says to stop rather than build it.

## Official references checked 2026-10-02

- [Expo app version management](https://docs.expo.dev/build-reference/app-versions/)
- [Expo `eas.json` reference](https://docs.expo.dev/eas/json/)
- [EAS environment variables](https://docs.expo.dev/eas/environment-variables/)
- [EAS Update setup](https://docs.expo.dev/eas-update/getting-started/)
- [Runtime version policies](https://docs.expo.dev/eas-update/runtime-versions/)
- [EAS Submit overview](https://docs.expo.dev/deploy/submit-to-app-stores/)
- [EAS Submit profile reference](https://docs.expo.dev/submit/eas-json/)
- [Expo push setup and test](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Expo Sentry integration](https://docs.expo.dev/guides/using-sentry/)
- [Google Play target API requirements](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en)
- [Google Play preview assets and screenshots](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en)
- [Google Play icon design specifications](https://developer.android.com/distribute/google-play/resources/icon-design-specifications)
- [Google Play account deletion policy](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en)
- [Google Play app content and privacy policy](https://support.google.com/googleplay/android-developer/answer/9859455?hl=en)
- [Apple screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications/)
- [Apple account deletion guideline](https://developer.apple.com/app-store/review/guidelines/#privacy)
- [Apple App Privacy details](https://developer.apple.com/app-store/app-privacy-details/)
- [Apple privacy manifest files](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files)
