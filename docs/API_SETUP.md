# API Setup

Pattypan reads provider settings from Expo public environment variables. Real values belong in `.env.local`, which is ignored by git.

## PlantNet

- `EXPO_PUBLIC_PLANT_ID_PROVIDER=plantnet`
- `EXPO_PUBLIC_PLANT_ID_API_KEY=...`
- `EXPO_PUBLIC_ENABLE_MOCK_PLANT_ID=true`

PlantNet is used for captured/uploaded photo identification. Pattypan sends the image as multipart form data, returns a ranked set of likely matches, shows confidence percentages, and requires the user to confirm a match. If PlantNet fails or returns no useful matches, the app falls back to local mock suggestions when fallback is enabled.

## OpenWeather

- `EXPO_PUBLIC_WEATHER_PROVIDER=openweather`
- `EXPO_PUBLIC_WEATHER_API_KEY=...`
- `EXPO_PUBLIC_ENABLE_MOCK_WEATHER=true`

OpenWeather powers the Home weather snapshot and garden alerts. Pattypan converts current conditions and short-range forecast signals into gardening actions such as frost cover, skip watering after rain, heat stress, wind support, and humidity/mildew checks.

Location entry uses OpenWeather geocoding when configured. If no location is saved, Home asks for setup instead of pretending Kitchener/Waterloo weather is real.

## OpenAI

- `EXPO_PUBLIC_AI_PROVIDER=openai`
- `EXPO_PUBLIC_AI_API_KEY=...`
- `EXPO_PUBLIC_ENABLE_MOCK_AI=true`

OpenAI powers Ask Pattypan, topic-aware Library answers, diagnosis explanations, and AI Optimize Bed. The AI layer explains and recommends; deterministic rules and user confirmation still govern care actions.

## Secret Safety

Do not commit `.env.local`. Do not paste real keys into docs, screenshots, commits, or logs. For public production, paid provider calls should move behind a server-side API proxy so provider keys are not shipped in a public client bundle.
