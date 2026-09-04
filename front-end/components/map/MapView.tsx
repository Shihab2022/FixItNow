"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
} from "lucide-react";
import { Map, Marker, NavigationControl } from "react-map-gl/maplibre";
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

const DEFAULT_CENTER = { latitude: 23.8103, longitude: 90.4125, zoom: 12 };
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
export default function MapView({ user }: { user: User }) {
  const router = useRouter();
  const [center, setCenter] = useState({
    latitude: user.latitude ?? DEFAULT_CENTER.latitude,
    longitude: user.longitude ?? DEFAULT_CENTER.longitude,
  });
  const [zoom, setZoom] = useState(DEFAULT_CENTER.zoom);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [geocoding, setGeocoding] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCustomer = user.role === "CUSTOMER";

  const fetchItems = useCallback(async () => {
    if (!userLocation) return;
    setLoading(true);
    try {
      const params = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radiusKm,
        categoryId: selectedCategory || undefined,
        q: searchQuery || undefined,
      };
      const res = isCustomer
        ? await getMapTechnicians(params)
        : await getMapTasks({
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            radiusKm,
            categoryId: selectedCategory || undefined,
          });
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
  }, [userLocation, radiusKm, selectedCategory, searchQuery, isCustomer]);

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
        setCenter(loc);
        setShowPermissionModal(false);
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
          setCenter({ latitude: lat, longitude: lon });
          setZoom(13);
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
      setCenter(userLocation);
      setZoom(14);
    } else {
      requestLocationPermission();
    }
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setCenter({ latitude: item.latitude, longitude: item.longitude });
  };

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

      <Map
        initialViewState={{
          latitude: center.latitude,
          longitude: center.longitude,
          zoom,
        }}
        mapStyle={MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
        onMove={(evt) => {
          setCenter({
            latitude: evt.viewState.latitude,
            longitude: evt.viewState.longitude,
          });
          setZoom(evt.viewState.zoom);
        }}
      >
        <NavigationControl position="bottom-right" />
        {userLocation && (
          <Marker
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
          >
            <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg ring-4 ring-blue-600/20" />
          </Marker>
        )}
        {items.map((item) => (
          <Marker
            key={item.id}
            latitude={item.latitude}
            longitude={item.longitude}
            onClick={() => handleItemClick(item)}
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
        ))}
      </Map>
    </div>
  );
}