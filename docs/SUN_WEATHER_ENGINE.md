# Sun + Weather Engine

## Goal

The SunWeatherEngine estimates how a real garden behaves across time, orientation, weather, and obstructions. It should help users place plants, prevent stress, and understand microclimates inside beds.

This is a mobile field feature. Inputs should be captured with phone GPS, compass/orientation, quick taps, and simple outdoor-friendly marking flows rather than desktop drawing tools.

## Inputs

- Latitude and longitude.
- Date and time.
- Bed dimensions and orientation.
- Compass capture or manual north marker.
- Shade sources such as fence, house, tree, shed, garage, or other.
- Plant height, trellis placement, and mature spread.
- Weather, UV, wind, rain, humidity, and frost risk.
- Personal weather station readings when available.

## Outputs

- Morning, midday, and afternoon sun estimates.
- Estimated daily sun hours.
- Confidence rating.
- Microclimate zone notes.
- Placement warnings.
- Tall plant and trellis shade warnings.
- Weather-adjusted care recommendations for rules validation.
- Permanent shade notes.
- High heat zones.
- Dry zones.
- Wind-exposed zones.
- Trellis placement guidance.
- Shade cloth suggestions.

## Weather Provider Needs

- Current weather.
- Hourly forecast.
- Daily forecast.
- Rainfall.
- Wind.
- Frost risk.
- Humidity.
- UV.
- Heat alerts.
- Storm and heavy rain alerts.

## Personal Weather Station Direction

Future adapters should support systems such as Tempest, Ambient Weather, Netatmo, Ecowitt, and other stations. The app should merge station data with forecast data without assuming every user owns a station.

## Mobile Workflow

The future setup flow should work while standing near the bed:

1. Confirm location.
2. Use compass or manual north marker.
3. Enter bed size and shape with large controls.
4. Mark obstructions such as fence, house, tree, shed, or garage.
5. Confirm morning, midday, and afternoon sun observations.
6. Save a simple profile that can be refined over time.

The engine should provide guidance, not silently schedule risky changes. AI can recommend placement, but deterministic rules and user confirmation decide tasks.
