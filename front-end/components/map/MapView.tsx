/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  memo,
  type RefObject,
} from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Navigation,
  X,
  Loader2,
  Map as MapIcon,
  Briefcase,
  Layers,
  User as UserIcon,
  Star,
  Clock,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import {
  Map,
  Marker,
  NavigationControl,
  AttributionControl,
  type MapRef,
  Source,
  Layer,
} from "react-map-gl/maplibre";
import type { StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  saveLocationHistory,
  getLastLocationApi,
  getLocationHistoryApi,
  getNearbyUsers,
  getMapTechnicians,
  getMapTasks,
  getAllCategories,
} from "@/service/map";
import { showToast } from "@/components/toast/toast";
import { toastTypes } from "@/app/constant";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface Category {
  id: string;
  name: string;
}

/** Minimal shape MapCanvas needs from each result to draw its marker. */
interface MapMarkerItem {
  id: string;
  latitude: number;
  longitude: number;
}

/** One autocomplete suggestion returned by the Nominatim geocoder. */
interface SearchSuggestion {
  place_id: number;
  osm_type?: string;
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
  category?: string;
}

/** A saved location entry stored in the user's location history. */
interface LocationHistoryEntry {
  id: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  label?: string | null;
  createdAt?: string;
}

/** A nearby customer returned by GET /map/users (technician view). */
interface NearbyMapUser {
  id: string;
  name: string;
  imageUrl?: string | null;
  address?: string | null;
  latitude: number;
  longitude: number;
  distanceKm: number;
  rating?: number;
  /** The customer's most-recent OPEN task (location + details for the popup). */
  task?: {
    id: string;
    title: string;
    description: string;
    budget?: number | null;
    address?: string | null;
    category?: { id: string; name: string };
  } | null;
}

const DEFAULT_CENTER = { latitude: 23.8103, longitude: 90.4125, zoom: 12 };

/** Base-map styles the user can switch between (vector + raster). */
const STYLE_STORAGE_KEY = "fixitnow:map-style";

/** localStorage flag so the "how the map works" guide only shows once. */
const GUIDE_STORAGE_KEY = "fixitnow:map-guide-seen";

const RASTER_STREETS: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

const RASTER_SATELLITE: StyleSpecification = {
  version: 8,
  sources: {
    esriWorldImagery: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution:
        "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, GIS User Community",
    },
  },
  layers: [{ id: "esri-imagery", type: "raster", source: "esriWorldImagery" }],
};

type MapStyleDef = {
  id: string;
  name: string;
  dot: string;
  mapStyle: string | StyleSpecification;
};

const MAP_STYLES: MapStyleDef[] = [
  {
    id: "liberty",
    name: "Liberty (Default)",
    dot: "bg-blue-400",
    mapStyle: "https://tiles.openfreemap.org/styles/liberty",
  },
  {
    id: "bright",
    name: "Bright",
    dot: "bg-sky-300",
    mapStyle: "https://tiles.openfreemap.org/styles/bright",
  },
  {
    id: "positron",
    name: "Positron",
    dot: "bg-slate-300",
    mapStyle: "https://tiles.openfreemap.org/styles/positron",
  },
  {
    id: "dark",
    name: "Dark Matter",
    dot: "bg-slate-800",
    mapStyle: "https://tiles.openfreemap.org/styles/dark-matter",
  },
  {
    id: "fiord",
    name: "Fiord",
    dot: "bg-indigo-400",
    mapStyle: "https://tiles.openfreemap.org/styles/fiord",
  },
  {
    id: "streets",
    name: "OpenStreetMap",
    dot: "bg-emerald-400",
    mapStyle: RASTER_STREETS,
  },
  {
    id: "satellite",
    name: "Satellite",
    dot: "bg-gradient-to-br from-emerald-600 to-slate-900",
    mapStyle: RASTER_SATELLITE,
  },
];

/** Build a polygon (GeoJSON) showing a radius boundary around a point. */
function buildRadiusCircle(latitude: number, longitude: number, radiusKm: number) {
  const { asin, atan2, cos, sin, PI } = Math;
  const R = 6371; // Earth radius in km
  const d = radiusKm / R;
  const lat1 = (latitude * PI) / 180;
  const lon1 = (longitude * PI) / 180;
  const STEPS = 96;
  const points: [number, number][] = [];
  for (let i = 0; i <= STEPS; i++) {
    const brng = (i * 2 * PI) / STEPS;
    const lat2 = asin(sin(lat1) * cos(d) + cos(lat1) * sin(d) * cos(brng));
    const lon2 =
      lon1 + atan2(sin(brng) * sin(d) * cos(lat1), cos(d) - sin(lat1) * sin(lat2));
    points.push([(lon2 * 180) / PI, (lat2 * 180) / PI]);
  }
  // First point uses bearing 0° → due north; used for the radius label marker.
  const [northLon, northLat] = points[0];
  return {
    geoJson: {
      type: "Feature" as const,
      properties: {},
      geometry: { type: "Polygon" as const, coordinates: [points] },
    },
    northPoint: { latitude: northLat, longitude: northLon },
  };
}
/**
 * Memoized map scene. The GL canvas, base-map layers and HTML markers only
 * re-render when their own inputs change (radius, markers, style, location) —
 * never when unrelated UI state (search text, loading flags, filter panel)
 * toggles. This keeps pan/zoom and the radius slider silky smooth.
 */
const MapCanvas = memo(function MapCanvas({
  mapRef,
  userLocation,
  radiusKm,
  items,
  isCustomer,
  mapStyle,
  onItemClick,
  nearbyUsers,
  onUserItemClick,
}: {
  mapRef: RefObject<MapRef | null>;
  userLocation: { latitude: number; longitude: number } | null;
  radiusKm: number;
  items: MapMarkerItem[];
  isCustomer: boolean;
  mapStyle: string | StyleSpecification;
  onItemClick: (item: MapMarkerItem) => void;
  nearbyUsers: MapMarkerItem[];
  onUserItemClick: (item: MapMarkerItem) => void;
}) {
  // Live radius boundary — regenerated only when the location or radius changes.
  const circle = useMemo(
    () =>
      userLocation
        ? buildRadiusCircle(
            userLocation.latitude,
            userLocation.longitude,
            radiusKm,
          )
        : null,
    [userLocation, radiusKm],
  );

  // Keep marker elements referentially stable so they are NOT re-rendered while
  // the radius slider (or any other MapView state) changes.
  const markers = useMemo(
    () =>
      items.map((item) => (
        <Marker
          key={item.id}
          latitude={item.latitude}
          longitude={item.longitude}
          onClick={() => onItemClick(item)}
        >
          <div
            className={`cursor-pointer w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-transform hover:scale-110 ${
              isCustomer ? "bg-emerald-500" : "bg-amber-500"
            }`}
          >
            {isCustomer ? (
              <Briefcase className="w-4 h-4 text-white" />
            ) : (
              <MapIcon className="w-4 h-4 text-white" />
            )}
          </div>
        </Marker>
      )),
    [items, isCustomer, onItemClick],
  );

  // Technicians also see nearby customers (users) as purple person markers.
  const userMarkers = useMemo(
    () =>
      nearbyUsers.map((u) => (
        <Marker
          key={`user-${u.id}`}
          latitude={u.latitude}
          longitude={u.longitude}
          onClick={() => onUserItemClick(u)}
        >
          <div className="cursor-pointer w-8 h-8 rounded-full flex items-center justify-center bg-violet-500 border-2 border-white shadow-lg transition-transform hover:scale-110">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
        </Marker>
      )),
    [nearbyUsers, onUserItemClick],
  );

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        latitude: userLocation?.latitude ?? DEFAULT_CENTER.latitude,
        longitude: userLocation?.longitude ?? DEFAULT_CENTER.longitude,
        zoom: DEFAULT_CENTER.zoom,
      }}
      mapStyle={mapStyle}
      style={{ width: "100%", height: "100%" }}
      attributionControl={false}
      minZoom={2}
      maxZoom={18}
      reuseMaps
    >
      <NavigationControl position="bottom-right" />
      <AttributionControl compact />
      {userLocation && circle && (
        <Source id="radius-circle" type="geojson" data={circle.geoJson}>
          <Layer
            id="radius-line"
            type="line"
            paint={{
              "line-color": "#2563eb",
              "line-width": 2.5,
              "line-opacity": 0.9,
              "line-dasharray": [4, 3],
            }}
          />
        </Source>
      )}
      {userLocation && circle && (
        <Marker
          latitude={circle.northPoint.latitude}
          longitude={circle.northPoint.longitude}
          anchor="bottom"
        >
          <div className="px-2 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold shadow-lg whitespace-nowrap border border-white/60">
            {radiusKm} km radius
          </div>
        </Marker>
      )}
      {userLocation && (
        <Marker
          latitude={userLocation.latitude}
          longitude={userLocation.longitude}
          anchor="center"
        >
          <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg ring-4 ring-blue-600/20" />
        </Marker>
      )}
      {markers}
      {!isCustomer && userMarkers}
    </Map>
  );
});

export default function MapView({ user }: { user: User }) {
  const router = useRouter();
  const mapRef = useRef<MapRef | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    user.latitude && user.longitude
      ? { latitude: user.latitude, longitude: user.longitude }
      : null,
  );
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [radiusKm, setRadiusKm] = useState(10);
  const [debouncedRadius, setDebouncedRadius] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<NearbyMapUser | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [mapStyleId, setMapStyleId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(STYLE_STORAGE_KEY);
      if (saved && MAP_STYLES.some((s) => s.id === saved)) return saved;
    }
    return MAP_STYLES[0].id;
  });
    const [showStylePicker, setShowStylePicker] = useState(false);

  // --- Autocomplete & location-history state ---
  const [searchResults, setSearchResults] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationHistory, setLocationHistory] = useState<LocationHistoryEntry[]>(
    [],
  );
  const [lastLocation, setLastLocation] = useState<LocationHistoryEntry | null>(
    null,
  );
  const [nearbyUsers, setNearbyUsers] = useState<NearbyMapUser[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [listExpanded, setListExpanded] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [locating, setLocating] = useState(false);

  /** Resolve the selected style definition (URL string or inline style object). */
  const currentMapStyle = useMemo(
    () =>
      MAP_STYLES.find((s) => s.id === mapStyleId)?.mapStyle ??
      MAP_STYLES[0].mapStyle,
    [mapStyleId],
  );

  // Persist the user's base-map choice so the map reopens on the same style.
  useEffect(() => {
    try {
      window.localStorage.setItem(STYLE_STORAGE_KEY, mapStyleId);
    } catch {
      /* storage unavailable — non-blocking */
    }
  }, [mapStyleId]);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCustomer = user.role === "CUSTOMER";

  const flyTo = useCallback(
    (latitude: number, longitude: number, zoom: number) => {
      mapRef.current?.flyTo({
        center: [longitude, latitude],
        zoom,
        duration: 1200,
        essential: true,
      });
    },
    [],
  );

  /** Zooms the camera so the full radius boundary is visible on screen. */
  const fitRadiusToView = useCallback(
    (latitude: number, longitude: number, km: number) => {
      const map = mapRef.current;
      if (!map) return;
      // 1° of latitude ≈ 111.32 km; longitude degrees shrink by cos(latitude).
      const latDelta = km / 111.32;
      const lonDelta =
        km / (111.32 * Math.max(0.2, Math.cos((latitude * Math.PI) / 180)));
      map.fitBounds(
        [
          [longitude - lonDelta, latitude - latDelta],
          [longitude + lonDelta, latitude + latDelta],
        ],
        { padding: 72, duration: 800, maxZoom: 14, essential: true },
      );
    },
    [],
  );

  const fetchItems = useCallback(async () => {
    if (!userLocation) return;
    setLoading(true);
    try {
      const base = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radiusKm: debouncedRadius,
        categoryId: selectedCategory || undefined,
      };

      if (isCustomer) {
        const res = await getMapTechnicians({
          ...base,
          q: debouncedSearch || undefined,
        });
        if (res?.data?.success) {
          setItems(res.data.data.data || []);
        } else {
          setItems([]);
        }
      } else {
        // Technician: show nearby tasks AND nearby users (customers)
        const [tasksRes, usersRes] = await Promise.all([
          getMapTasks(base),
          getNearbyUsers({
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            radiusKm: debouncedRadius,
            categoryId: selectedCategory || undefined,
          }),
        ]);

        const taskItems = tasksRes?.data?.success
          ? tasksRes.data.data.data || []
          : [];
        const userItems = usersRes?.data?.success
          ? usersRes.data.data.data || []
          : [];

        setItems(taskItems);
        setNearbyUsers(userItems);
      }
    } catch (err) {
      console.error("Failed to fetch map items:", err);
      setItems([]);
      if (!isCustomer) setNearbyUsers([]);
    } finally {
      setLoading(false);
    }
  }, [
    userLocation,
    debouncedRadius,
    selectedCategory,
    debouncedSearch,
    isCustomer,
  ]);

  // Debounce the radius slider so we don't fire a request on every tick.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedRadius(radiusKm), 400);
    return () => clearTimeout(t);
  }, [radiusKm]);

  // Debounce the search text so results only load once you stop typing.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    getAllCategories().then((res) => {
      if (res?.data?.success) setCategories(res.data.data || []);
    });
  }, []);
  useEffect(() => {
    if (userLocation) {
      fetchItems();
    }
  }, [fetchItems, userLocation]);

  // --- Load last location + history from DB on first mount ---
  const loadLastLocation = useCallback(async () => {
    try {
      const res = await getLastLocationApi();
      if (res?.data?.success && res.data.data) {
        const loc = res.data.data;
        setLastLocation(loc);
        if (!userLocation && loc.latitude && loc.longitude) {
          setUserLocation({
            latitude: Number(loc.latitude),
            longitude: Number(loc.longitude),
          });
        }
      }
    } catch (err) {
      console.warn("Failed to load last location:", err);
    }

    try {
      const histRes = await getLocationHistoryApi();
      if (histRes?.data?.success && histRes.data.data) {
        setLocationHistory(histRes.data.data);
      }
    } catch (err) {
      console.warn("Failed to load location history:", err);
    }
  }, [userLocation]);

  useEffect(() => {
    loadLastLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user.latitude || !user.longitude) {
      if (!userLocation) {
                setShowPermissionModal(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show the "how this map works" guide once per browser (first visit).
  useEffect(() => {
    try {
      if (!window.localStorage.getItem(GUIDE_STORAGE_KEY)) {
        setShowGuide(true);
      }
    } catch {
      setShowGuide(true);
    }
  }, []);

  const closeGuide = () => {
    setShowGuide(false);
    try {
      window.localStorage.setItem(GUIDE_STORAGE_KEY, "1");
    } catch {
      /* storage unavailable — non-blocking */
    }
  };

  /** Reverse-geocode coordinates to a human-readable address via Nominatim */
  const reverseGeocode = async (
    lat: number,
    lon: number,
  ): Promise<string | undefined> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
      const res = await fetch(url, {
        headers: { "Accept-Language": "en" },
      });
      const data = await res.json();
      return data?.display_name;
    } catch {
      return undefined;
    }
  };

  /** Persist a new search/selected location to DB history + user profile */
  const saveNewLocation = useCallback(
    async (lat: number, lon: number, address?: string) => {
      setUserLocation({ latitude: lat, longitude: lon });
      setShowSuggestions(false);
      setSearchResults([]);

      try {
        const res = await saveLocationHistory({
          latitude: lat,
          longitude: lon,
          address,
        });
        if (res?.data?.success && res.data.data) {
          setLastLocation(res.data.data);
          setLocationHistory((prev) => [res.data.data, ...prev]);
        }
      } catch (err) {
        console.warn("Failed to save location history:", err);
      }
    },
    [],
  );

    const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      showToast(toastTypes.FAILED, "Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setShowPermissionModal(false);
        fitRadiusToView(lat, lon, radiusKm);
        const address = await reverseGeocode(lat, lon);
        await saveNewLocation(lat, lon, address);
        showToast(toastTypes.SUCCESS, "Location updated successfully!");
      },
      (error) => {
        console.warn("Geolocation error:", error?.message);
        showToast(
          toastTypes.WARNING,
          "Location access denied. You can set it manually using search.",
        );
        setShowPermissionModal(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const skipLocationPermission = () => {
    setShowPermissionModal(false);
  };

  const handleSearch = async (value: string) => {
    setSearchQuery(value);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!value.trim()) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      setGeocoding(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(value)}&limit=5&countrycodes=bd&viewbox=88.01%2C26.63%2C92.68%2C20.74&bounded=1`;
        const res = await fetch(url, {
          headers: { "Accept-Language": "en" },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setSearchResults(data);
          setShowSuggestions(true);
        } else {
          setSearchResults([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        console.warn("Autocomplete geocoding failed:", err);
        setSearchResults([]);
        setShowSuggestions(false);
      } finally {
        setGeocoding(false);
      }
    }, 600);
  };

  /** Called when the user clicks (or presses Enter on) a suggestion */
  const handleSelectSuggestion = async (suggestion: SearchSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

    flyTo(lat, lon, 13);
    await saveNewLocation(lat, lon, suggestion.display_name);
    setSearchQuery("");
    setDebouncedSearch("");
    fitRadiusToView(lat, lon, radiusKm);
  };

  /** Allow pressing Enter to pick the first suggestion from the dropdown */
  const handleSuggestionKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      e.preventDefault();
      handleSelectSuggestion(searchResults[0]);
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
      setSearchResults([]);
    }
  };

  /**
   * "My Location" always re-reads the device GPS so the map returns to the
   * user's real current position — even after they searched for another
   * place. Falls back to the last saved location if permission is denied.
   */
  const centerOnUser = () => {
    if (!navigator.geolocation) {
      showToast(
        toastTypes.FAILED,
        "Geolocation is not supported by your browser",
      );
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setShowPermissionModal(false);
        fitRadiusToView(lat, lon, radiusKm);
        const address = await reverseGeocode(lat, lon);
        await saveNewLocation(lat, lon, address);
        setLocating(false);
        showToast(toastTypes.SUCCESS, "Centered on your current location!");
      },
      () => {
        setLocating(false);
        showToast(
          toastTypes.WARNING,
          "Could not access your location. Showing the last saved one.",
        );
        if (userLocation) {
          flyTo(userLocation.latitude, userLocation.longitude, 14);
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleItemClick = useCallback(
    (item: any) => {
      setSelectedItem(item);
      setSelectedUser(null);
      flyTo(item.latitude, item.longitude, 13);
    },
    [flyTo],
  );

  const handleUserItemClick = useCallback(
    (item: any) => {
      setSelectedUser(item);
      setSelectedItem(null);
      flyTo(item.latitude, item.longitude, 13);
    },
    [flyTo],
  );

  /** Zoom straight to a marker from the results list and open its popup. */
  const handleFocusItem = useCallback(
    (item: any, isUser: boolean) => {
      if (isUser) {
        setSelectedUser(item);
        setSelectedItem(null);
      } else {
        setSelectedItem(item);
        setSelectedUser(null);
      }
      setListExpanded(false);
      flyTo(item.latitude, item.longitude, 15);
    },
    [flyTo],
  );

  const navigateToItem = () => {
    if (!selectedItem) return;
    if (isCustomer) {
      router.push(`/technicians/${selectedItem.id}`);
    } else {
      router.push(`/tasks/${selectedItem.id}`);
    }
  };

  return (
    <div className="relative h-[calc(100vh-5rem)] w-full">
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center space-y-5">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Enable Location Access
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Allow location access to discover{" "}
                {isCustomer
                  ? "technicians near you"
                  : "tasks available in your area"}
                . You can also set your location manually later.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={requestLocationPermission}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Share My Location
              </button>
              <button
                onClick={skipLocationPermission}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all"
              >
                Set Location Manually Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "How this map works" guide — shown on first visit, reopenable via the ? button */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    How this map works
                  </h2>
                  <p className="text-xs text-slate-500">
                    Find work &amp; people near you in a few clicks.
                  </p>
                </div>
              </div>
              <button
                onClick={closeGuide}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="space-y-3">
              {[
                "Set your location — allow GPS access or search any place in Bangladesh.",
                "Use Filters to adjust the search radius (1–50 km) and service category.",
                "Click any marker on the map to open its details popup.",
                "Expand the results panel (bottom-left) and click a name to zoom straight to it.",
              ].map((step, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-600">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-xs text-slate-600">
              {isCustomer ? (
                <p className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    Blue markers are technicians who are on duty right now.
                    Click one and hit &ldquo;View Profile &amp; Book&rdquo; to
                    hire them.
                  </span>
                </p>
              ) : (
                <>
                  <p className="flex items-start gap-2">
                    <MapIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      Amber markers are open tasks. Click one and hit
                      &ldquo;View Task &amp; Apply&rdquo; to send an
                      application.
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="mt-1 w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0" />
                    <span>
                      Violet markers are customers who posted a task — they
                      only appear while their task is still open.
                    </span>
                  </p>
                </>
              )}
            </div>

            <button
              onClick={closeGuide}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
            >
              Got it, let&apos;s explore
            </button>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            placeholder={
              lastLocation?.address
                ? `Last: ${lastLocation.address}`
                : "Search location (e.g. Dhanmondi, Dhaka)..."
            }
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => {
              setSearchFocused(true);
              if (searchResults.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => {
              setSearchFocused(false);
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            onKeyDown={handleSuggestionKeyDown}
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white shadow-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {geocoding && (
            <Loader2 className="absolute right-3.5 top-3 w-4 h-4 text-blue-500 animate-spin" />
          )}

          {showSuggestions && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl z-30">
              {searchResults.map((result, idx) => (
                <button
                  key={`${result.place_id}-${idx}`}
                  onClick={() => handleSelectSuggestion(result)}
                  className="w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left hover:bg-blue-50 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {result.display_name}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {result.type === "city" || result.type === "administrative"
                        ? "City / Region"
                        : result.type === "road"
                          ? "Street"
                          : "Place"}
                      {result.lat && result.lon
                        ? ` • ${parseFloat(result.lat).toFixed(4)}, ${parseFloat(
                            result.lon,
                          ).toFixed(4)}`
                        : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!showSuggestions &&
            !geocoding &&
            searchQuery === "" &&
            searchFocused &&
            locationHistory.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl z-30">
                <p className="px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Recent locations
                </p>
                {locationHistory.slice(0, 5).map((loc, idx) => (
                  <button
                    key={`${loc.id}-${idx}`}
                    onClick={() => {
                      flyTo(
                        Number(loc.latitude),
                        Number(loc.longitude),
                        13,
                      );
                      saveNewLocation(
                        Number(loc.latitude),
                        Number(loc.longitude),
                        loc.address ?? undefined,
                      );
                      setSearchQuery("");
                      setDebouncedSearch("");
                      fitRadiusToView(
                        Number(loc.latitude),
                        Number(loc.longitude),
                        radiusKm,
                      );
                    }}
                    className="w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left hover:bg-blue-50 transition-colors"
                  >
                    <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 truncate">
                      {loc.address || `${Number(loc.latitude).toFixed(4)}, ${Number(
                        loc.longitude,
                      ).toFixed(4)}`}
                    </span>
                  </button>
                ))}
              </div>
            )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg font-medium text-sm transition-all ${
            showFilters
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
        <button
          onClick={centerOnUser}
          disabled={locating}
          className="flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-medium text-sm transition-all disabled:opacity-60"
        >
          {locating ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          My Location
        </button>
        <button
          onClick={() => setShowGuide(true)}
          title="How this map works"
          className="flex items-center px-3 py-3 rounded-xl shadow-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowStylePicker((v) => !v)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg font-medium text-sm transition-all ${
              showStylePicker
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Base Map</span>
          </button>
          {showStylePicker && (
            <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 p-2 space-y-1 z-20">
              <p className="px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Base Map
              </p>
              {MAP_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    setMapStyleId(style.id);
                    setShowStylePicker(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    mapStyleId === style.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full shadow ${style.dot}`}
                  />
                  <span className="flex-1 text-left">{style.name}</span>
                  {mapStyleId === style.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="absolute top-20 left-4 z-10 bg-white rounded-xl shadow-xl border border-slate-200 p-5 w-72 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              Radius: {radiusKm} km
            </label>
            <input
              type="range"
              min={1}
              max={50}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              onPointerUp={() => {
                if (userLocation)
                  fitRadiusToView(
                    userLocation.latitude,
                    userLocation.longitude,
                    radiusKm,
                  );
              }}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-4 z-10 bg-white rounded-xl shadow-lg border border-slate-200 w-72 sm:w-80 overflow-hidden">
        <button
          onClick={() => setListExpanded((v) => !v)}
          className="w-full px-4 py-2.5 flex items-center gap-2 text-left hover:bg-slate-50 transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          ) : isCustomer ? (
            <Briefcase className="w-4 h-4 text-blue-600" />
          ) : (
            <MapIcon className="w-4 h-4 text-emerald-600" />
          )}
          <span className="text-sm font-medium text-slate-700 flex-1 min-w-0 truncate">
            {loading
              ? "Searching..."
              : isCustomer
                ? `${items.length} ${
                    items.length !== 1 ? "technicians" : "technician"
                  } within ${radiusKm} km`
                : `${items.length} task${items.length !== 1 ? "s" : ""} • ${nearbyUsers.length} user${nearbyUsers.length !== 1 ? "s" : ""}`}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
              listExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {listExpanded && !loading && (
          <div className="max-h-72 overflow-y-auto border-t border-slate-100 divide-y divide-slate-100">
            {isCustomer ? (
              items.length === 0 ? (
                <p className="px-4 py-4 text-xs text-slate-400">
                  No technicians found in this radius. Try increasing the
                  radius.
                </p>
              ) : (
                items.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => handleFocusItem(item, false)}
                    className="w-full px-4 py-2.5 flex items-start gap-2.5 hover:bg-blue-50 text-left transition-colors"
                  >
                    <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-slate-800 truncate">
                        {item.user?.name || "Technician"}
                      </span>
                      <span className="block text-[11px] text-slate-500 truncate">
                        {(item.skills?.length && item.skills.join(", ")) ||
                          item.categories
                            ?.map((c: any) => c.name)
                            .join(", ") ||
                          "General"}{" "}
                        • ★ {item.rating ?? 5} • {item.distanceKm} km
                      </span>
                    </span>
                  </button>
                ))
              )
            ) : (
              <>
                <p className="px-4 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Tasks
                </p>
                {items.length === 0 ? (
                  <p className="px-4 pb-2 text-xs text-slate-400">
                    No open tasks in this radius.
                  </p>
                ) : (
                  items.map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => handleFocusItem(item, false)}
                      className="w-full px-4 py-2.5 flex items-start gap-2.5 hover:bg-amber-50 text-left transition-colors"
                    >
                      <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-slate-800 truncate">
                          {item.title}
                        </span>
                        <span className="block text-[11px] text-slate-500 truncate">
                          {item.category?.name || "General"} •{" "}
                          {item.budget ? `$${item.budget}` : "Budget N/A"} •{" "}
                          {item.distanceKm} km
                        </span>
                      </span>
                    </button>
                  ))
                )}
                <p className="px-4 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  Users with open tasks
                </p>
                {nearbyUsers.length === 0 ? (
                  <p className="px-4 pb-3 text-xs text-slate-400">
                    No nearby customers with open tasks.
                  </p>
                ) : (
                  nearbyUsers.map((u) => (
                    <button
                      key={`user-${u.id}`}
                      onClick={() => handleFocusItem(u, true)}
                      className="w-full px-4 py-2.5 flex items-start gap-2.5 hover:bg-violet-50 text-left transition-colors"
                    >
                      <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-slate-800 truncate">
                          {u.name}
                        </span>
                        <span className="block text-[11px] text-slate-500 truncate">
                          {u.task?.title || "Open task"} • {u.distanceKm} km
                        </span>
                      </span>
                    </button>
                  ))
                )}
              </>
            )}
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="absolute bottom-6 right-4 z-10 bg-white rounded-xl shadow-xl border border-slate-200 p-5 w-80 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-slate-900">
                {isCustomer ? selectedItem.user?.name : selectedItem.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedItem.distanceKm} km away
                {selectedItem.address ? ` • ${selectedItem.address}` : ""}
              </p>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {isCustomer ? (
            <div className="space-y-1.5 text-xs text-slate-600">
              <p>
                <span className="font-semibold">Skills:</span>{" "}
                {selectedItem.skills?.length
                  ? selectedItem.skills.join(", ")
                  : "General"}
              </p>
              <p>
                <span className="font-semibold">Experience:</span>{" "}
                {selectedItem.experience} yrs
              </p>
              <p>
                <span className="font-semibold">Rate:</span> $
                {selectedItem.hourlyRate ?? 45}/hr
              </p>
              <p>
                <span className="font-semibold">Rating:</span> ★{" "}
                {selectedItem.rating ?? 5}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 text-xs text-slate-600">
              <p className="line-clamp-2">{selectedItem.description}</p>
              <p>
                <span className="font-semibold">Budget:</span> $
                {selectedItem.budget ?? "N/A"}
              </p>
              <p>
                <span className="font-semibold">Category:</span>{" "}
                {selectedItem.category?.name}
              </p>
              <p>
                <span className="font-semibold">Applications:</span>{" "}
                {selectedItem._count?.applications ?? 0}
              </p>
            </div>
          )}
          <button
            onClick={navigateToItem}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-all"
          >
            {isCustomer ? "View Profile & Book" : "View Task & Apply"}
          </button>
        </div>
      )}

      {selectedUser && (
        <div className="absolute bottom-6 right-4 z-10 bg-white rounded-xl shadow-xl border border-violet-200 p-5 w-80 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-slate-900">{selectedUser.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedUser.distanceKm} km away
                {selectedUser.address ? ` • ${selectedUser.address}` : ""}
              </p>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1.5 text-xs text-slate-600">
            {selectedUser.task ? (
              <>
                <p className="font-semibold text-slate-800 line-clamp-1">
                  {selectedUser.task.title}
                </p>
                <p className="line-clamp-2">{selectedUser.task.description}</p>
                <p>
                  <span className="font-semibold">Budget:</span> $
                  {selectedUser.task.budget ?? "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Category:</span>{" "}
                  {selectedUser.task.category?.name}
                </p>
                {selectedUser.task.address ? (
                  <p className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">
                      {selectedUser.task.address}
                    </span>
                  </p>
                ) : null}
                <p className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>{selectedUser.rating ?? 5} rating</span>
                </p>
              </>
            ) : (
              <p className="text-slate-400">
                This customer has no open task right now.
              </p>
            )}
          </div>
          <button
            onClick={() =>
              router.push(
                selectedUser.task?.id
                  ? `/tasks/${selectedUser.task.id}`
                  : "/map",
              )
            }
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg text-sm transition-all"
          >
            View As Task & Apply
          </button>
        </div>
      )}

      <MapCanvas
        mapRef={mapRef}
        userLocation={userLocation}
        radiusKm={radiusKm}
        items={items}
        isCustomer={isCustomer}
        mapStyle={currentMapStyle}
        onItemClick={handleItemClick}
        nearbyUsers={nearbyUsers}
        onUserItemClick={handleUserItemClick}
      />
    </div>
  );
}