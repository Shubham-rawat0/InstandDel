import axios from "axios";
import { useEffect, useState } from "react";
import {  useNavigate, useParams } from "react-router-dom"
import { IoIosArrowRoundBack } from "react-icons/io";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { useSocket } from "../context/socketContext";

export interface OrderData {
  _id: string;
  createdAt: string;
  paymentMethod: string;
  status: string;
  subTotal: number;
  totalAmount: number;
  deliveryAddress: {
    latitude: number;
    longitude: number;
    text: string;
  };
  shopOrders: ShopOrder[];
  user: {
    _id: string;
    createdAt: string;
    fullName: string;
    email: string;
    mobile: string;
    location: {
      coordinates: [number, number];
      type: string;
    };
  };
}

export interface ShopOrder {
  _id: string;
  createdAt: string;
  owner: string;
  shop: {
    name:string;
    _id:string
  };
  status: string;
  subTotal:number;
  assignment: string;
  assignedDeliveryBoy: DeliveryBoy;
  shopOrderItems: ShopOrderItem[];
}

export interface DeliveryBoy {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  location: {
    coordinates: [number, number];
    type: string;
  };
}

export interface ShopOrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  createdAt: string;
  item: {
    _id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    foodType: string;
    shop: string;
  };
}

interface LiveLocationEntry {
  lat: number;
  lon: number;
}

type LiveLocationMap = Record<string, LiveLocationEntry>;

function TrackOrderPage() {

    const {orderId}=useParams()
    const [currentOrder,setCurrentOrder]=useState<OrderData>()
    const navigate=useNavigate()
    const {socket}=useSocket()
    const [liveLocation, setLiveLocation] = useState<LiveLocationMap>({});

    const handleGetOrder=async()=>{
        try {
             const serverUrl =
               import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

             if (!serverUrl) {
               throw new Error("no server url");
             }
             const result = await axios.get(
               `${serverUrl}/api/order/get-order-by-id/${orderId}`,
               {
                 withCredentials: true,
               }
             );
             console.log("res",result)
             setCurrentOrder(result.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
      socket?.on("updateDeliveryLocation",({deliveryBoyId,latitude,longitude})=>{
        setLiveLocation(prev=>({...prev,[deliveryBoyId]:{lat:latitude,lon:longitude}}))
      });
    },[socket])

    useEffect(()=>{
        handleGetOrder()
    },[orderId])

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col gap-6">
      <div className="relative top-5 left-5 flex items-center gap-4 z-10 mb-2.5">
        <IoIosArrowRoundBack
          size={35}
          className="text-[#ff4d2d]"
          onClick={() => navigate("/")}
        />
        <h1 className="text-2xl font-bold md:text-center">Track order</h1>
      </div>
      {currentOrder?.shopOrders.map((shopOrder, index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-2xl shadow-md border border-orange-50 space-y-4"
        >
          <div>
            <p className="text-lg font-bold mb-2 text-[#ff4d2d]">
              {shopOrder.shop.name}
            </p>
            <p>
              <span className="font-semibold">Items: </span>
              {shopOrder.shopOrderItems.map((i) => i.name).join(",")}
            </p>
            <p>
              <span className="font-semibold">Subtotal:</span> ₹
              {shopOrder.subTotal}
            </p>
            <p>
              <span className="font-semibold">Delivery address:</span>{" "}
              {currentOrder.deliveryAddress.text}
            </p>
          </div>
          <div>
            {shopOrder.status != "delivered" ? (
              <>
                {shopOrder.assignedDeliveryBoy ? (
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold">
                      <span className="font-bold">Delivery boy : </span>
                      {shopOrder.assignedDeliveryBoy.fullName}
                    </p>
                    <p className="font-semibold">
                      <span className="font-bold">
                        Delivery boy contact no :{" "}
                      </span>
                      {shopOrder.assignedDeliveryBoy.mobile}
                    </p>
                  </div>
                ) : (
                  <p className="font-semibold">Delivery boy not assigned yet</p>
                )}
              </>
            ) : (
              <p className="text-green-600 font-semibold text-lg">Delivered</p>
            )}
          </div>
          {(shopOrder.assignedDeliveryBoy && shopOrder.status!=="delivered") && (
            <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-md">
              <DeliveryBoyTracking
                data={{
                  deliveryBoyLocation: liveLocation[shopOrder.assignedDeliveryBoy._id]||{
                    lat: shopOrder.assignedDeliveryBoy.location.coordinates[1],
                    lon: shopOrder.assignedDeliveryBoy.location.coordinates[0],
                  },
                  customerLocation: {
                    lat: currentOrder.deliveryAddress.latitude,
                    lon: currentOrder.deliveryAddress.longitude,
                  },
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
export default TrackOrderPage