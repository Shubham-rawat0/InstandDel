import axios from "axios";
import { MdPhone } from "react-icons/md"; 
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../redux/userSlice";
import { useState } from "react";

interface ShopOrderItems {
  createdAt: string | "";
  item: {
    image: string | "";
    name: string | "";
    price: number | 0;
    _id: string | "";
  };
  name: string | "";
  price: number | 0;
  quantity: number | 0;
  _id: string | "";
}

interface OrderItem {
  _id: string;
  createdAt: string | "";
  name: string;
  price: number;
  quantity: number;
  status: string | "";
  owner: string|""
  shop: {
    name: string | "";
    _id: string | "";
  };
  shopOrderItems: ShopOrderItems[];
  subTotal: number | 0;
  assignedDeliveryBoy:{
    fullName:string|"";
    mobile:string|""
  }
}

interface OwnerMyOrder {
  _id: string;
  shopOrders: OrderItem;
  totalAmount: number;
  deliveryAddress: {
    text: string | "";
    latitude: number | 0;
    longitude: number | 0;
  };
  paymentMethod: string | "";
  createdAt: string;
  user: {
    _id: string;
    fullName: string;
    address: string;
    email: string;
    mobile: string;
  };
  payment: {
    type: Boolean;
    default: false;
  };
  razorpayOrderId: {
    type: String;
    default: "";
  };
  razorpayPaymentId: {
    type: String;
    default: "";
  };
}

interface AvilableBoys{
  fullName:string;
  mobile:string;
  latitude:Number;
  longitude:Number;
  _id:string
}

function OwnerOrderCard({ data }: { data: OwnerMyOrder }) {
  const dispatch=useDispatch()
  const [avilableBoys,setAvailableBoys]=useState<AvilableBoys[]>()
  
  const handleUpdateStatus=async(orderId:string,shopId:string,status:string)=>{
    try {
      const serverUrl =
        import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
      if (!serverUrl) {
        throw new Error("no server url");
      }
      const result=await axios.post(`${serverUrl}/api/order/update-status/${orderId}/${shopId}`,{status},{
        withCredentials:true
      })
      console.log("db",result)
      setAvailableBoys(result.data.availableBoys)
      console.log("availableBoys",avilableBoys)
      dispatch(updateOrderStatus({orderId,shopId,status}))
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {data.user.fullName}
        </h2>
        <p className="text-sm text-gray-700">{data.user.email}</p>
        <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          <MdPhone />
          <span>{data.user.mobile}</span>
        </p>
        {data.paymentMethod === "online" ? (
          <p className=" mt-1 font-semibold text-sm text-gray-700">
            payment : {data.payment ? "completed" : "pending"}
          </p>
        ) : (
          <p className=" mt-1 font-semibold text-sm text-gray-700">"cod</p>
        )}
      </div>
      <div className="flex items-start flex-col gap-2 text-gray-700 text-sm">
        <p>{data.deliveryAddress.text}</p>
        <p className="text-sm text-gray-600">
          Lat: {data.deliveryAddress.latitude} , Lon:
          {data.deliveryAddress.longitude}
        </p>
      </div>

      <div>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {data.shopOrders.shopOrderItems?.map((items, index) => (
            <div
              key={index}
              className="shrink-0 w-40 rounded-lg p-1 bg-white border"
            >
              <img
                src={items.item.image}
                alt=""
                className="w-full h-24 object-cover rounded "
              />
              <p className="text-sm font-semibold mt-1">{items.name}</p>
              <p className="text-xs text-gray-500">
                ₹{items.price} x {items.quantity}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
        <span className="text-sm">
          Status :
          <span className="font-semibold capitalize text-[#ff4d2d]">
            {data.shopOrders.status}
          </span>
        </span>

        <select
          className="rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-2 border-[#ff4d2d] text-[#ff4d2d]"
          onChange={(e) => {
            handleUpdateStatus(
              data._id,
              data.shopOrders.shop._id,
              e.target.value
            );
          }}
        >
          <option value="">change</option>
          <option value="pending">pending</option>
          <option value="preparing">preparing</option>
          <option value="out of delivery">out of delivery</option>
        </select>
      </div>
      {data.shopOrders.status === "out of delivery" && (
        <div className="mt-3 p-2 border rounded-lg text-sm bg-orange-50">
          {data.shopOrders.assignedDeliveryBoy ? (
            <p>Assigned delivery boy</p>
          ) : (
            <p>Available delivery boys</p>
          )}
          {avilableBoys && avilableBoys.length > 0 ? (
            avilableBoys.map((b, index) => (
              <div key={index} className="text-gray-700">
                {b.fullName} - {b.mobile.toString()}
              </div>
            ))
          ) : data.shopOrders.assignedDeliveryBoy ? (
            <div>
              {data.shopOrders.assignedDeliveryBoy.fullName} -{" "}
              {data.shopOrders.assignedDeliveryBoy.mobile}
            </div>
          ) : (
            <div className="text-gray-900">
              No available delivery boys right now
            </div>
          )}
        </div>
      )}

      <div className="text-right font-bold text-gray-800 text-sm">
        Total : ₹{data.shopOrders.subTotal}
      </div>
    </div>
  );
}
export default OwnerOrderCard;
