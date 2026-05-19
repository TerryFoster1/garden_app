import { CareTask, NotificationPreference, WeatherAlert } from "../domain";

export type NotificationService = {
  requestPermissions(): Promise<boolean>;
  scheduleCareTask(task: CareTask, preferences: NotificationPreference[]): Promise<void>;
  scheduleWeatherAlert(alert: WeatherAlert): Promise<void>;
};

export const stubNotificationService: NotificationService = {
  async requestPermissions() {
    return false;
  },
  async scheduleCareTask() {
    throw new Error("Push notification scheduling is stubbed until Expo Notifications is connected.");
  },
  async scheduleWeatherAlert() {
    throw new Error("Weather alert notification scheduling is stubbed.");
  }
};

