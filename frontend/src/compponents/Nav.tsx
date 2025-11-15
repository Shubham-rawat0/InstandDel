import { FaLocationDot ,FaPlus} from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io"; 
import { FiShoppingCart } from "react-icons/fi"; 
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { setSearchItems, setUserData } from "../redux/userSlice";
import { TbReceipt2 } from "react-icons/tb"; 
import { useNavigate } from "react-router-dom";

function Nav() {
  const {myShopData}=useSelector((state:RootState)=>state.owner)
  const {currentCity,cartItem,userData}=useSelector((state:RootState)=>state.user)
  const [showInfo,setShowInfo]=useState(false)
  const navigate=useNavigate()
  const [showSearch, setShowSearch] = useState(false);
  const dispatch=useDispatch()
  const [query,setQuery]=useState<string>("")

    const handleSearchItems=async()=>{
      try {
        const serverUrl = import.meta.env.VITE_SERVER_URL;
        if (!serverUrl) {
          throw new Error("no server url");
        }
         const result=await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,{
          withCredentials:true
         })
         dispatch(setSearchItems(result.data))
      } catch (error) {
        console.log(error)
      }
    }

  const handleLogout=async()=>{
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    if (!serverUrl) {
      throw new Error("no server url");
    }
    try {
      const result=await axios.get(`${serverUrl}/api/auth/signout`,{
        withCredentials:true
      }      
    )
    if (result) {     
    }   
    dispatch(setUserData(null));
    } catch (error) {
      console.log(error)
    }
  }
  
useEffect(() => {
  const trimmed = query.trim();
  if (trimmed) {
    handleSearchItems();
  } else {
    dispatch(setSearchItems(null));
  }
}, [query]);


  return (
    <div className="w-full h-20 flex items-center justify-between md:justify-center gap-[30px] px-5 fixed top-0 z-9999 bg-[#fff9f6] overflow-visible">
      {showSearch && userData?.role == "user" && (
        <div className="w-[90%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-5 fixed flex top-20 left-[5%]">
          <div className="flex items-center w-[30%] overflow-hidden gap-2.5 px-2.5 border-r-2 border-gray-400">
            <FaLocationDot size={25} className=" text-[#ff4d2d]" />
            <div className="truncate w-[80%] text-gray-600">
              {currentCity ?? "Delhi"}
            </div>
          </div>
          <div className="flex items-center w-[80%] gap-2.5 ">
            <IoIosSearch size={25} className=" text-[#ff4d2d]" />
            <input
              type="text"
              placeholder="search"
              className="px-2.5 text-gray-700 outline-0 w-full "
              onChange={(e) => setQuery(e.target.value)}
              value={query}
            />
          </div>
        </div>
      )}
      <h1 className="text-3xl fonnt-bold mb-2  text-[#ff4d2d]">InstantDel</h1>
      {userData?.role == "user" && (
        <div className="md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-5 hidden md:flex">
          <div className="flex items-center w-[30%] overflow-hidden gap-2.5 px-2.5 border-r-2 border-gray-400">
            <FaLocationDot size={25} className=" text-[#ff4d2d]" />

            <div className="truncate w-[80%] text-gray-600">
              {currentCity ?? "Delhi"}
            </div>
          </div>
          <div className="flex items-center w-[80%] gap-2.5 ">
            <IoIosSearch
              size={25}
              className=" text-[#ff4d2d] md:hidden"
              onClick={() => {
                setShowSearch((prev) => !prev);
              }}
            />
            <input
              type="text"
              placeholder="search"
              className="px-2.5 text-gray-700 outline-0 w-full "
              onChange={(e) => setQuery(e.target.value)}
              value={query??""}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        {userData?.role == "user" &&
          (showSearch ? (
            <RxCross2
              size={25}
              onClick={() => {
                setShowSearch((prev) => !prev);
              }}
            />
          ) : (
            <IoIosSearch
              size={25}
              className=" text-[#ff4d2d] md:hidden"
              onClick={() => {
                setShowSearch((prev) => !prev);
              }}
            />
          ))}
        {userData?.role == "owner" ? (
          <>
            {myShopData && (
              <>
                {" "}
                <button
                  className="hidden md:flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]"
                  onClick={() => navigate("/add-item")}
                >
                  <FaPlus size={15} />
                  <span>Add food item</span>
                </button>
                <button
                  className="md:hidden flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]"
                  onClick={() => navigate("/add-item")}
                >
                  <FaPlus size={20} />
                </button>
              </>
            )}

            <div
              className="hidden md:flex items-center relative gap-2 px-3 py-1 rounded-lg cursor-pointer bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium"
              onClick={() => navigate("/my-orders")}
            >
              <TbReceipt2 size={20} />
              <span>My orders</span>
            </div>
            <div
              className="flex md:hidden items-center relative gap-2 px-3 py-1 rounded-lg cursor-pointer bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium"
              onClick={() => navigate("/my-orders")}
            >
              <TbReceipt2 size={20} />
            </div>
          </>
        ) : (
          <>
            {userData?.role == "user" && (
              <div
                className="cursor-pointer relative"
                onClick={() => navigate("/cart")}
              >
                <FiShoppingCart size={25} className=" text-[#ff4d2d]" />
                <span className="absolute right-[-9px] -top-3 text-[#ff4d2d]">
                  {cartItem.length}
                </span>
              </div>
            )}

            <button
              className="hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium "
              onClick={() => navigate("/my-orders")}
            >
              My orders
            </button>
          </>
        )}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18px] shadow-xl font-semibold cursor-pointer"
          onClick={() => {
            setShowInfo((prev) => !prev);
          }}
        >
          {userData && userData?.fullName.slice(0, 1)}
        </div>
        {showInfo && (
          <div
            className={`fixed top-20 right-2.5 ${
              userData?.role === "deliveryBoy"
                ? " md:right-[20%] lg:right-[40%] "
                : " md:right-[10%] lg:right-[25%] "
            }w-[180px] bg-white shadow-2xl rounded-xl p-5 flex flex-col gap-2.5 z-9999 `}
          >
            <div className="text-[17px] font-semibold">
              {userData && userData?.fullName}
            </div>
            {userData?.role == "user" && (
              <div
                className="md:hidden text-[#ff4d2d] font-semibold cursor-pointer"
                onClick={() => navigate("/my-orders")}
              >
                My orders
              </div>
            )}
            <div
              className="text-[#ff4d2d] cursor-pointer font-semibold"
              onClick={handleLogout}
            >
              Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Nav;
