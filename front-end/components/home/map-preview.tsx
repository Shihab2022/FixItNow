"use client";

import { useMemo } from "react";
import {
  Map,
  Marker,
  NavigationControl,
  Source,
  Layer,
  AttributionControl,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Briefcase, MapPin, Wrench } from "lucide-react";

/** Demo viewport centred on Dhaka (same default as the real map). */
const CENTER = { latitude: 23.8103, longitude: 90.4125 };
const RADIUS_KM = 6;

const SAMPLE_TECHNICIANS = [
  { id: "t1", latitude: 23.8215, longitude: 90.3985 },
  { id: "t2", latitude: 23.7935, longitude: 90.4245 },
  { id: "t3", latitude: 23.8335, longitude: 90.4175 },
  { id: "t4", latitude: 23.8005, longitude: 90.3915 },
];

const SAMPLE_TASKS = [
  { id: "j1", latitude: 23.8245, longitude: 90.4325 },
  { id: "j2", latitude: 23.7955, longitude: 90.4025 },
];

/** Build a GeoJSON polygon approximating a radius boundary around a point. */
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
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "Polygon" as const, coordinates: [points] },
  };
}

/**
 * Marketing preview of the FixItNow map: same MapLibre stack as the real map,
 * with sample on-duty technicians (blue), open tasks (amber), a pulsing
 * "you are here" dot and a dashed search-radius ring. Scroll-zoom is disabled
 * so the page keeps scrolling naturally.
 */
export default function MapPreview() {
  const circle = useMemo(
    () => buildRadiusCircle(CENTER.latitude, CENTER.longitude, RADIUS_KM),
    [],
  );

  return (
    <div className="relative h-full w-full">
      <Map
        initialViewState={{
          latitude: CENTER.latitude,
          longitude: CENTER.longitude,
          zoom: 11.4,
        }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
        scrollZoom={false}
        minZoom={3}
        maxZoom={17}
        reuseMaps
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <AttributionControl compact />

        <Source id="preview-radius" type="geojson" data={circle}>
          <Layer
            id="preview-radius-line"
            type="line"
            paint={{
              "line-color": "#2563eb",
              "line-width": 2.5,
              "line-opacity": 0.9,
              "line-dasharray": [4, 3],
            }}
          />
        </Source>

        {SAMPLE_TECHNICIANS.map((tech) => (
          <Marker
            key={tech.id}
            latitude={tech.latitude}
            longitude={tech.longitude}
            anchor="center"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-lg">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
          </Marker>
        ))}

        {SAMPLE_TASKS.map((task) => (
          <Marker
            key={task.id}
            latitude={task.latitude}
            longitude={task.longitude}
            anchor="center"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-amber-500 shadow-lg">
              <Wrench className="h-4 w-4 text-white" />
            </div>
          </Marker>
        ))}

        <Marker latitude={CENTER.latitude} longitude={CENTER.longitude} anchor="center">
          <div className="relative flex items-center justify-center">
            <span className="absolute inline-flex h-6 w-6 animate-ping rounded-full bg-blue-400 opacity-60" />
            <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow" />
          </div>
        </Marker>
      </Map>

      {/* Floating info chips */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-md backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          4 technicians on duty
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-md backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          2 open tasks nearby
        </span>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-md">
          <MapPin className="h-3 w-3" />
          {RADIUS_KM} km search radius
        </span>
      </div>
    </div>
  );
}