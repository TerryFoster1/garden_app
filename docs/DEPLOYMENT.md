# Deployment

Pattypan is an Expo mobile-first app with a web export for Pattypan.ca.

## GitHub

Preferred repository name: `pattypan`.

If GitHub CLI is authenticated:

```bash
gh repo create pattypan --private --source=. --remote=origin --push
```

If the repository already exists:

```bash
git remote add origin https://github.com/<USERNAME>/pattypan.git
git branch -M main
git push -u origin main
```

Do not commit `.env.local`. It contains real provider keys and is ignored by `.gitignore`.

## Vercel

Import the GitHub repository into Vercel.

Use these settings:

- Framework preset: Other
- Install command: `npm install`
- Build command: `npm run build:web`
- Output directory: `dist`
- Root directory: repository root

`vercel.json` already defines:

- `buildCommand`: `npm run build:web`
- `outputDirectory`: `dist`
- SPA fallback rewrite to `index.html`

## Environment Variables

Add these variables manually in Vercel. Do not paste them into the repository.

- `EXPO_PUBLIC_APP_NAME`
- `EXPO_PUBLIC_APP_DOMAIN`
- `EXPO_PUBLIC_PLANT_ID_PROVIDER`
- `EXPO_PUBLIC_PLANT_ID_API_KEY`
- `EXPO_PUBLIC_WEATHER_PROVIDER`
- `EXPO_PUBLIC_WEATHER_API_KEY`
- `EXPO_PUBLIC_AI_PROVIDER`
- `EXPO_PUBLIC_AI_API_KEY`
- `EXPO_PUBLIC_ENABLE_MOCK_PLANT_ID`
- `EXPO_PUBLIC_ENABLE_MOCK_WEATHER`
- `EXPO_PUBLIC_ENABLE_MOCK_AI`

## Verification

Before deploy:

```bash
npm run check
npx expo-doctor
npm run build:web
```

After deploy:

1. Open the Vercel preview URL.
2. Confirm desktop shows the centered mobile-first Pattypan experience.
3. Confirm mobile browser layout remains touch-first.
4. Test Add Plant photo selection, Library Ask Pattypan, and Home weather fallback/provider behavior.
