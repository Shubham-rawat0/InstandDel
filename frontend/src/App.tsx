import { Navigate, Route, Routes } from "react-router-dom"
import SignUp from "./pages/SignUp"
import SignIn from "./pages/SignIn"
import ForgotPassword from "./pages/ForgotPassword"
import useGetCurrentUser from "./hooks/useGetCurrentUser"
import {  useSelector } from "react-redux"
import type { RootState } from "./redux/store"
import Homepage from "./pages/Homepage"
import useGetCity from "./hooks/useGetCity"
import useGetMyShop from "./hooks/useGetMyShop"
import CreateEditShop from "./pages/CreateEditShop"
import Additems from "./pages/Additems"
import EditItem from "./pages/EditItem"
import useGetShopByCity from "./hooks/useGetShopByCity"
import useGetItemsByCity from "./hooks/useGetItemsByCity"
import CartPage from "./pages/CartPage"
import CheckOut from "./pages/CheckOut"
import OrderPlaced from "./pages/OrderPlaced"
import MyOrders from "./pages/MyOrders"
import useGetMyOrders from "./hooks/useGetMyOrders"
import useUpdateLocation from "./hooks/useUpdateLocation"
import TrackOrderPage from "./compponents/TrackOrderPage"
import Shop from "./pages/Shop"

const App = () => {
  useGetCity()
  useUpdateLocation();
  useGetCurrentUser()
  useGetMyShop()
  useGetShopByCity()
  useGetItemsByCity()
  useGetMyOrders()
  
  const {userData}=useSelector((state:RootState)=>state.user)

  return (
    <Routes>
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to={"/"} />}
      />
      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to={"/"} />}
      />
      <Route
        path="/forgotpassword"
        element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />}
      />
      <Route
        path="/"
        element={userData ? <Homepage /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/create-edit-shop"
        element={userData ? <CreateEditShop /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/add-item"
        element={userData ? <Additems /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/edit-item/:itemId"
        element={userData ? <EditItem /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/cart"
        element={userData ? <CartPage /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/checkout"
        element={userData ? <CheckOut /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/order-placed"
        element={userData ? <OrderPlaced /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/my-orders"
        element={userData ? <MyOrders /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/track-order/:orderId"
        element={userData ? <TrackOrderPage /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/shop/:shopId"
        element={userData ? <Shop/> : <Navigate to={"/signin"} />}
      />
    </Routes>
  );
}
export default App