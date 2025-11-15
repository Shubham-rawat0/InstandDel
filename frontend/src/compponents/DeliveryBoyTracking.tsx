import scooter from "../assets/scooter.png"
import home from "../assets/home.png"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, Polyline, Popup, TileLayer} from "react-leaflet";

interface CurrentOrderData {
  deliveryBoyLocation: {
    lat: number | null;
    lon: number | null;
  };
  customerLocation: {
    lat: number | null;
    lon: number | null;
  };
}

interface LatLng {
  lat: number;
  lng: number;
}

const deliveryBoyIcon = new L.Icon({
      iconUrl: scooter,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
});
const customerIcon = new L.Icon({
      iconUrl: home,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
});

function DeliveryBoyTracking({data}:{data:CurrentOrderData}) {

    const deliveryBoyLat = data.deliveryBoyLocation.lat ?? 0;
    const deliveryBoyLng = data.deliveryBoyLocation.lon ?? 0; 

    const customerLat = data.customerLocation.lat ?? 0;
    const customerLng = data.customerLocation.lon ?? 0; 

    const center = [deliveryBoyLat, deliveryBoyLng] as [number, number];
    const path: LatLng[] = [
      { lat: deliveryBoyLat, lng: deliveryBoyLng },
      { lat: customerLat, lng: customerLng },
    ];

  return (
    <div className="w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md">
      <MapContainer className="w-full h-full" center={center} zoom={16}>
        <TileLayer
          attribution='<a href="https://www.openstreetmap.org/">© OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[deliveryBoyLat, deliveryBoyLng]}
          icon={deliveryBoyIcon}
        >
          <Popup>Delivery Boy</Popup>
        </Marker>
        <Marker position={[customerLat, customerLng]} icon={customerIcon}>
          <Popup>Customer</Popup>
        </Marker>
        <Polyline positions={path} color="blue" weight={4}/>
      </MapContainer>
    </div>
  );
}
export default DeliveryBoyTracking;
