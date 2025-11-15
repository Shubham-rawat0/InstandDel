import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import {FaUtensils,FaPen} from "react-icons/fa"
import Nav from "./Nav"
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import OwnerItemCard from "./OwnerItemCard";

const OwnerDashboard = () => {
  const { myShopData } = useSelector((state: RootState) => state.owner);
  const navigate=useNavigate()
    const [frontendImageUrl, setFrontendImageUrl] = useState<string>("");
   useEffect(() => {
     const frontendImage = myShopData?.image;
     if (!frontendImage) return;
     if (typeof frontendImage === "string") {
      console.log(frontendImage)
       setFrontendImageUrl(frontendImage);
     }   
   }, [myShopData]);

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
      <Nav />
      {!myShopData && (
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 ">
            <div className="flex flex-col items-center text-center">
              <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 ">
                Add your restaurant
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Join our food delivery platform and reach thousands of customers
                every day.
              </p>
              <button
                className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full sont-medium shadow-md hover:bg-orange-600 transition-colors duration-200"
                onClick={() => navigate("/create-edit-shop")}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {myShopData && (
        <div className="w-full flex flex-col items-center gap-6 px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl text-gray-900 flex items-center gap-3 text-center mt-8">
            <FaUtensils className="text-[#ff4d2d] w-8 h-8" />
            Welcome to {myShopData.name}
          </h1>
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-orange-100 hover:shadow-2xl transition-all duration-300 w-full max-w-3xl relative">
            <div
              className="absolute top-4 right-4 bg=[#ff4d2d] text-white p-2 rounded-full shadow-md hover:bg-white hover:text-black transition-colors cursor-pointer"
              onClick={() => navigate("/create-edit-shop")}
            >
              <FaPen size={25} />
            </div>
            <img
              src={frontendImageUrl}
              alt={myShopData.name ?? ""}
              className="w-full h-48 sm:h-64 object-cover"
            />
            <div className="p-4 sm:p-6 text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {myShopData.name}
              </h1>
              <p className="font-semibold text-gray-600 mb-2">
                {myShopData.city},{myShopData.state}
              </p>
              <p className="font-semibold text-gray-600 mb-2">
                {myShopData.address}
              </p>
            </div>
          </div>

          {myShopData.items?.length == 0 && (
            <div className="flex justify-center items-center p-4 sm:p-6">
              <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 ">
                <div className="flex flex-col items-center text-center">
                  <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 ">
                    Add your food items
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">
                    Share your delicious creations with our customers by adding
                    them to the menu.
                  </p>
                  <button
                    className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full sont-medium shadow-md hover:bg-orange-600 transition-colors duration-200"
                    onClick={() => navigate("/add-item")}
                  >
                    Add food
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {(myShopData?.items?.length ?? 0) > 0 && (
        <div className="flex flex-col items-center gap-4 px-4 w-full max-w-3xl">
          {myShopData?.items.map((item, index) => (
            <OwnerItemCard data={item} key={index} />
          ))}
        </div>
      )}
    </div>
  );
}
export default OwnerDashboard