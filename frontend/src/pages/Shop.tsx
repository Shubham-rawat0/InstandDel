import axios from "axios"
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaStore,FaLocationDot } from "react-icons/fa6";
import { FaUtensils,FaArrowLeft} from "react-icons/fa";
import FoodCard from "../compponents/FoodCard";

interface Rating{
  average:number|0;
  count:number|0;
}

interface Items {
  _id: string | null;
  name: string | null;
  price: number | null;
  category: string | null;
  foodType: string | null;
  image: null | string;
  rating:Rating,
  shop:string
}

export interface Shop {
  _id: string;
  name: string;
  owner: string; 
  address: string;
  city: string;
  state: string;
  image: string;
  items: Items[];
}

function Shop() {

    const [items, setItems] = useState<Items[]>([]);
    const [shop, setShop] = useState<Shop | null>(null);
    const {shopId}=useParams()
    const navigate=useNavigate()

    const handleShop=async()=>{
        try {
             const serverUrl =
               import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
             if (!serverUrl) {
               throw new Error("no server url");
             }
            const result=await axios.get(`${serverUrl}/api/item/get-by-shop/${shopId}`,{
                withCredentials:true
            })
            setShop(result.data.shop)
            setItems(result.data.items)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
        handleShop()
    },[shopId])
  return (
    <div className="min-h-screen bg-gray-50">
        <button className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-full shadow-transition"
        onClick={()=>navigate("/")}>
            <span>Back</span><FaArrowLeft/>
        </button>
      {shop && (
        <div className="relative w-full h-64 md:h-80 lg:h-96">
          <img src={shop.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-b from-black/70 to-black/30 flex flex-col justify-center items-center text-center px-4">
            <FaStore className="text-white justify-between text-4xl mb-3  drop-shadow-md" />
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
              {shop.name}
            </h1>
            <div className="flex items-center gap-2.5">
              <FaLocationDot size={16} color="red" className="mt-2"/>
              <p className="text-lg font-medium text-gray-400 mt-2.5">
                {shop.address} - {shop.city}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="flex items-center justify-center gap-3 text-3xl font-bold mb-10 text-gray-800">
            <FaUtensils color="red"/>Our menu
        </h2>
        {items.length>0?(
            <div className="flex flex-wrap justify-center gap-8">
                {items.map((item)=>(
                    <FoodCard data={item}/>
                ))}
            </div>
        ):(<p className="text-center text-gray-500 text-lg">No items avaialble</p>)}
      </div>
    </div>
  );
}
export default Shop