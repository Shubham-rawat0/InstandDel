import { useState } from "react";
import { FaLeaf,FaDrumstickBite ,FaStar,FaMinus,FaPlus,FaShoppingCart} from "react-icons/fa";
import {FaRegStar} from  "react-icons/fa6"
import { useDispatch, useSelector } from "react-redux";
import { setAddToCart } from "../redux/userSlice";
import type { RootState } from "../redux/store";

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

function FoodCard({ data }:{data:Items}) {

    const [quantity, setQuantity] = useState(0);
    const dispatch=useDispatch()
    const {cartItem}=useSelector((state:RootState)=>state.user)

    const renderStars = (rating: number) => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        stars.push(
          i <= rating ? (
            <FaStar className="text-yellow-500 text-lg" />
          ) : (
            <FaRegStar className="text-yellow-500 text-lg" />
          )
        );
      }
      return stars;
    };

    const handleInc = () => {
      const newQty = quantity + 1;
      setQuantity(newQty)
    };

    const handleDec = () => {
        if(quantity>0){
const newQty = quantity - 1;
setQuantity(newQty);       }
      
    };

  return (
    <div className="w-[250px] rounded-2xl border-2 border-[#ff4d2d] bg-white shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="relative w-full h-[170px] flex justify-center items-center bg-white">
        <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow">
          {data.foodType === "veg" ? (
            <FaLeaf className="text-green-600 text-lg" />
          ) : (
            <FaDrumstickBite className="text-red-600 text-lg" />
          )}
        </div>

        <img
          src={data.image ?? ""}
          alt=""
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      <div className="flex-1 flex flex-col p-4">
        <h1 className="font-semibold text-gray-900 text-base truncate">
          {data.name}
        </h1>
        <div className="flex items-center gap-1 mt-1">
          {renderStars(data.rating?.average || 0)}
          <span>{data.rating?.count}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto p-4">
        <span className="font-bold text-gray-900 text-lg"> ₹{data.price}</span>
        <div className="flex items-center border rounded-full overflow-hidden shadow-sm">
          <button
            className="px-2 py-1 hover:bg-gray-100 transition cursor-pointer"
            onClick={handleDec}
          >
            <FaMinus size={12} />
          </button>
          <span>{quantity}</span>
          <button
            className="px-2 py-1 hover:bg-gray-100 transition cursor-pointer"
            onClick={handleInc}
          >
            <FaPlus size={12} />
          </button>
          <button
            className={`px-3 py-2 ${
              cartItem.some((i) => i._id == data._id)
                ? "bg-gray-800"
                : "bg-[#ff4d2d]"
            } text-white cursor-pointer transition-colors`}
            onClick={() => {
              quantity > 0
                ? dispatch(
                    setAddToCart({
                      _id: data._id,
                      name: data.name,
                      price: data.price ?? 0,
                      category: data.category,
                      foodType: data.foodType,
                      image: data.image,
                      shop: data.shop,
                      quantity: quantity,
                    })
                  )
                : null;
            }}
          >
            <FaShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
export default FoodCard;
