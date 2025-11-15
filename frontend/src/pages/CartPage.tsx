import { IoIosArrowRoundBack } from "react-icons/io"
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../redux/store";
import CartItemCard from "../compponents/CartItemCard";

function CartPage() {

    const navigate=useNavigate()
    const {cartItem,totalAmount}=useSelector((state:RootState)=>state.user)

  return (
    <div className="min-h-screen bg-[#fff9f6] flex justify-center p-6">
      <div className="w-full max-w-[800px]">
        <div className="flex items-center gap-5 mb-6 justify-center">
          <div className="">
            <IoIosArrowRoundBack
              size={35}
              className="text-[#ff4d2d]"
              onClick={() => navigate("/")}
            />
          </div>
          <h1 className="text-2xl font-bold text-center">Your cart</h1>
        </div>
        {cartItem.length == 0 ? (
          <p className="text-xl font-light text-center">
            So empty. Start by adding items to the cart.
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {cartItem?.map((item, index) => (
                <CartItemCard data={item} key={index} />
              ))}
            </div>
            <div className="mt-6 bg-white p-4 rounded-xl shadow flex justify-between items-center border">
              <h1 className="text-lg font-semibold">Total amount</h1>
              <span className="text-xl font-bold ">₹{totalAmount}</span>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="bg-[#ff4d2d] text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-[#e64526] transition cursor-pointer"
                onClick={()=>navigate("/checkout")}
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default CartPage