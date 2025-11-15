import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import { setMyShopData } from "../redux/ownerSlice";
import ClipLoader from "react-spinners/ClipLoader";

interface Items {
  _id: string | null;
  name: string | null;
  price: string | null;
  category: string | null;
  foodType: string | null;
  image: string | null;
}

function EditItem() {
  const navigate = useNavigate();
   const [currentItem, setCurrentItem] = useState<Items | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [frontendImage, setFrontendImage] = useState<null | string>("");
  const [backendImage, setBackendImage] = useState<File | null>(null);
  const dispatch = useDispatch();
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("");
  const [loading,setLoading]=useState(false)
 
    const {itemId}=useParams()
  const categories = [
    "Snacks",
    "Main Course",
    "Desserts",
    "Pizza",
    "Burgers",
    "Sandwiches",
    "South Indian",
    "North Indian",
    "Chinese",
    "Fast Food",
    "Others",
  ];

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true)
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("foodType", foodType);
      formData.append("price", price.toString());
      if (backendImage) {
        formData.append("image", backendImage);
      }
      const serverUrl = import.meta.env.VITE_SERVER_URL;
      if (!serverUrl) {
        throw new Error("no server url");
      }
      const result = await axios.post(
        `${serverUrl}/api/item/edit-item/${itemId}`,
        formData,
        {
          withCredentials: true,
        }
      );
      dispatch(setMyShopData(result.data));
      setLoading(false)
      navigate("/")
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(()=>{
    const handleGetItemById=async ()=>{
        try {
             const serverUrl = import.meta.env.VITE_SERVER_URL;
             if (!serverUrl) {
               throw new Error("no server url");
             }
             const result=await axios.get(`${serverUrl}/api/item/get-by-id/${itemId}`,
                {withCredentials:true}
             )
             setCurrentItem(result.data)
        } catch (error) {
            console.log(error)
        }
    }
    handleGetItemById()
  },[itemId])
  useEffect(()=>{
    setName(currentItem?.name ||"")
    setPrice(Number(currentItem?.price) || 0);
    setCategory(currentItem?.category || "");
    setFoodType(currentItem?.foodType ||"")
    setFrontendImage(currentItem?.image ?? "");
  },[currentItem])



  return (
    <div className="flex justify-center flex-col items-center p-6 bg-linear-to-br from-orange-50 relative to-white min-h-screen">
      <div className="absolute top-5 left-5 z-10 mb-2.5">
        <IoIosArrowRoundBack
          size={35}
          className="text-[#ff4d2d]"
          onClick={() => navigate("/")}
        />
      </div>
      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <FaUtensils className="text-[#ff4d2d] w-16 h-16" />
          </div>
          <div className="text-2xl font-bold text-gray-900">Edit item</div>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medeium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter item name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => {
                setName(e.target.value);
              }}
              value={name}
            />
          </div>
          <div>
            <label className="block text-sm font-medeium text-gray-700 mb-1">
              Item image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {frontendImage && (
              <div className="mt-4">
                <img
                  src={frontendImage}
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medeium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => {
                setPrice(Number(e.target.value));
              }}
              value={price}
            />
          </div>
          <div>
            <label className="block text-sm font-medeium text-gray-700 mb-1">
              Select category
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => {
                setCategory(e.target.value);
              }}
              value={category}
            >
              <option value="">select category</option>
              {categories.map((cat, index) => (
                <option value={cat} key={index}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medeium text-gray-700 mb-1">
              Select food type
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => {
                setFoodType(e.target.value);
              }}
              value={foodType}
            >
              <option value="veg">Veg</option>
              <option value="non-veg">Non-veg</option>
            </select>
          </div>

          <button
            className="w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200"
            type="submit"
            disabled={loading}
          >
            {loading ? <ClipLoader size={20} color="white" /> : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
export default EditItem;
