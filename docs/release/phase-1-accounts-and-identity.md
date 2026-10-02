# Phase 1 — accounts and app identity

Checked against the linked official pages on 2026-10-02. Fees and console flows can change; the price shown during enrollment is authoritative.

## Assumptions

- // ASSUMPTION: The App Store seller should be the person or legal entity that owns the app. Choose the developer-account type to match that seller before enrolling.
- // ASSUMPTION: The identifiers already present in the source Expo manifest are intended to remain the app's identifiers: `com.fonsiflow.scheduler` for both platforms, `fonsi-scheduler` as the Expo slug, and `fonsi` as the URL scheme.
- The identifiers below are provisional until a human verifies account ownership and any existing store records. No store listing or production build should be created until that manual check is complete.

## Accounts, fees, verification, and timing

| Account                 | Current fee                                                                                                                      | Verification and identity                                                                                                                                                                                                                                                                                                                            | Typical timing                                                                                                                                                                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Apple Developer Program | **US$99/year**, converted to local currency where available; taxes may apply.                                                    | Apple Account with two-factor authentication and legal-age eligibility. An individual uses their exact legal name, which appears as the App Store seller; Apple can request government ID. An organization must be a legal entity, provide its D‑U‑N‑S Number, and pass an authority-to-bind check. Apple may request supporting business documents. | Apple says to contact Developer Support if membership confirmation has not arrived within 24 hours after payment. That is not an organization-verification SLA. // VERIFY: Apple publishes no fixed approval time for the organization review; plan for several business days or longer. |
| Google Play Console     | **US$25 one time**; accepted payment methods and local availability vary.                                                        | Choose Personal or Organization and complete the identity/contact checks shown in Play Console. Google may request government ID and a payment card in the developer's legal name. Organization details must match the legal entity. New personal accounts may also need to verify access to an Android device in the Play Console app.              | // VERIFY: Google's account setup page does not promise a fixed verification SLA. Allow several days or longer and follow the live status in Play Console.                                                                                                                               |
| Expo account / EAS      | Expo and the Expo SDK are free. EAS currently has a **$0 Free plan** with 15 Android and 15 iOS builds; paid plans are optional. | Create an Expo account and verify its email. Choose the individual or organization account that will own the project. The Expo account's `owner` field is intentionally not set in app config until that choice is made.                                                                                                                             | Self-service account creation; Expo publishes no account-approval SLA. // VERIFY: allow time for email verification and organization setup.                                                                                                                                              |
| Sentry                  | A **$0 Developer plan** is currently advertised; paid usage tiers are optional.                                                  | Create a Sentry account, verify its email, create an organization, and later create a React Native project. Restrict organization membership to the people who need production event access.                                                                                                                                                         | Self-service signup; no account-review SLA is published. // VERIFY: allow time for email verification and project setup.                                                                                                                                                                 |

Apple and Google prices are before any applicable local taxes or currency conversion. Recheck all fees immediately before payment.

### Personal versus organization enrollment

- **Apple individual:** for an individual or sole proprietor/single-person business. The individual's legal name is the public seller name. An Apple Account with two-factor authentication is required.
- **Apple organization:** for a recognized legal entity (for example, a company or nonprofit) that should appear as the seller. Apple checks the entity's D‑U‑N‑S record and the enrollee's authority to bind it; an employee may need to provide a confirming reference. Apple says a sole proprietor/single-person business must enroll as an individual to show their legal name as seller.
- **Google personal:** represents an individual. Google requires identity verification and, for newly created personal accounts, device verification may be required. Personal accounts created after November 13, 2023 must complete a closed test with at least 12 opted-in testers continuously for 14 days before applying for production access.
- **Google organization:** represents an organization rather than an individual and uses the organization's legal identity and verification details. Google says both account types can access the same Play Console functionality; the account type changes whose identity is represented publicly and which verification evidence is collected.

**MANUAL STEP — choose the seller identity before paying.** Use an organization account only if the named legal entity exists and can complete the relevant verification. Do not enroll as an individual expecting to show a company name later. Apple's enrollment page says an individual-to-organization conversion requires contacting Apple.

## Permanent identifiers

| Field                  | Value carried forward from the source app | Purpose                                                                  |
| ---------------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| App display name       | `Fonsi Scheduler`                         | Name shown on the device and in store listings.                          |
| Expo slug              | `fonsi-scheduler`                         | Project URL-friendly identifier within Expo.                             |
| URL scheme             | `fonsi`                                   | App deep-link scheme.                                                    |
| iOS bundle identifier  | `com.fonsiflow.scheduler`                 | iOS application identity and App ID.                                     |
| Android application ID | `com.fonsiflow.scheduler`                 | Android package identity on Google Play.                                 |
| Marketing version      | `1.0.0`                                   | User-visible app version; build numbers are configured in a later phase. |

Android package names are unique and permanent in Google Play; Google states that package names cannot be deleted or reused. The Apple bundle identifier is the explicit App ID used by the app's provisioning and App Store record. Changing either identifier after distribution would identify a different app rather than update the existing installation. Keep the Android package and iOS bundle ID synchronized unless the store records already say otherwise.

**MANUAL STEP — verify before first build or store record creation:**

1. Sign in to the intended Apple Developer team and Play Console account. Search for existing app records and confirm whether either platform has already published or reserved an identifier for Fonsi Scheduler.
2. If an app already exists, use the exact identifier attached to that listing. Do not create a second listing or change a published identifier.
3. If no listing exists, confirm that `com.fonsiflow.scheduler` is available and controlled by the intended publisher on both stores. Only then treat the values in `app.config.ts` as final.
4. Confirm that the seller name displayed by each store matches the intended legal publisher.

## Create the accounts

### Apple Developer Program

1. Create or select the Apple Account that the publisher will retain. Enable two-factor authentication and use an account controlled by the person or organization, not a contractor.
2. Open [Apple Developer Program enrollment](https://developer.apple.com/programs/enroll/) and choose **Enroll**.
3. Select **Individual** or **Organization** based on the seller identity above. For an organization, have the legal entity name, D‑U‑N‑S Number, and a person authorized to accept Apple's legal agreements ready.
4. Complete identity verification and accept the Apple Developer Program License Agreement.
5. Pay the annual membership fee after Apple presents the region-specific amount. Save the Enrollment ID and confirmation email in the publisher's internal records, not in this repository.
6. For organization enrollment, wait for Apple's verification email before continuing to payment if prompted.

### Google Play Console

1. Use the Google Account controlled by the publisher and open [Play Console signup](https://play.google.com/console/signup).
2. Select the correct account type, enter legal contact details, and complete identity verification. Keep the spelling and address consistent with official identity or organization records.
3. For an organization account, have the legal entity's registration and verification details available; follow Play Console's current organization verification flow.
4. Complete any requested government-ID, payment-card, contact, or Play Console mobile-app device verification.
5. Pay the one-time registration fee and retain the confirmation and account-owner details securely.
6. If this is a new personal developer account, schedule the required closed test before planning production access: 12 testers opted in continuously for at least 14 days, followed by the production-access application.

### Expo and Sentry

1. Create the publisher-controlled Expo account at [expo.dev/signup](https://expo.dev/signup), verify its email, and enable two-factor authentication where available.
2. Use an Expo organization for team-owned publishing; invite teammates with only the access they need. Keep the Expo account name ready for the `owner` field in a later configuration phase.
3. Start with the EAS Free plan unless build queue, concurrency, or usage needs justify a paid plan. Check [current EAS pricing](https://expo.dev/pricing) before upgrading.
4. Create a Sentry account at [sentry.io/signup](https://sentry.io/signup), verify the email, and create an organization owned by the publisher. Sentry project/DSN integration is a later release phase.
5. Store account recovery codes and credential backups in the publisher's password manager. Never add account passwords, signing credentials, API tokens, or Sentry secrets to Git.

## Permission scope in app config

The existing app requests notification permission when the user enables task notifications in Settings. This phase declares only Android notification permission and exact-alarm access used by scheduled reminders. `expo-notifications` also adds `RECEIVE_BOOT_COMPLETED` for restoring scheduled notifications after reboot. The app does not use camera, microphone, contacts, location, or photo-library permissions.

Expo's Notifications documentation says no iOS usage-description string is required for notification permissions. No unused iOS `NS*UsageDescription` entries are added. The actual OS prompt remains contextual in the existing app flow; this phase does not add or change UI.

// VERIFY: Before a production Android submission, review current Play policy and device behavior for `SCHEDULE_EXACT_ALARM`; exact alarm access is declared only because the current frontend schedules time-specific task reminders.

## Official sources

- [Apple Developer Program enrollment, requirements, fees, and confirmation](https://developer.apple.com/help/account/membership/program-enrollment/)
- [Google Play developer account registration and fee](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en)
- [Google Play personal and organization account types](https://support.google.com/googleplay/android-developer/answer/13634885?hl=en)
- [Google Play package-name permanence](https://support.google.com/googleplay/android-developer/answer/9859152?hl=en)
- [Google Play personal-account closed-testing requirement](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- [Expo app configuration reference](https://docs.expo.dev/versions/v52.0.0/config/app/)
- [Expo Notifications permissions](https://docs.expo.dev/versions/v52.0.0/sdk/notifications/)
- [Expo EAS pricing](https://expo.dev/pricing)
- [Sentry pricing](https://sentry.io/pricing/)
