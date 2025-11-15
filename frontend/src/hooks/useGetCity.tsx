import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentAddress, setCurrentCity, setCurrentState } from "../redux/userSlice";
import axios from "axios";
import type { RootState } from "../redux/store";
import { setLocation,setAddress } from "../redux/mapSlice";

const useGetCity = () => {
  const dispatch = useDispatch();
  const apikey = import.meta.env.VITE_GEOAPIKEY;
  if (!apikey) {
    throw new Error("no geoapi key");
  }
    useEffect(()=>{
         
        navigator.geolocation.getCurrentPosition(async (position)=>{
            const latitude=position.coords.latitude
            const longitude=position.coords.longitude
            dispatch(setLocation({lat:latitude,lon:longitude}))
            const result = await axios.get(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apikey}`
            );
            dispatch(
              setCurrentCity(
                result.data.results[0].city || result.data.results[0].county
              )
            );
            dispatch(setCurrentState(result.data.results[0].state))
            dispatch(
              setCurrentAddress(
                result.data.results[0].address_line2 ||
                  result.data.results[0].address_line1
              )
             
            );
             console.log("city",result);
            dispatch(setAddress(result.data.results[0].address_line2));
        })
    },[])
};

export default useGetCity
