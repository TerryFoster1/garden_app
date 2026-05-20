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

export type GeocodedLocation = {
  label: string;
  latitude: number;
  longitude: number;
};

const weatherProviderName = process.env.EXPO_PUBLIC_WEATHER_PROVIDER?.toLowerCase();
const openWeatherApiKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
const mockWeatherEnabled = process.env.EXPO_PUBLIC_ENABLE_MOCK_WEATHER !== "false";

export const weatherProvider: WeatherProvider = {
  async getCurrent(latitude, longitude) {
    if (weatherProviderName === "openweather" && openWeatherApiKey) {
      try {
        return await getOpenWeatherCurrent(latitude, longitude, openWeatherApiKey);
      } catch {
        if (!mockWeatherEnabled) {
          throw new Error("Weather is temporarily unavailable.");
        }
      }
    }

    return mockWeatherProvider.getCurrent(latitude, longitude);
  },
  async getHourly(latitude, longitude) {
    if (weatherProviderName === "openweather" && openWeatherApiKey) {
      try {
        return await getOpenWeatherHourly(latitude, longitude, openWeatherApiKey);
      } catch {
        return [];
      }
    }

    return mockWeatherProvider.getHourly(latitude, longitude);
  },
  async getDaily() {
    return [];
  },
  async getAlerts(latitude, longitude) {
    const current = await this.getCurrent(latitude, longitude);
    const hourly = await this.getHourly(latitude, longitude);
    return buildGardenWeatherAlerts(current, hourly);
  }
};

export const stubWeatherProvider = weatherProvider;

export const mockWeatherProvider: WeatherProvider = {
  async getCurrent() {
    return {
      id: `mock-weather-${Date.now()}`,
      locationLabel: "Kitchener/Waterloo, Ontario",
      capturedAt: new Date().toISOString(),
      temperatureC: 18,
      humidityPercent: 68,
      windKph: 10,
      rainfallMm24h: 1.2,
      uvIndex: 6,
      frostRisk: "none"
    };
  },
  async getHourly() {
    return [
      { startsAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), temperatureC: 23, rainfallMm: 0, windKph: 12, humidityPercent: 68, uvIndex: 6 },
      { startsAt: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(), temperatureC: 16, rainfallMm: 2, windKph: 16, humidityPercent: 78, uvIndex: 0 }
    ];
  },
  async getDaily() {
    return [];
  },
  async getAlerts(latitude, longitude) {
    const current = await this.getCurrent(latitude, longitude);
    const hourly = await this.getHourly(latitude, longitude);
    return buildGardenWeatherAlerts(current, hourly);
  }
};

type OpenWeatherCurrentResponse = {
  weather?: Array<{ main?: string; description?: string }>;
  main?: { temp?: number; humidity?: number };
  wind?: { speed?: number };
  rain?: { "1h"?: number; "3h"?: number };
  snow?: { "1h"?: number; "3h"?: number };
  name?: string;
};

type OpenWeatherForecastResponse = {
  list?: Array<{
    dt_txt?: string;
    dt?: number;
    main?: { temp?: number; humidity?: number };
    wind?: { speed?: number };
    rain?: { "3h"?: number };
    weather?: Array<{ main?: string; description?: string }>;
  }>;
};

async function getOpenWeatherCurrent(latitude: number, longitude: number, apiKey: string): Promise<WeatherSnapshot> {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${encodeURIComponent(apiKey)}`);
  if (!response.ok) {
    throw new Error("OpenWeather current request failed.");
  }

  const data = (await response.json()) as OpenWeatherCurrentResponse;
  const temperatureC = Math.round(data.main?.temp ?? 0);

  return {
    id: `openweather-current-${Date.now()}`,
    locationLabel: data.name ?? "Saved location",
    capturedAt: new Date().toISOString(),
    temperatureC,
    humidityPercent: Math.round(data.main?.humidity ?? 0),
    windKph: Math.round((data.wind?.speed ?? 0) * 3.6),
    rainfallMm24h: Number((data.rain?.["1h"] ?? data.rain?.["3h"] ?? data.snow?.["1h"] ?? data.snow?.["3h"] ?? 0).toFixed(1)),
    uvIndex: 0,
    frostRisk: temperatureC <= 1 ? "high" : temperatureC <= 3 ? "moderate" : temperatureC <= 5 ? "low" : "none"
  };
}

async function getOpenWeatherHourly(latitude: number, longitude: number, apiKey: string): Promise<HourlyForecastPoint[]> {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${encodeURIComponent(apiKey)}`);
  if (!response.ok) {
    throw new Error("OpenWeather forecast request failed.");
  }

  const data = (await response.json()) as OpenWeatherForecastResponse;
  return (data.list ?? []).slice(0, 8).map((point) => ({
    startsAt: point.dt_txt ? new Date(point.dt_txt).toISOString() : new Date((point.dt ?? Date.now() / 1000) * 1000).toISOString(),
    temperatureC: Math.round(point.main?.temp ?? 0),
    rainfallMm: Number((point.rain?.["3h"] ?? 0).toFixed(1)),
    windKph: Math.round((point.wind?.speed ?? 0) * 3.6),
    humidityPercent: Math.round(point.main?.humidity ?? 0),
    uvIndex: 0
  }));
}

export function buildGardenWeatherAlerts(current: WeatherSnapshot, hourly: HourlyForecastPoint[]): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const nextRain = hourly.reduce((total, point) => total + point.rainfallMm, 0);
  const maxWind = Math.max(current.windKph, ...hourly.map((point) => point.windKph));
  const maxTemp = Math.max(current.temperatureC, ...hourly.map((point) => point.temperatureC));
  const maxHumidity = Math.max(current.humidityPercent, ...hourly.map((point) => point.humidityPercent));

  if (current.frostRisk !== "none" || hourly.some((point) => point.temperatureC <= 3)) {
    alerts.push({ id: `weather-frost-${Date.now()}`, type: "frost", title: "Frost risk tonight", severity: "warning", startsAt: new Date().toISOString(), summary: "Cover basil, peppers, tender starts, and new transplants before evening." });
  }

  if (nextRain >= 8 || current.rainfallMm24h >= 8) {
    alerts.push({ id: `weather-rain-${Date.now()}`, type: "heavy-rain", title: "Skip watering after rain", severity: "watch", startsAt: new Date().toISOString(), summary: "Meaningful rain is expected or already landed. Check containers before watering beds." });
  }

  if (maxTemp >= 29) {
    alerts.push({ id: `weather-heat-${Date.now()}`, type: "heat", title: "Heat stress likely", severity: "watch", startsAt: new Date().toISOString(), summary: "Water early, shade tender greens, and check containers for fast drying." });
  }

  if (maxWind >= 35) {
    alerts.push({ id: `weather-wind-${Date.now()}`, type: "wind", title: "Secure trellis for wind", severity: "watch", startsAt: new Date().toISOString(), summary: "Check tomatoes, cucumbers, tall flowers, and patio containers before gusts arrive." });
  }

  if (maxHumidity >= 75 && maxTemp >= 18) {
    alerts.push({ id: `weather-humidity-${Date.now()}`, type: "humidity", title: "Mildew risk from humidity", severity: "watch", startsAt: new Date().toISOString(), summary: "Inspect cucumbers, squash, tomatoes, and crowded herbs for airflow and leaf spotting." });
  }

  return alerts;
}

export async function geocodeLocation(label: string): Promise<GeocodedLocation | null> {
  if (weatherProviderName !== "openweather" || !openWeatherApiKey || !label.trim()) {
    return null;
  }

  try {
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(label.trim())}&limit=1&appid=${encodeURIComponent(openWeatherApiKey)}`);
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as Array<{ name?: string; state?: string; country?: string; lat?: number; lon?: number }>;
    const result = data[0];
    if (typeof result?.lat !== "number" || typeof result.lon !== "number") {
      return null;
    }

    return {
      label: [result.name, result.state, result.country].filter(Boolean).join(", ") || label,
      latitude: result.lat,
      longitude: result.lon
    };
  } catch {
    return null;
  }
}
