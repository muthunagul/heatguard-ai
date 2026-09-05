import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import type { RiskMapData } from '../types';
import { RISK_COLORS } from '../utils/risk';

function MapClickHandler({ onClick }: { onClick?: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function RiskMapInner({ data, onLocationClick }: { data: RiskMapData; onLocationClick?: (lat: number, lon: number) => void }) {
  const center = [data.center.latitude, data.center.longitude] as [number, number];

  return (
    <MapContainer center={center} zoom={11} style={{ height: 320, width: '100%' }} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onClick={onLocationClick} />
      {data.cells.map((cell, i) => (
        <CircleMarker
          key={`${cell.latitude}-${cell.longitude}-${i}`}
          center={[cell.latitude, cell.longitude]}
          radius={cell.latitude === data.center.latitude && cell.longitude === data.center.longitude ? 10 : 6}
          pathOptions={{
            color: RISK_COLORS[cell.category],
            fillColor: RISK_COLORS[cell.category],
            fillOpacity: 0.6,
            weight: cell.latitude === data.center.latitude ? 3 : 1,
          }}
        >
          <Popup>
            <strong>{cell.category}</strong><br />
            Score: {cell.score}/100<br />
            <em>Modeled risk</em>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
