import axios from "axios"
import { useEffect } from "react"
import { useDispatch, useSelector,  } from "react-redux";
import { setUserData } from "../redux/userSlice";
import type { RootState } from "../redux/store";

const useGetCurrentUser = () => {
    const dispatch=useDispatch()
    const {userData}=useSelector((state:RootState)=>state.user)
       const serverUrl =
          import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
        if (!serverUrl) {
          throw new Error("no server url");
        }
    useEffect(()=>{
        const fetchUser=async()=>{
           try {
             const result=await axios.get(`${serverUrl}/api/user/current`,{
                 withCredentials:true
             })
             dispatch(setUserData(result.data))
           } catch (error) {
            console.log(error)
           }
        }
        fetchUser()
    },[userData])
}
export default useGetCurrentUser