import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Fonsi Scheduler",
  slug: "fonsi-scheduler",
  scheme: "fonsi",
  version: "1.0.0",
  runtimeVersion: {
    policy: "fingerprint"
  },
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  icon: "./assets/images/icon.png",
  splash: {
    image: "./assets/images/splash.png",
    imageWidth: 160,
    resizeMode: "contain",
    backgroundColor: "#F7F8F5"
  },
  plugins: [
    "expo-router",
    [
      "expo-notifications",
      {
        color: "#7887B8"
      }
    ],
    "expo-secure-store",
    "expo-asset",
    "expo-font"
  ],
  experiments: {
    typedRoutes: true
  },
  android: {
    package: "com.fonsiflow.scheduler",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#7887B8"
    },
    permissions: ["android.permission.POST_NOTIFICATIONS", "android.permission.SCHEDULE_EXACT_ALARM"]
  },
  ios: {
    bundleIdentifier: "com.fonsiflow.scheduler"
  }
};

export default config;
