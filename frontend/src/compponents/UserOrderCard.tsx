import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  name: string;
  price: number;
  quantity: number;
  status: string | "";
  owner: {
    _id: "" | string;
    name: string | "";
  };
  shop: {
    name: string | "";
    _id: string | "";
  };
  shopOrderItems: ShopOrderItems[];
  subTotal: number | 0;
}

interface UserMyOrder {
  _id: string;
  shopOrders: OrderItem[];
  paymentMethod: string | "";
  totalAmount: number;
  deliveryAddress: {
    text: string | "";
    latitude: number | 0;
    longitude: number | 0;
  };
  createdAt: string;
  user: string | "";
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

type ratingType=Record<string,number>

function UserOrderCard({ data }: { data: UserMyOrder }) {

  const navigate=useNavigate()
  const [selectedRating,setSelectedrating]=useState<ratingType>({})

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handelRating=async(itemId:string,rating:number)=>{
     try {
      const serverUrl = import.meta.env.VITE_SERVER_URL;
      if (!serverUrl) {
        throw new Error("no server url");
      }
      const result=await axios.post(`${serverUrl}/api/item/rating`,{itemId,rating},{
       withCredentials:true
      })
      setSelectedrating(prev=>({...prev,[itemId]:rating}))
      console.log("rating",result)
     } catch (error) {
      console.log(error)
     }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex justify-between border-b pb-2">
        <div>
          <p className="font-semibold">order #{data._id.slice(-6)}</p>
          <p className="text-sm text-gray-800">
            Date: {formatDate(data.createdAt)}
          </p>
        </div>
        <div className="text-right">
          {data.paymentMethod == "cod" ? (
            <p className="text-sm font-semibold text-gray-700 ">
              payment: {data.paymentMethod?.toUpperCase()}
            </p>
          ) : (
            <p className="text-sm font-semibold text-gray-700 ">
              payment: {data.payment ? "completed" : "pending"}
            </p>
          )}

          <p className="font-medium text-blue-600">
            <span className="font-medium text-gray-700">status: </span>
            {data.shopOrders?.[0].status}
          </p>
        </div>
      </div>
      {data.shopOrders.map((shopOrder, index) => (
        <div
          className="border rounded-lg p-3 bg-[#fffaf7] space-y-3"
          key={index}
        >
          <p>{shopOrder.shop.name}</p>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {shopOrder.shopOrderItems.map((items, index) => (
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

                {shopOrder.status === "delivered" && (
                  <div className="flex space-x-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        className={`${
                          selectedRating[items.item._id] >= star
                            ? "text-yellow-400"
                            : "text-gray-400"
                        }`}
                      onClick={()=>{handelRating(items.item._id,star);}}>
                        ★
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center border-t pt-2">
            <p className="font-semibold">₹{shopOrder.subTotal}</p>
            <p className="text-sm font-semibold text-blue-600">
              <span className="text-sm font-semibold text-gray-700">
                item status:{" "}
              </span>
              {shopOrder.status}
            </p>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center border-t pt-2">
        <p className="font-semibold">Total: ₹{data.totalAmount}</p>
        <button
          className="text-sm bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg"
          onClick={() => navigate(`/track-order/${data._id}`)}
        >
          Track order
        </button>
      </div>
    </div>
  );
}
export default UserOrderCard;
