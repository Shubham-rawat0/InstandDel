import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setMyOrder } from "../redux/userSlice";

const useGetMyOrders = () => {
  const dispatch = useDispatch();
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  if (!serverUrl) {
    throw new Error("no server url");
  }
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/order/my-orders`, {
          withCredentials: true,
        });
        console.log("order", result);
        dispatch(setMyOrder(result.data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchOrders();
  }, []);
};
export default useGetMyOrders;
