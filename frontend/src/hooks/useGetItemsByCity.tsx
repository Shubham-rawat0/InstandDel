import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setItemsInMyCity } from "../redux/userSlice";
import type { RootState } from "../redux/store";

const useGetItemsByCity = () => {
  const dispatch = useDispatch();
  const { currentCity } = useSelector((state: RootState) => state.user);
  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
  if (!serverUrl) {
    throw new Error("no server url");
  }
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/item/get-by-city/${currentCity}`,
          {
            withCredentials: true,
          }
        );
        dispatch(setItemsInMyCity(result.data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchShop();
  }, [currentCity]);
};
export default useGetItemsByCity;
