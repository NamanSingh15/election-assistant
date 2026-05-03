/**
 * maps.js
 * Google Maps integration for finding nearby polling stations.
 * Uses Maps JavaScript API + Places API (textSearch).
 */

class PollingFinder {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.map = null;
    this.markers = [];
    this.infoWindow = null;
    this.placesService = null;
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
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    this.infoWindow = new google.maps.InfoWindow();
    this.placesService = new google.maps.places.PlacesService(this.map);
    this.setStatus("Map ready. Search by address or use your current location.");
  }

  search() {
    const query = this.searchInput?.value?.trim();
    if (!query || !window.google) return;

    this.setStatus("🔍 Locating address…", "loading");
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: query + ", India" }, (results, status) => {
      if (status === "OK" && results[0]) {
        const loc = results[0].geometry.location;
        this.map.setCenter(loc);
        this.map.setZoom(14);
        // Blue pin for searched address
        new google.maps.Marker({
          position: loc, map: this.map, title: query,
          icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#1a73e8", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 }
        });
        this.searchNearby(loc);
      } else {
        this.setStatus("❌ Address not found. Try a more specific location or pincode.", "error");
      }
    });
  }

  useCurrentLocation() {
    if (!navigator.geolocation) { this.setStatus("❌ Geolocation not supported.", "error"); return; }
    this.setStatus("📍 Getting your location…", "loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        this.map.setCenter(loc); this.map.setZoom(14);
        new google.maps.Marker({
          position: loc, map: this.map, title: "You are here",
          icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#FF9933", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 }
        });
        this.searchNearby(loc);
      },
      () => this.setStatus("❌ Location access denied. Please allow location in browser settings.", "error")
    );
  }

  searchNearby(location) {
    this.markers.forEach((m) => m.setMap(null));
    this.markers = [];
    if (this.resultsContainer) this.resultsContainer.innerHTML = "";
    this.setStatus("🔍 Finding nearby polling venues…", "loading");

    // Government schools & community halls are the most common polling venues in India
    this.placesService.textSearch(
      { query: "government school community hall", location, radius: 5000 },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results?.length) {
          this.setStatus(`✅ Found ${Math.min(results.length, 8)} potential polling venues nearby.`, "success");
          results.slice(0, 8).forEach((place, i) => this.addPlaceMarker(place, i + 1));
        } else {
          // Broader fallback
          this.placesService.textSearch(
            { query: "school hall office", location, radius: 3000 },
            (r2, s2) => {
              if (s2 === google.maps.places.PlacesServiceStatus.OK && r2?.length) {
                this.setStatus(`✅ Found ${Math.min(r2.length, 6)} nearby venues. Verify at voterportal.eci.gov.in`, "success");
                r2.slice(0, 6).forEach((place, i) => this.addPlaceMarker(place, i + 1));
              } else {
                this.setStatus("ℹ️ No venues found. Check voterportal.eci.gov.in for your exact booth.", "error");
              }
            }
          );
        }
      }
    );
  }

  addPlaceMarker(place, index) {
    const marker = new google.maps.Marker({
      position: place.geometry.location, map: this.map, title: place.name,
      label: { text: String(index), color: "#fff", fontWeight: "bold" },
      icon: { path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, scale: 8, fillColor: "#FF9933", fillOpacity: 0.9, strokeColor: "#fff", strokeWeight: 1 },
      animation: google.maps.Animation.DROP,
    });

    marker.addListener("click", () => {
      this.infoWindow.setContent(`<div style="font-family:Inter,sans-serif;padding:8px;max-width:220px;color:#0d1b2a"><strong>${place.name}</strong><br><small>${place.vicinity || place.formatted_address || ""}</small>${place.rating ? `<br>⭐ ${place.rating}` : ""}</div>`);
      this.infoWindow.open(this.map, marker);
    });
    this.markers.push(marker);

    if (this.resultsContainer) {
      const addr = place.vicinity || place.formatted_address || "";
      const item = document.createElement("div");
      item.className = "map-result-item";
      item.setAttribute("role", "listitem");
      item.innerHTML = `
        <span class="result-num">${index}</span>
        <div class="result-info"><strong>${place.name}</strong><small>${addr}</small></div>
        <button onclick="window.open('https://maps.google.com/?q=${encodeURIComponent(place.name+" "+addr)}','_blank')"
                aria-label="Directions to ${place.name}" class="btn-directions">🗺️</button>`;
      item.addEventListener("click", () => { this.map.setCenter(place.geometry.location); this.map.setZoom(17); google.maps.event.trigger(marker, "click"); });
      this.resultsContainer.appendChild(item);
    }
  }

  setStatus(msg, type = "info") {
    if (!this.statusEl) return;
    this.statusEl.textContent = msg;
    this.statusEl.className = `map-status ${type}`;
  }
}

function initGoogleMaps() {
  if (typeof pollingFinder !== "undefined") pollingFinder.initMap();
}
