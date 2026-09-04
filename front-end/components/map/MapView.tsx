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
  getMapTechnicians,
  getMapTasks,
  saveUserLocation,
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

const DEFAULT_CENTER = { latitude: 23.8103, longitude: 90.4125, zoom: 12 };

/** Base-map styles the user can switch between (vector + raster). */
const STYLE_STORAGE_KEY = "fixitnow:map-style";

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
}: {
  mapRef: RefObject<MapRef | null>;
  userLocation: { latitude: number; longitude: number } | null;
  radiusKm: number;
  items: MapMarkerItem[];
  isCustomer: boolean;
  mapStyle: string | StyleSpecification;
  onItemClick: (item: MapMarkerItem) => void;
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
            id="radius-fill"
            type="fill"
            paint={{ "fill-color": "#2563eb", "fill-opacity": 0.12 }}
          />
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
  const [geocoding, setGeocoding] = useState(false);
  const [mapStyleId, setMapStyleId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(STYLE_STORAGE_KEY);
      if (saved && MAP_STYLES.some((s) => s.id === saved)) return saved;
    }
    return MAP_STYLES[0].id;
  });
  const [showStylePicker, setShowStylePicker] = useState(false);

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
      const res = isCustomer
        ? await getMapTechnicians({
            ...base,
            q: debouncedSearch || undefined,
          })
        : await getMapTasks(base);
      if (res?.data?.success) {
        setItems(res.data.data.data || []);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Failed to fetch map items:", err);
      setItems([]);
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

  useEffect(() => {
    if (!user.latitude || !user.longitude) {
      setShowPermissionModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      showToast(toastTypes.FAILED, "Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(loc);
        setShowPermissionModal(false);
        fitRadiusToView(loc.latitude, loc.longitude, radiusKm);
        try {
          await saveUserLocation(loc);
        } catch {
          // non-blocking; local state already updated
        }
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

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!value.trim()) return;
    searchTimerRef.current = setTimeout(async () => {
      setGeocoding(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(value)}&limit=1`;
        const res = await fetch(url, {
          headers: { "Accept-Language": "en" },
        });
        const data = await res.json();
        if (data?.length) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          flyTo(lat, lon, 13);
        }
      } catch (err) {
        console.warn("Geocoding failed:", err);
      } finally {
        setGeocoding(false);
      }
    }, 600);
  };

  const centerOnUser = () => {
    if (userLocation) {
      flyTo(userLocation.latitude, userLocation.longitude, 14);
    } else {
      requestLocationPermission();
    }
  };

  const handleItemClick = useCallback(
    (item: any) => {
      setSelectedItem(item);
      flyTo(item.latitude, item.longitude, 13);
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

      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search location (e.g. Dhanmondi, Dhaka)..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white shadow-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {geocoding && (
            <Loader2 className="absolute right-3.5 top-3 w-4 h-4 text-blue-500 animate-spin" />
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
          className="flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-medium text-sm transition-all"
        >
          <Navigation className="w-4 h-4" />
          My Location
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

      <div className="absolute bottom-6 left-4 z-10 bg-white rounded-xl shadow-lg border border-slate-200 px-4 py-2.5 flex items-center gap-2">
        {loading ? (
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
        ) : isCustomer ? (
          <Briefcase className="w-4 h-4 text-blue-600" />
        ) : (
          <MapIcon className="w-4 h-4 text-emerald-600" />
        )}
        <span className="text-sm font-medium text-slate-700">
          {loading
            ? "Searching..."
            : `${items.length} ${
                isCustomer ? "technician" : "task"
              }${items.length !== 1 ? "s" : ""} found within ${radiusKm} km`}
        </span>
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

      <MapCanvas
        mapRef={mapRef}
        userLocation={userLocation}
        radiusKm={radiusKm}
        items={items}
        isCustomer={isCustomer}
        mapStyle={currentMapStyle}
        onItemClick={handleItemClick}
      />
    </div>
  );
}