import axios from "axios";
import { useEffect } from "react";
import { useDispatch,  } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";


const useGetMyShop = () => {
  const dispatch = useDispatch();
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  if (!serverUrl) {
    throw new Error("no server url");
  }
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-my`, {
          withCredentials: true,
        });
        dispatch(setMyShopData(result.data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchShop()
  }, []);
};
export default useGetMyShop;
