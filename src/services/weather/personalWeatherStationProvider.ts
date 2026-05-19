export type PersonalWeatherStationVendor = "tempest" | "ambient-weather" | "netatmo" | "ecowitt" | "other";

export type PersonalWeatherStationReading = {
  capturedAt: string;
  temperatureC?: number;
  humidityPercent?: number;
  windKph?: number;
  rainfallMm24h?: number;
  soilMoisturePercent?: number;
  soilTemperatureC?: number;
};

export type PersonalWeatherStationProvider = {
  vendor: PersonalWeatherStationVendor;
  connect(userId: string): Promise<void>;
  getLatestReading(userId: string): Promise<PersonalWeatherStationReading | null>;
};

export const stubPersonalWeatherStationProvider: PersonalWeatherStationProvider = {
  vendor: "other",
  async connect() {
    throw new Error("Personal weather station integrations are planned but not implemented.");
  },
  async getLatestReading() {
    return null;
  }
};

