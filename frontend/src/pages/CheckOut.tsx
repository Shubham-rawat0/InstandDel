import { IoIosArrowRoundBack } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { FaCreditCard } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaLocationDot, FaMobileScreenButton } from "react-icons/fa6";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import "leaflet/dist/leaflet.css";
import { setAddress, setLocation } from "../redux/mapSlice";
import { useEffect, useState, useCallback } from "react";
import { MdDeliveryDining } from "react-icons/md";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import { setMyOrder } from "../redux/userSlice";

interface RecenterProps {
  lat: number;
  lon: number;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOrder {
  id: string; 
  amount: number;
  currency: string; 
}

function Recenter({ lat, lon }: RecenterProps) {
  const map = useMap();

  useEffect(() => {
    if (lat && lon) {
      map.setView([lat, lon], 16, { animate: true });
    }
  }, [lat, lon, map]);

  return null;
}

function CheckOut() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { location, address } = useSelector((state: RootState) => state.map);
  const { cartItem, totalAmount} = useSelector(
    (state: RootState) => state.user
  );
  const [addressInput, setAddressInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const dispatch = useDispatch();
  const deliveryFee = totalAmount > 500 ? 0 : 40;
  const amountWithDelFees = totalAmount + deliveryFee;

    const position: LatLngExpression = [location?.lat ?? 0, location?.lon ?? 0];
  const onDragEnd = useCallback((event: L.DragEndEvent) => {
    const marker = event.target as L.Marker;
    const { lat, lng } = marker.getLatLng();
    dispatch(setLocation({ lat, lon: lng }));
    getAddressByLatLang(lat, lng);
  }, []);

  const getAddressByLatLang = async (lat: number, lon: number) => {
    try {
      const apikey = import.meta.env.VITE_GEOAPIKEY;
      if (!apikey) throw new Error("No GeoAPI key");
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${apikey}`
      );
      dispatch(setAddress(result?.data.results[0]?.address_line2 ?? ""));
    } catch (error) {
      console.log(error);
    }
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      dispatch(setLocation({ lat, lon }));
      getAddressByLatLang(lat, lon);
    });
  };

  const getLatLongByAddress = async () => {
    try {
      const apikey = import.meta.env.VITE_GEOAPIKEY;
      if (!apikey) throw new Error("No GeoAPI key");
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          addressInput
        )}&apiKey=${apikey}`
      );
      const { lat, lon } = result.data.features[0].properties;
      dispatch(setLocation({ lat, lon }));
    } catch (error) {
      console.log(error);
    }
  };

  const fetchOrders = async () => {
    try {
      const serverUrl =
        import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
      const orders = await axios.get(`${serverUrl}/api/order/my-orders`, {
        withCredentials: true,
      });
      dispatch(setMyOrder(orders.data));
      setLoading(false);
      if (orders.status == 200) {
        navigate("/order-placed");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const openRazorPayWindow=(orderId:string,razorOrder:RazorpayOrder)=>{
    const key_id = import.meta.env.VITE_RAZOR_KEY_ID;
    if(!key_id){
      throw new Error("no rzp key")
    }
    const serverUrl =
      import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

    if (!serverUrl) {
      throw new Error("no server url");
    }
    const options = {
      key: key_id,
      amount: razorOrder.amount,
      currency: "INR",
      name: "InstantDel",
      description: "Food delivery website",
      order_id: razorOrder.id,
      handler: async function (response: RazorpayResponse) {
        try {
          setLoading(false)
          const result = await axios.post(
            `${serverUrl}/api/order/verify-payment`,
            {
              razorpay_payment_id: response.razorpay_payment_id,
              orderId,
            },
            { withCredentials: true }
          );
          if (result.status == 200) {
            fetchOrders();
          }
        } catch (error) {
          setLoading(false)
          console.log(error);
        }
      },
    };
    
   const rzp= new window.Razorpay(options)
   rzp.open()
  }

  const handlePlaceOrder = async () => {
    try {
      const serverUrl =
        import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
      setLoading(true);
      const result=await axios.post(
        `${serverUrl}/api/order/place-order`,
        {
          paymentMethod,
          deliveryAddress: {
            text: addressInput,
            latitude: location?.lat,
            longitude: location?.lon,
          },
          totalAmount:amountWithDelFees,
          cartItem,
        },
        { withCredentials: true }
      );

      if(paymentMethod=="cod"){
        fetchOrders()
      }
      else{
        const orderId=result.data.orderId
        const razorOrder=result.data.razorOrder
        openRazorPayWindow(orderId,razorOrder)
      }          
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    setAddressInput(address ?? "");
  }, [address]);

  return (
    <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-6">
      <div className="absolute left-5 z-10 top-5">
        <IoIosArrowRoundBack
          size={35}
          className="text-[#ff4d2d]"
          onClick={() => navigate("/cart")}
        />
      </div>
      <div className="w-full max-w-[900px] bg-white rounded-xl shadow-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>

        <section>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
            <FaLocationDot />
            Delivery location
          </h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={addressInput}
              placeholder="Enter your delivery address"
              className="flex-1 border border-gray-300 p-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              onChange={(e) => setAddressInput(e.target.value)}
            />
            <button
              className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-lg flex items-center justify-center"
              onClick={getLatLongByAddress}
            >
              <IoSearchOutline size={17} />
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center"
              onClick={getCurrentLocation}
            >
              <TbCurrentLocation size={17} />
            </button>
          </div>
          <div className="rounded-xl border overflow-hidden">
            <div className="h-64 w-full flex items-center justify-center">
              <MapContainer
                className="w-full h-full"
                center={position}
                zoom={16}
              >
                <TileLayer
                  attribution='<a href="https://www.openstreetmap.org/">© OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Recenter lat={location?.lat ?? 0} lon={location?.lon ?? 0} />
                <Marker
                  position={position}
                  draggable
                  eventHandlers={{ dragend: onDragEnd }}
                />
              </MapContainer>
            </div>
          </div>
        </section>

        {/* Payment Method */}
        <section>
          <h2 className="text-lg font-bold mb-3 text-gray-800">
            Payment method
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                paymentMethod === "cod"
                  ? "border-[#ff4d2d] bg-orange-50 shadow"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setPaymentMethod("cod")}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <MdDeliveryDining className="text-green-600 text-xl" />
              </span>
              <div>
                <p className="font-medium text-gray-800">Cash on delivery</p>
                <p className="text-xs text-gray-500">
                  Pay when your food arrives
                </p>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                paymentMethod === "online"
                  ? "border-[#ff4d2d] bg-orange-50 shadow"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setPaymentMethod("online")}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <FaMobileScreenButton className="text-purple-700 text-lg" />
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <FaCreditCard className="text-blue-700 text-lg" />
              </span>
              <div>
                <p className="font-medium text-gray-800">
                  UPI / Credit / Debit card
                </p>
                <p className="text-xs text-gray-500">Pay securely online</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-l font-semibold mb-3 text-gray-800">
            Order summary
          </h2>
          <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
            {cartItem?.map((item, index) => (
              <div
                key={index}
                className="flex justify-between text-sm text-gray-700"
              >
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span className="font-bold">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <hr className="border-gray-300 my-2" />
            <div className="flex justify-between font-medium text-gray-800">
              <span>Subtotal</span>
              <span>₹{totalAmount}</span>
            </div>
            <div className="flex justify-between font-medium text-gray-600">
              <span>Delivery fee</span>
              <span>{deliveryFee === 0 ? "free" : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-[#ff4d2d] pt-2">
              <span>Total</span>
              <span>₹{amountWithDelFees}</span>
            </div>
          </div>
        </section>

        <button
          className="w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-xl font-semibold cursor-pointer"
          onClick={handlePlaceOrder}
        >
          {loading ? (
            <ClipLoader />
          ) : paymentMethod === "cod" ? (
            "Place order"
          ) : (
            "Pay & place order"
          )}
        </button>
      </div>
    </div>
  );
}

export default CheckOut;
