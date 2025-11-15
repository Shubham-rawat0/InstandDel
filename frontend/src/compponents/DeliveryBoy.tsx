import { useSelector } from "react-redux";
import Nav from "./Nav"
import type { RootState } from "../redux/store";
import axios from "axios";
import { useEffect, useState } from "react";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { useSocket } from "../context/socketContext";
import ClipLoader from "react-spinners/ClipLoader";
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts"

interface Items{
  createdAt:string|"";
  item:string|"";
  name:string|"";
  price:number|0;
  quantity:number|0;
  updatedAt:string|"";
  _id:string|"";
}

interface AvailableAssignment{
  assignmentId:string|"";
  deliveryAddress:{
    text:string|"";
    latitude:number|0;
    longitude:number|0;
  };
  items:Items[];
  orderId:string|"";
  shopName:string|"";
  subTotal:number|0
}

 interface DeliveryStatsItem {
  hour: number;
  count: number;
}



export interface CurrentOrderData {
  _id: string; 
  user: {
    _id: string;
    fullName: string;
    email: string;
    mobile: string;
    location: {
      type: "Point";
      coordinates: [number, number];
    };
  };
  shopOrder: {
    _id: string;
    assignedDeliveryBoy: string;
    assignment: string;
    owner: string;
    status: string;
    subTotal: number;
    createdAt: string;
    shop: {
      _id: string;
      name: string;
      address: string;
    };
    shopOrderItems: Array<{
      _id: string;
      name: string;
      price: number;
      quantity: number;
      createdAt: string;
      updatedAt: string;
      item: {
        name: string;
        image: string;
        price: number;
        _id:string
      };
    }>;
  };
  deliveryAddress: {
    text: string;
    latitude: number;
    longitude: number;
  };
  deliveryBoyLocation: {
    lat: number | null;
    lon: number | null;
  };
  customerLocation: {
    lat: number | null;
    lon: number | null;
  };
}


const DeliveryBoy = () => {

  const {userData}=useSelector((state:RootState)=>state.user)
  const [availableAssignments,setAvailableAssignments]=useState<AvailableAssignment[]>()
  const [currentOrder,setCurrentOrder]=useState<CurrentOrderData>()
  const [showOtpBox,setShowOtpBox]=useState(false)
  const [otp,setOtp]=useState("")
  const {socket}=useSocket()
  const [loading,setLoading]=useState(false)
  const [message,setMessage]=useState("")
  const [todaydeliveries,setTodaydeliveries]=useState<DeliveryStatsItem[]>([])

  const getAssignments=async()=>{
    try {
       const serverUrl =
         import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
       if (!serverUrl) {
         throw new Error("no server url");
       }
      const result=await axios.get(`${serverUrl}/api/order/get-assignments`,{
        withCredentials:true
      })
      console.log("av",result)
      setAvailableAssignments(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
     getAssignments()
     getCurrentOrder()
     handleTodayDeliveries()
  },[])

  useEffect(()=>{
    socket?.on("newAssignment",(data)=>{
      if(data.sentTo==userData?._id){
        const {sentTo,...newData}=data
        setAvailableAssignments((prev) => [...(prev ?? []), newData]);
      }
    })

    return()=>{
      socket?.off('newAssignment')
    }
  },[socket])

  useEffect(()=>{
    if(!socket || userData?.role!="deliveryBoy") return
    let watchId:number
    if(navigator.geolocation){
     watchId= navigator.geolocation.watchPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          socket.emit("upDateLocation", {
            latitude,
            longitude,
            userId: userData._id,
          });
        },
        (error) => {
          console.log(error);
        }
      ,{
        enableHighAccuracy:true,
      });
    }
    return ()=>{
      if(watchId){
        navigator.geolocation.clearWatch(watchId)
      }
    }
  },[socket])

  const acceptOrder=async(assignmentId:string)=>{
    try {

      const serverUrl =
         import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
       if (!serverUrl) {
         throw new Error("no server url");
       }
      const result=await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`,{
        withCredentials:true
      })
      console.log("accept-order",result)
      getCurrentOrder()
    } catch (error) {
      console.log(error)
    }
  }

  const sendOtp=async()=>{
    try {
     
      const serverUrl =
         import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
       if (!serverUrl) {
         throw new Error("no server url");
       }
       setLoading(true)
       const orderId=currentOrder?._id,
       shopOrderId=currentOrder?.shopOrder._id
      const result=await axios.post(`${serverUrl}/api/order/send-delivery-otp`,
        {orderId,shopOrderId},{
        withCredentials:true
      })
       if(result.status==200){
        setShowOtpBox(true);
       }
      setLoading(false)
      
    } catch (error) {
      setLoading(false);
      console.log(error)
    }
  }

  const verifyOtp=async()=>{
    try {
      setMessage("")
      const serverUrl =
         import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
       if (!serverUrl) {
         throw new Error("no server url");
       }
       setLoading(true)
        const orderId = currentOrder?._id,       
          shopOrderId = currentOrder?.shopOrder._id;
      const result=await axios.post(`${serverUrl}/api/order/verify-delivery-otp`,
        {orderId,shopOrderId,otp},{
        withCredentials:true
      })
      setMessage(result.data.message)
      setLoading(false);
      location.reload()
    } catch (error) {
      setLoading(false);
      console.log(error)
    }
  }

  const handleTodayDeliveries=async()=>{
    try {
      const serverUrl =
         import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
       if (!serverUrl) {
         throw new Error("no server url");
       }
      const result=await axios.get(`${serverUrl}/api/order/get-today-deliveries`,{
        withCredentials:true
      })
      console.log("today",result)
      setTodaydeliveries(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getCurrentOrder=async()=>{
    try {
      const serverUrl =
        import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
      if (!serverUrl) {
        throw new Error("no server url");
      }
      const result=await axios.get(`${serverUrl}/api/order/get-current-order`,{
        withCredentials:true
      })
      console.log("current-order",result)
      setCurrentOrder(result.data)
    } catch (error) {
       console.log(error)
  }
}

    const rateperDel=50
    const totalEarning = todaydeliveries.reduce(
      (sum, d) => sum + d.count * rateperDel,
      0
    );

  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto">
      <Nav />
      <div className="w-full max-w-[800px] flex flex-col gap-5 items-center">
        <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-start gap-2 items-center w-[90%] border border-orange-100">
          <h1 className="text-xl font-bold text-[#ff4d2d] capitalize">
            Welcome, {userData?.fullName}
          </h1>
          <p className="font-light ">
            lat: {userData?.location.coordinates[1].toString()} , lon:{" "}
            {userData?.location.coordinates[0].toString()}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 w-[90%] mb-6 border border-orange-100">
          <h1 className="text-lg font-bold mb-3 text-[#ff4d2d]">
            Completed deliveries today
          </h1>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={todaydeliveries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value) => [value, "orders"]}
                labelFormatter={(label) => `${label}:00`}
              />
              <Bar dataKey="count" fill="#ff4d2d" />
            </BarChart>
          </ResponsiveContainer>
          <div className="max-w-sm mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg text-center">
            <h1 className="mb-2 text-xl font-semibold text-gray-800 ">
              Today's earning
            </h1>
            <span className="text-3xl font-bold text-green-600">
              ₹{totalEarning}
            </span>
          </div>
        </div>

        {!currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
            <h1 className="text-lg font-bold mb-4 flex items-center gap-2">
              Available orders
            </h1>

            <div className="space-y-4">
              {availableAssignments && availableAssignments?.length > 0 ? (
                availableAssignments.map((a, index) => (
                  <div
                    className="border rounded-lg p-4 flex  justify-between items-center"
                    key={index}
                  >
                    <div>
                      <p className="text font-semibold">{a.shopName}</p>
                      <p className="text-sm font-medium text-gray-700">
                        <span className="text-sm font-semibold text-gray-900">
                          Delivery address:{" "}
                        </span>
                        {a.deliveryAddress.text}
                      </p>
                      <p className="text-sm font-semibold text-gray-600">
                        {a.items.length} items | ₹{a.subTotal}
                      </p>
                    </div>
                    <button
                      className="bg-orange-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-orange-600"
                      onClick={() => acceptOrder(a.assignmentId)}
                    >
                      Accept
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No available orders</p>
              )}
            </div>
          </div>
        )}
        {currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
            <h2 className="text-lg font-bold mb-3">Current order</h2>
            <div className="border rounded-lg p-4 mb-3">
              <p className="font-semibold ">
                {currentOrder.shopOrder.shop.name}
              </p>
              <p className="text-sm font-semibold text-gray-700">
                {currentOrder.deliveryAddress.text}
              </p>
              <p className="text-sm font-semibold text-gray-700">
                {currentOrder.shopOrder.shopOrderItems.length} items | ₹
                {currentOrder.shopOrder.subTotal}
              </p>
            </div>
            <DeliveryBoyTracking
              data={{
                deliveryBoyLocation: {
                  lat: currentOrder?.user.location.coordinates[1],
                  lon: currentOrder?.user.location.coordinates[0],
                },
                customerLocation: {
                  lat: currentOrder.deliveryAddress.latitude,
                  lon: currentOrder.deliveryAddress.longitude,
                },
              }}
            />
            {!showOtpBox ? (
              <button
                className="mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200"
                onClick={sendOtp}
                disabled={loading}
              >
                {loading ? <ClipLoader /> : "Mark as delivered"}
              </button>
            ) : (
              <div className="mt-4 p-4 border rounded-xl bg-gray-50">
                <p className="text-sm font-semibold mb-2">
                  Enter OTP send to
                  <span className="font-bold">
                    {currentOrder.user.fullName}
                  </span>
                </p>
                <input
                  placeholder="Enter OTP"
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  onChange={(e) => setOtp(e.target.value)}
                />
                {message && <p className="text-center text-green-400 ">{message}</p>}
                <button
                  className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all"
                  onClick={verifyOtp}
                  disabled={loading}
                >
                  {loading ? <ClipLoader /> : "Verify otp"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default DeliveryBoy