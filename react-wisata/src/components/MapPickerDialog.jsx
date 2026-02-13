import { useState, useRef, useEffect, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default marker icon issue with Leaflet + bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Component to handle map click and move marker
function DraggableMarker({ position, onPositionChange }) {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latlng = marker.getLatLng();
          onPositionChange({ lat: latlng.lat, lng: latlng.lng });
        }
      },
    }),
    [onPositionChange]
  );

  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={[position.lat, position.lng]}
      ref={markerRef}
    />
  );
}

// Component to fly map to a position
function FlyToPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 13, { duration: 1 });
    }
  }, [map, position]);
  return null;
}

export default function MapPickerDialog({ visible, onHide, onSave, initialPosition, headerTitle }) {
  // Default: Kabupaten Magetan, Jawa Timur
  const defaultPos = { lat: -7.6467, lng: 111.3593 };
  const [markerPos, setMarkerPos] = useState(initialPosition || defaultPos);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [flyTarget, setFlyTarget] = useState(null);

  // Update marker when initialPosition changes (e.g. GPS auto result)
  useEffect(() => {
    if (initialPosition) {
      setMarkerPos(initialPosition);
      setFlyTarget(initialPosition);
    }
  }, [initialPosition]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { "User-Agent": "SPKWisataMagetan/1.0" } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const newPos = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        setMarkerPos(newPos);
        setFlyTarget(newPos);
      } else {
        setSearchError("Lokasi tidak ditemukan. Coba kata kunci lain.");
      }
    } catch {
      setSearchError("Gagal mencari lokasi. Periksa koneksi internet Anda.");
    } finally {
      setSearching(false);
    }
  };

  const handleSave = () => {
    onSave({
      latitude: markerPos.lat,
      longitude: markerPos.lng,
    });
  };

  const handleBatal = () => {
    onHide();
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Batal"
        icon="pi pi-times"
        severity="secondary"
        onClick={handleBatal}
      />
      <Button
        label="Simpan Lokasi"
        icon="pi pi-check"
        onClick={handleSave}
      />
    </div>
  );

  return (
    <Dialog
      header={headerTitle || "Pilih Lokasi Manual"}
      visible={visible}
      onHide={onHide}
      style={{ width: "700px", maxWidth: "95vw" }}
      footer={footer}
      modal
      draggable={false}
    >
      <div className="mb-3">
        <label className="font-bold text-sm block mb-2">
          Cari Kota / Kabupaten:
        </label>
        <div className="flex gap-2">
          <InputText
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Contoh: Magetan, Jawa Timur"
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            icon={searching ? "pi pi-spin pi-spinner" : "pi pi-search"}
            label="Cari"
            onClick={handleSearch}
            disabled={searching}
          />
        </div>
        {searchError && (
          <small className="p-error block mt-1">{searchError}</small>
        )}
      </div>

      <div className="mb-3 text-sm text-600">
        <i className="pi pi-info-circle mr-1"></i>
        Klik pada peta atau geser penanda (marker) ke lokasi Anda.
      </div>

      <div style={{ height: "400px", width: "100%", borderRadius: "8px", overflow: "hidden", border: "1px solid #dee2e6" }}>
        <MapContainer
          center={[markerPos.lat, markerPos.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker position={markerPos} onPositionChange={setMarkerPos} />
          {flyTarget && <FlyToPosition position={flyTarget} />}
        </MapContainer>
      </div>

      <div className="mt-3 p-2 surface-100 border-round text-sm">
        <strong>Koordinat terpilih:</strong>{" "}
        Lat: {markerPos.lat.toFixed(6)}, Lng: {markerPos.lng.toFixed(6)}
      </div>
    </Dialog>
  );
}
