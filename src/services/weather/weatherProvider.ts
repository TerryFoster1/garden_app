import { WeatherAlert, WeatherSnapshot } from "../../domain";

export type HourlyForecastPoint = {
  startsAt: string;
  temperatureC: number;
  rainfallMm: number;
  windKph: number;
  humidityPercent: number;
  uvIndex: number;
};

export type DailyForecastPoint = {
  date: string;
  lowC: number;
  highC: number;
  rainfallMm: number;
  frostRisk: WeatherSnapshot["frostRisk"];
};

export type WeatherProvider = {
  getCurrent(latitude: number, longitude: number): Promise<WeatherSnapshot>;
  getHourly(latitude: number, longitude: number): Promise<HourlyForecastPoint[]>;
  getDaily(latitude: number, longitude: number): Promise<DailyForecastPoint[]>;
  getAlerts(latitude: number, longitude: number): Promise<WeatherAlert[]>;
};

export const stubWeatherProvider: WeatherProvider = {
  async getCurrent() {
    throw new Error("Weather provider is stubbed. Connect a real provider later.");
  },
  async getHourly() {
    return [];
  },
  async getDaily() {
    return [];
  },
  async getAlerts() {
    return [];
  }
};

