import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../redux/store"
import { IoIosArrowRoundBack } from "react-icons/io"
import { useNavigate } from "react-router-dom"
import UserOrderCard from "../compponents/UserOrderCard"
import OwnerOrderCard from "../compponents/OwnerOrderCard"
import { useSocket } from "../context/socketContext"
import { useEffect } from "react"
import { setMyOrder, updateRealTimeOrderStatus } from "../redux/userSlice"

interface ShopOrderItems {
  createdAt: string | "";
  item: {
    image: string | "";
    name: string | "";
    price: number | 0;
    _id: string | "";
  }
  name: string | "";
  price: number | 0;
  quantity:number|0;
  _id: string | "";
}

interface UserOrderItem {
  _id: string;
  name: string;
  createdAt:string|""
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

interface OwnerOrderItem {
  _id: string;
  createdAt: string | "";
  name: string;
  price: number;
  quantity: number;
  status: string | "";
  owner: string | "";
  shop: {
    name: string | "";
    _id: string | "";
  };
  shopOrderItems: ShopOrderItems[];
  subTotal: number | 0;
  assignedDeliveryBoy: {
    mobile: string | "";
    fullName: string | "";
  };
}

interface UserMyOrder {
  _id: string;
  shopOrders: UserOrderItem[];
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

interface OwnerMyOrder {
  _id: string;
  shopOrders: OwnerOrderItem;
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

function MyOrders() {

    const {userData,myOrders}=useSelector((state:RootState)=>state.user)
    const navigate=useNavigate()
    const {socket}=useSocket()
    const dispatch=useDispatch()

    useEffect(()=>{
      if(!socket ){
        console.log("no socket")
        return
      }
      console.log("socket available")
      socket.on("newOrder",(data)=>{
        if(data.shopOrders.owner._id==userData?._id){
          dispatch(setMyOrder([data,...myOrders]))
        }
      })

      socket.on(
        "update-status",
        ({orderId,shopId,status,userId,}: {orderId: string;shopId:string;status:string;userId:string;}) => {
          console.log("listened")
          console.log("userId",userId,status)
          if (userId){
            dispatch(
              updateRealTimeOrderStatus({ orderId, shopId, status, userId })
            );
          }
        }
      );

      return()=>{
        socket?.off("newOrder")
        socket?.off("update-status")
      }
    },[socket])

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex justify-center px-4 ">
      <div className="w-full max-w-[800px] p-4">
        <div className="flex items-center gap-5 mb-6 justify-center">
          <div className="">
            <IoIosArrowRoundBack
              size={35}
              className="text-[#ff4d2d]"
              onClick={() => navigate("/")}
            />
          </div>
          <h1 className="text-2xl font-bold text-center">My orders</h1>
        </div>
        <div className="space-y-6">
          {userData?.role === "user" &&
            (myOrders as UserMyOrder[]).map((order, index) => (
              <UserOrderCard data={order} key={index} />
            ))}

          {userData?.role === "owner" &&
            (myOrders as OwnerMyOrder[]).map((order, index) => (
              <OwnerOrderCard data={order} key={index} />
            ))}
        </div>
      </div>
    </div>
  );
}
export default MyOrders

