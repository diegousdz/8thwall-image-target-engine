# 8th Wall Image Target Engine

This project implements an Augmented Reality (AR) experience using the 8th Wall engine, to track and image target and render on top of it a map.

## Image Target Configuration

The image target is configured to track a student card named `upcard`. It was generated on 8thwall image target CLI. The folder must be named `image-targets` so the XREngine finds this, or the image target will not render. 

In the app.js there is "FLAT" parameted passed when registered the image target type. There are 3 types (Flat, Curved, Cone). The image target must be generated with the same type. Since I the example was made for flat leave it as it is if you are using other surface that value must match with the image target cli generated Json, in the example the upcard.json.

- **Configuration File**: [`public/image-targets/upcard.json`](../public/image-targets/upcard.json)
- **Tracking Image**: [`public/image-targets/upcard_luminance.jpg`](../public/image-targets/upcard_luminance.jpg)
- **Target Type**: `FLAT`

The `upcard.json` file contains dimensions and resource paths used by the XR8 controller to identify and track the physical card.

## AR Loading & Initialization

The AR experience is initialized in [`public/app.js`](../public/app.js). The high-level flow is as follows:

1.  **Wait for XR8**: The system waits for the `xrloaded` event.
2.  **Initialization**: `XR8.initialize()` is called to set up the engine.
3.  **Fetch Target Data**: The application fetches the `upcard.json` configuration from the server.
4.  **Configure Controller**: `XR8.XrController.configure` is called with the fetched target data.
5.  **Pipeline Setup**: Core modules like `GlTextureRenderer`, `XrController`, and `FullWindowCanvas` are added to the camera pipeline.
6.  **A-Frame Integration**: An A-Frame scene is dynamically created and synced with the XR8 camera data via the `camera-and-image-debug` pipeline module.
7.  **Run**: `XR8.run()` starts the camera session and tracking.

## API Keys

The project uses the following external services:

-   **Location IQ**: Used for the static map displayed on the AR plane. Configured in [`public/config.js`](public/config.js) and used in [`public/app.js`](public/app.js).
-   **8th Wall**: The 8th Wall engine itself doesn't require an API key for deployment when loading locally. Currently, the project is structured to load 8th Wall scripts from local `/offline/` or `/external/` paths.

## Scene Elements

When the `upcard` target is found:
-   A white background plane (`BG_PLANE`) is rendered.
-   A map plane (`MAP_PLANE`) is rendered on top, displaying a static map of university locations fetched via the Location IQ API.
