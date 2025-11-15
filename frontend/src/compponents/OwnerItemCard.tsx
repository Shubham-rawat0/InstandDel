import axios from "axios";
import { FaPen ,FaTrashAlt} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setMyShopData } from "../redux/ownerSlice";

interface Items {
  _id:string|null
  name: string | null;
  price: string | null;
  category: string | null;
  foodType: string | null;
  image: string|null;
}

const OwnerItemCard = ({ data } : { data: Items }) => {
const navigate=useNavigate()
const dispatch=useDispatch()
if (data.image==null){
  data.image = "";
}

   const handleDelete = async () => {
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    if (!serverUrl) {
      throw new Error("no server url");
    }
     try {
       const result = await axios.delete(`${serverUrl}/api/item/delete/${data._id}`, {
         withCredentials: true,
       });
       dispatch(setMyShopData(result.data))
     } catch (error) {
       console.log(error);
     }
   }

  return (
    <div className="flex bg-white rounded-lg shadow-md overflow-hidden border w-full max-w-2xl mt-4">
      <div className="w-36 h-full shrink-0 bg-gray-50">
        <img src={data.image} alt="" className="w-36 h-full object-cover" />
      </div>
      <div className="flex flex-col justify-between p-3 flex-1">
        <div>
          <h2 className="text-base font-bold text-[#ff4d2d]">{data.name}</h2>
          <p>
            <span className=" font-medium text-gray-70">Category:</span>
            {data.category}
          </p>
          <p>
            <span className=" font-medium text-gray-70">Type:</span>
            {data.foodType}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className=" font-semibold">
            Price:
            {data.price}
          </div>
          <div className="flex item-center gap-2">
            <div className="p-2 cursor-pointer rounded-full  hover:bg-[#ff4d2d]/10 text-[#ff4d2d]"
            onClick={()=>navigate(`/edit-item/${data._id}`)}>
              <FaPen size={16} />
            </div>
            <div className="p-2 cursor-pointer rounded-full  hover:bg-[#ff4d2d]/10 text-[#ff4d2d]"
            onClick={handleDelete}>
              <FaTrashAlt size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OwnerItemCard;
