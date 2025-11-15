import Nav from "./Nav"
import {categories} from "../category.ts"
import CategoryCard from "./CategoryCard";
import {FaCircleChevronRight , FaCircleChevronLeft } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store.ts";
import FoodCard from "./FoodCard.tsx";
import Skeleton from "../Loading.tsx";
import { useNavigate } from "react-router-dom";

interface Rating {
  average: number | 0;
  count: number | 0;
}

interface Items {
  _id: string | null;
  name: string | null;
  price: number | null;
  category: string | null;
  foodType: string | null;
  image: null | string;
  rating: Rating;
  shop: string;
}

const UserDashboard = () => {
  const { currentCity, shopsInMyCity ,itemsInMyCity,searchitems} = useSelector((state: RootState) => state.user);
  const cateScrollRef = useRef<HTMLDivElement>(null!);
  const shopScrollRef = useRef<HTMLDivElement>(null!);
  const [showLeftCateButton, setShowLeftCateButton] = useState(false);
  const [showRightCateButton, setShowRightCateButton] = useState(false);
  const [showLeftShopButton, setShowLeftShopButton] = useState(false);
  const [showRightShopButton, setShowRightShopButton] = useState(false);
  const [updatedItemsList,setUpdatedItemList]=useState<Items[]>([])
  const [selectedCategory,setSelectedCategory]=useState("")
  const navigate=useNavigate()

  const handleFilterByCategory=(category:string)=>{
    if(category==="All"){
      setUpdatedItemList(itemsInMyCity)
      setSelectedCategory(category);
    }
    else{
      const filteredList=itemsInMyCity.filter(i=>i.category==category)
      setUpdatedItemList(filteredList)
      setSelectedCategory(category);
    }
  }

  useEffect(()=>{
    setUpdatedItemList(itemsInMyCity)
  },[itemsInMyCity])

  const scrollHandler = (ref: React.RefObject<HTMLDivElement>,direction: "left" | "right") => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  const updateButton = (ref: React.RefObject<HTMLDivElement>,setShowLeftCateButton: React.Dispatch<React.SetStateAction<boolean>>,setShowRightCateButton: React.Dispatch<React.SetStateAction<boolean>>) => {
    const element=ref.current
    if(element){
      setShowLeftCateButton(element.scrollLeft>0)
      setShowRightCateButton(element.scrollWidth >element.scrollLeft + element.clientWidth);
    }
  };

  useEffect(()=>{
    if(cateScrollRef.current){
      updateButton(cateScrollRef,setShowLeftCateButton,setShowRightCateButton);
      updateButton(shopScrollRef,setShowLeftShopButton,setShowRightShopButton);
      cateScrollRef.current.addEventListener("scroll",()=>{
        updateButton(cateScrollRef,setShowLeftCateButton,setShowRightCateButton)
      })
      shopScrollRef.current.addEventListener("scroll",()=>{
        updateButton(shopScrollRef,setShowLeftShopButton,setShowRightShopButton);
      })
    }
     return () => {
       cateScrollRef?.current?.removeEventListener("scroll",()=>{
         updateButton(cateScrollRef,setShowLeftCateButton,setShowRightCateButton);
       });
       shopScrollRef?.current?.removeEventListener("scroll",()=>{
        updateButton(shopScrollRef,setShowLeftShopButton,setShowRightShopButton);
       });
     };
  },[categories])

  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto">
      <Nav />

      {searchitems && searchitems.length>0 && (
        <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white shadow-md rounded-2xl mt-4">
          <h1 className="text-gray-900 text-2xl sm:text-3xl font-semibold border-b border-gray-200 pb-2">
            Search results
          </h1>
          <div className="w-full h-auto flex flex-wrap gap-6 justify-center">
            {searchitems.map((item)=>(
              <FoodCard data={item} key={item._id}/>
            ))}
          </div>
        </div>)
        }
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Food, items recommended for you
        </h1>
        <div className="w-full relative">
          {showLeftCateButton && (
            <button className="absolute -left-9  top-1/2 -translate-y-1/2 text-[#ff4d2d] bg-[#fff9f6] p-2 rounded-full shadow-lg hover:bg-[#e64528]/5 z-10">
              <FaCircleChevronLeft
                onClick={() => scrollHandler(cateScrollRef, "left")}
              />
            </button>
          )}
          <div
            className="w-full flex overflow-x-auto gap-4 pb-2"
            ref={cateScrollRef}
          >
            {categories.map((cate, index) => (
              <CategoryCard
                data={cate}
                key={index}
                onClick={() => handleFilterByCategory(cate.name)}
              />
            ))}
          </div>
          {showRightCateButton && (
            <button className="absolute -right-9  top-1/2 -translate-y-1/2 text-[#ff4d2d] bg-[#fff9f6] p-2 rounded-full shadow-lg hover:bg-[#e64528]/5 z-10">
              <FaCircleChevronRight
                onClick={() => scrollHandler(cateScrollRef, "right")}
              />
            </button>
          )}
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Best shop in {currentCity}
        </h1>
        <div className="w-full relative">
          {showLeftShopButton && (
            <button className="absolute -left-9  top-1/2 -translate-y-1/2 text-[#ff4d2d] bg-[#fff9f6] p-2 rounded-full shadow-lg hover:bg-[#e64528]/5 z-10">
              <FaCircleChevronLeft
                onClick={() => scrollHandler(shopScrollRef, "left")}
              />
            </button>
          )}
          <div
            className="w-full flex overflow-x-auto gap-4 pb-2"
            ref={shopScrollRef}
          >
            {shopsInMyCity?.map((shop, index: number) => (
              <CategoryCard
                key={index}
                data={{
                  name: shop.name ?? "unknown",
                  image: shop.image ?? "",
                }}
                onClick={()=>navigate(`/shop/${shop._id}`)}
              />
            ))}
          </div>
          {showRightShopButton && (
            <button className="absolute -right-9  top-1/2 -translate-y-1/2 text-[#ff4d2d] bg-[#fff9f6] p-2 rounded-full shadow-lg hover:bg-[#e64528]/5 z-10">
              <FaCircleChevronRight
                onClick={() => scrollHandler(shopScrollRef, "right")}
              />
            </button>
          )}
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Suggested food items for you
        </h1>
        <div className="w-full h-auto flex flex-wrap gap-5 justify-center">
          {updatedItemsList?.length > 0 ? (
            updatedItemsList?.map((item) => (
              <FoodCard key={item._id} data={item} />
            ))
          ) : selectedCategory == "" ? (
            <Skeleton />
          ) : (
            <p className=" text-gray-900 text-lg mt-10">
              There are no food items of category {selectedCategory}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
export default UserDashboard