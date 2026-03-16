/**
 * Application Configuration
 * 
 * Instructions:
 * 1. Go to https://locationiq.com/ and get a free API key.
 * 2. Replace the MAP_API_KEY below with your key.
 * 3. This service provides pure OpenStreetMap images for free.
 */
window.APP_CONFIG = {
  // Your LocationIQ API key
  MAP_API_KEY: 'ENTER_YOUR_API_KEY',

  // University Locations (Markers) Equivalent to Lightship Map Points
  MARKERS: [
    { name: 'Mario Bravo 1302', lat: -34.59468, lng: -58.41472 },
    { name: 'Mario Bravo 1259', lat: -34.59546, lng: -58.41618 }, // Added
    { name: 'Mario Bravo 1050', lat: -34.59736, lng: -58.41607 },
    { name: 'Jean Jaurés 932', lat: -34.59910, lng: -58.40707 },
    { name: 'Cabrera 3507', lat: -34.59658, lng: -58.41569 },
    { name: 'Cabrera 3641', lat: -34.59549, lng: -58.42337 }, // Added
    { name: 'Ecuador 931', lat: -34.59928, lng: -58.40715 }, // Added
    { name: 'Larrea 1079', lat: -34.58864, lng: -58.40130 },
  ],
  // Map settings (Centered around Palermo University buildings)
  LAT: -34.596,
  LNG: -58.412,
  ZOOM: 8,
  WIDTH: 1024,
  HEIGHT: 1024,

  /**
   * Generates the static map URL with markers.
   * This uses LocationIQ (Free OpenStreetMap-based service).
   * Get your free key at: https://locationiq.com/
   */
  getMapUrl() {
    const baseUrl = 'https://maps.locationiq.com/v3/staticmap';
    let url = `${baseUrl}?key=${this.MAP_API_KEY}&center=${this.LAT},${this.LNG}&zoom=${this.ZOOM}&size=${this.WIDTH}x${this.HEIGHT}&format=png&maptype=streets`;

    // Add markers if they exist
    if (this.MARKERS && this.MARKERS.length > 0) {
      const markersStr = this.MARKERS.map(m => `${m.lat},${m.lng}`).join('|');
      url += `&markers=icon:large-blue-cutout|${markersStr}`;
    }

    return url;
  }
};
