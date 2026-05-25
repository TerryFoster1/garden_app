# Plant Identification QA

Pattypan should never silently show local demo results as if they came from PlantNet.

## Required Environment

- `EXPO_PUBLIC_PLANT_ID_PROVIDER=plantnet`
- `EXPO_PUBLIC_PLANT_ID_API_KEY` present
- `EXPO_PUBLIC_ENABLE_MOCK_PLANT_ID=false`

If the provider or key is missing, the app may use local demo identification, but the result screen must clearly say `Using local demo identification`.

## What To Check On Every Photo Test

- The selected/captured photo preview matches the actual plant photo.
- Result source says `PlantNet suggestions` for real API results.
- Development status shows provider used, API key detected, image URI type, response status, candidate count, and fallback state.
- Candidates show confidence percentages.
- Candidates show common name and scientific name when available.
- Low-confidence results show: `We're not confident. Try another photo or search manually.`
- `None of these` opens manual search.
- Manual search can find and select plants from the local plant index.
- No basil/oregano/tomato local demo result appears unless the UI clearly labels local demo identification.

## Test Matrix

### Snake Plant

Photo: indoor snake plant leaves, well lit, one plant filling most of frame.

Expected:
- Plausible candidates include snake plant, Dracaena/Sansevieria, or a closely related houseplant.
- If PlantNet is uncertain, the screen shows low-confidence language.
- Manual search for `snake plant` returns `Snake Plant / Dracaena trifasciata / Sansevieria trifasciata` style naming through the local plant index.
- Basil or oregano should not appear unless the result is clearly labelled local demo identification.

### Basil

Photo: basil leaves, top-down or side view, good light.

Expected:
- Basil or Ocimum candidates should appear when PlantNet is confident enough.
- If not confident, user can use manual search.

### Tomato

Photo: tomato leaves plus fruit/flowers if possible.

Expected:
- Tomato or Solanum candidates should appear.
- Confidence should be shown; low confidence should not auto-confirm.

### Pepper

Photo: pepper plant leaves and fruit if possible.

Expected:
- Pepper/Capsicum candidates should appear.
- If only leaves are shown, confidence may be lower.

### Pothos

Photo: indoor pothos leaves.

Expected:
- Pothos/Epipremnum candidates or related aroid candidates.
- Manual search fallback should find Pothos.

### Fern

Photo: fern fronds with clear texture.

Expected:
- Fern candidates should be plausible.
- If PlantNet returns broad fern matches, show candidate list and require confirmation.

### Cactus / Succulent

Photo: cactus or succulent rosette/body, clear lighting.

Expected:
- Cactus/succulent candidates should be plausible.
- Manual search should find Aloe, Echeveria, Haworthia, or related seeded plants when exact match is unavailable.

## Known Limitations

PlantNet is strongest when the plant photo includes clear leaves, flowers, fruit, or bark. Some indoor houseplants may return weaker matches if the photo is too close, too dark, or shows only a partial leaf pattern. For houseplants, always keep manual search visible as a safe confirmation path.
