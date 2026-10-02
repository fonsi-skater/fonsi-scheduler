# Fonsi Scheduler privacy policy — draft for publisher review

**Status:** Not approved or ready to publish. This draft must be verified against the production mobile app, deployed API, push provider, crash-reporting configuration, and actual retention practices. Do not submit this draft to either store until all bracketed fields are resolved and the policy is reviewed by the publisher and, where appropriate, legal counsel.

- **Publisher:** [VERIFY: legal publisher name]
- **Effective date:** [VERIFY: publication date]
- **Privacy contact:** [VERIFY: monitored privacy/support email]
- **Public policy URL:** [MANUAL STEP: publish this document on a stable HTTPS URL]
- **Deletion request URL:** [BLOCKED: provide a working account/data deletion request page after the deletion flow is implemented]

## Information this app may process

Fonsi Scheduler is a task-planning app. Based on the release requirements, the service may process:

- **Account information:** email address and account identifiers used to authenticate an account. [VERIFY against the deployed service.]
- **Tasks and preferences:** task titles, descriptions, dates, times, priorities, categories, completion state, reminder settings, and appearance/notification preferences. [VERIFY which fields leave the device and how long they are retained.]
- **Push notification information:** an Expo push token and associated device/platform details needed to deliver reminders. [VERIFY exact device metadata and whether tokens are sent to Expo, Firebase, Apple, or other providers.]
- **Diagnostics:** crash reports and technical device/app information if crash reporting is enabled. [VERIFY whether Sentry or another SDK is actually integrated, which fields are captured, and whether user identifiers or task contents are excluded.]

The local demo mode stores task changes in memory and resets when the app process restarts. Do not interpret that behavior as the production service's storage or retention policy.

## How information may be used

Information is intended to provide task planning, account access, synchronization with the configured service, requested reminder delivery, security, troubleshooting, and reliability. [VERIFY each purpose against production behavior and remove any purpose that is not actually used.]

## Service providers and sharing

The app may rely on service providers to host the API/database, deliver push notifications, and process crash diagnostics. [VERIFY provider names, locations, data categories, contractual roles, and whether each provider receives personal data.] Fonsi Scheduler does not claim that information is never shared or sold until the publisher has audited the complete production data flow and third-party SDKs.

## Retention and deletion

The publisher must insert verified retention periods for account, task, push-token, diagnostic, backup, and support records here: [VERIFY exact periods and exceptions]. Account holders must have an effective way to request deletion of their account and associated data both in the app and through a public web page. **That feature and URL are not present in the repository and must be implemented and tested before publication.**

## Security

The publisher should describe only the technical and organizational measures actually used in production: [VERIFY transport security, access controls, credential handling, backups, and incident response]. No security guarantee is implied by this draft.

## Children and international users

[VERIFY intended audience, minimum age, locations served, and applicable regional rights/retention terms. Do not publish unsupported claims about age eligibility or legal compliance.]

## Changes and contact

The publisher should update this policy when data collection, purposes, providers, or retention changes. Users can contact [VERIFY privacy contact] with privacy questions or use [BLOCKED: verified deletion-request URL] to request account/data deletion.
