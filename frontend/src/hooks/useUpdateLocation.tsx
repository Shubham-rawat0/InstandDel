import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import type { RootState } from "../redux/store";

const useUpdateLocation = () => {
  const { userData } = useSelector((state: RootState) => state.user);
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  if (!serverUrl) {
    throw new Error("no server url");
  }
  const lastLatRef = useRef<number | null>(null);
  const lastLonRef = useRef<number | null>(null);

  useEffect(() => {
    if (!userData) return;

    const updateLocation = async (lat: number, lon: number) => {
      try {
        await axios.post(
          `${serverUrl}/api/user/update-location`,
          { lat, lon },
          { withCredentials: true }
        );
        console.log(" Location updated:", lat, lon);
      } catch (err) {
        console.error(" Location update failed:", err);
      }
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        if (
          lastLatRef.current === null ||
          lastLonRef.current === null ||
          Math.abs(lat - lastLatRef.current) > 0.0001 || 
          Math.abs(lon - lastLonRef.current) > 0.0001
        ) {
          lastLatRef.current = lat;
          lastLonRef.current = lon;
          updateLocation(lat, lon);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [userData]);
};

export default useUpdateLocation;
