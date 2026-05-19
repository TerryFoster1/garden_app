# Sun + Weather Engine

## Goal

The SunWeatherEngine estimates how a real garden behaves across time, orientation, weather, and obstructions. It should help users place plants, prevent stress, and understand microclimates inside beds.

## Inputs

- Latitude and longitude.
- Date and time.
- Bed dimensions and orientation.
- Compass capture or manual north marker.
- Shade sources such as fence, house, tree, shed, garage, or other.
- Plant height, trellis placement, and mature spread.
- Weather, UV, wind, rain, humidity, and frost risk.

## Outputs

- Morning, midday, and afternoon sun estimates.
- Estimated daily sun hours.
- Confidence rating.
- Microclimate zone notes.
- Placement warnings.
- Tall plant and trellis shade warnings.
- Weather-adjusted care recommendations for rules validation.

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

