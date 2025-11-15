import { FaMinus, FaPlus } from "react-icons/fa";
import { CiTrash } from "react-icons/ci";
import { useDispatch } from "react-redux";
import { removeFromCart, updateQuantity } from "../redux/userSlice";

interface CartItem {
  _id: string | null;
  name: string | null;
  price: number | null;
  category: string | null;
  foodType: string | null;
  image: string | null;
  shop:  string | null ;
  quantity: number | 0;
}

function CartItemCard({ data }:{data:CartItem}) {

  const dispatch=useDispatch()

  const handleInc = ( id:string, currentQty:number ) => {
    dispatch(updateQuantity({_id:id,quantity:currentQty+=1}))
  };

  const handleDec = (id: string, currentQty: number) => {
    if(currentQty>1){
    dispatch(updateQuantity({ _id: id, quantity: (currentQty -= 1) }));}
  };

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow border ">
      <div className="flex items-center gap-4">
        <img
          src={data.image ?? ""}
          alt=""
          className="w-20 h-20 object-cover rounded-lg border"
        />
        <div>
          <h1 className="font-medium text-gray-800">{data.name}</h1>
          <p className="text-sm text-gray-700">
            ₹{data.price} x {data.quantity}
          </p>
          <p className="font-bold text-gray-900">
            ₹{(data.price ?? 0) * data.quantity}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer"
          onClick={() => handleDec(data._id??"", data.quantity)}
        >
          <FaMinus size={12} />
        </button>
        <span>{data.quantity}</span>
        <button
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer"
          onClick={() => handleInc(data._id??"", data.quantity)}
        >
          <FaPlus size={12} />
        </button>
        <button className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
        onClick={()=>dispatch(removeFromCart(data._id??""))}>     
          <CiTrash size={20} />
        </button>
      </div>
    </div>
  );
}
export default CartItemCard;
