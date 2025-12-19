'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const riderIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png', // Delivery truck/bike icon
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

interface MapViewProps {
  riderLocation?: [number, number];
  deliveryLocation: [number, number];
}

export default function MapView({ riderLocation, deliveryLocation }: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-full w-full bg-brand-beige/5 animate-pulse" />;

  return (
    <MapContainer
      center={riderLocation || deliveryLocation}
      zoom={15}
      scrollWheelZoom={false}
      className="h-full w-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {riderLocation && (
        <Marker position={riderLocation} icon={riderIcon}>
          <Popup>
            <div className="font-bold">Rider is here</div>
            <div className="text-xs">Moving towards you</div>
          </Popup>
        </Marker>
      )}

      <Marker position={deliveryLocation} icon={icon}>
        <Popup>
          <div className="font-bold">Delivery Destination</div>
          <div className="text-xs">Your location</div>
        </Popup>
      </Marker>

      <ChangeView center={riderLocation || deliveryLocation} zoom={15} />
    </MapContainer>
  );
}
