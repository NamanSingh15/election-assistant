/**
 * maps.js
 * Google Maps integration for finding nearby polling stations.
 * Uses Maps JavaScript API + Places API.
 */

class PollingFinder {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.map = null;
    this.service = null;
    this.markers = [];
    this.infoWindow = null;
    this.mapContainer = document.getElementById("map");
    this.resultsContainer = document.getElementById("map-results");
    this.searchInput = document.getElementById("map-search-input");
    this.searchBtn = document.getElementById("map-search-btn");
    this.statusEl = document.getElementById("map-status");

    this.bindEvents();
  }

  bindEvents() {
    this.searchBtn?.addEventListener("click", () => this.search());
    this.searchInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.search();
    });
    document.getElementById("map-locate-btn")?.addEventListener("click", () => this.useCurrentLocation());
  }

  initMap(center = { lat: 20.5937, lng: 78.9629 }) {
    if (!window.google || !this.mapContainer) return;

    this.map = new google.maps.Map(this.mapContainer, {
      center,
      zoom: center.lat === 20.5937 ? 5 : 13,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#0d1b2a" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0d1b2a" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#8899aa" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a2d45" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#050b18" }] },
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
      ],
      disableDefaultUI: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    this.service = new google.maps.places.PlacesService(this.map);
    this.infoWindow = new google.maps.InfoWindow();

    if (this.statusEl) {
      this.statusEl.textContent = "Map ready. Search by address or use your current location.";
    }
  }

  search() {
    const query = this.searchInput?.value?.trim();
    if (!query) return;

    if (!window.google) {
      this.setStatus("⚠️ Maps is loading, please wait a moment…", "error");
      return;
    }

    const geocoder = new google.maps.Geocoder();
    this.setStatus("🔍 Searching…", "loading");

    geocoder.geocode({ address: query + ", India" }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        this.map.setCenter(location);
        this.map.setZoom(14);
        this.searchNearby(location);
      } else {
        this.setStatus("❌ Location not found. Try a more specific address.", "error");
      }
    });
  }

  useCurrentLocation() {
    if (!navigator.geolocation) {
      this.setStatus("❌ Geolocation is not supported by your browser.", "error");
      return;
    }
    this.setStatus("📍 Getting your location…", "loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.map.setCenter(location);
        this.map.setZoom(14);

        // Drop user pin
        new google.maps.Marker({
          position: location,
          map: this.map,
          title: "Your Location",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#FF9933",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 2,
          },
        });

        this.searchNearby(location);
      },
      () => this.setStatus("❌ Unable to get your location. Please allow location access.", "error")
    );
  }

  searchNearby(location) {
    if (!this.service) return;

    // Clear previous markers
    this.markers.forEach((m) => m.setMap(null));
    this.markers = [];
    if (this.resultsContainer) this.resultsContainer.innerHTML = "";

    const request = {
      location,
      radius: 5000,
      keyword: "polling booth election office government school",
      type: "establishment",
    };

    this.service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
        this.setStatus(`✅ Found ${results.length} results near your location.`, "success");
        results.slice(0, 10).forEach((place, i) => this.addPlaceMarker(place, i + 1));
      } else {
        // Fallback: search for government offices, schools (common polling venues)
        this.service.textSearch(
          { query: "government school near " + location.lat + "," + location.lng, location, radius: 5000 },
          (r2, s2) => {
            if (s2 === google.maps.places.PlacesServiceStatus.OK) {
              this.setStatus(`✅ Found ${r2.length} potential polling venues nearby.`, "success");
              r2.slice(0, 8).forEach((place, i) => this.addPlaceMarker(place, i + 1));
            } else {
              this.setStatus("No polling places found nearby. Try a different address.", "error");
            }
          }
        );
      }
    });
  }

  addPlaceMarker(place, index) {
    const marker = new google.maps.Marker({
      position: place.geometry.location,
      map: this.map,
      title: place.name,
      label: { text: String(index), color: "#fff", fontWeight: "bold" },
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 8,
        fillColor: "#FF9933",
        fillOpacity: 0.9,
        strokeColor: "#fff",
        strokeWeight: 1,
      },
      animation: google.maps.Animation.DROP,
    });

    marker.addListener("click", () => {
      this.infoWindow.setContent(`
        <div style="font-family:Inter,sans-serif;padding:8px;max-width:200px;color:#0d1b2a">
          <strong>${place.name}</strong><br>
          <small>${place.vicinity || ""}</small><br>
          ${place.rating ? `⭐ ${place.rating}` : ""}
        </div>
      `);
      this.infoWindow.open(this.map, marker);
    });

    this.markers.push(marker);

    // Add to results list
    if (this.resultsContainer) {
      const item = document.createElement("div");
      item.className = "map-result-item";
      item.setAttribute("role", "listitem");
      item.innerHTML = `
        <span class="result-num">${index}</span>
        <div class="result-info">
          <strong>${place.name}</strong>
          <small>${place.vicinity || ""}</small>
        </div>
        <button onclick="window.open('https://maps.google.com/?q=${encodeURIComponent(place.name + " " + (place.vicinity || ""))}', '_blank')"
                aria-label="Get directions to ${place.name}" class="btn-directions">
          🗺️
        </button>
      `;
      item.addEventListener("click", () => {
        this.map.setCenter(place.geometry.location);
        this.map.setZoom(17);
        google.maps.event.trigger(marker, "click");
      });
      this.resultsContainer.appendChild(item);
    }
  }

  setStatus(msg, type = "info") {
    if (!this.statusEl) return;
    this.statusEl.textContent = msg;
    this.statusEl.className = `map-status ${type}`;
  }
}

// Called by Google Maps async callback
function initGoogleMaps() {
  if (typeof pollingFinder !== "undefined") {
    pollingFinder.initMap();
  }
}
