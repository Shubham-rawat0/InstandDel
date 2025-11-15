import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import UserDashboard from "../compponents/UserDashboard";
import OwnerDashboard from "../compponents/OwnerDashboard";
import DeliveryBoy from "../compponents/DeliveryBoy";

const Homepage = () => {
  const { userData } = useSelector((state: RootState) => state.user);
  return (
    <div className="w-screen min-h-screen pt-[100px] flex flex-col items-center bg-[#fff9f6]">
      {userData && userData.role === "user" && <UserDashboard />}
      {userData && userData.role === "owner" && <OwnerDashboard />}
      {userData && userData.role === "deliveryBoy" && <DeliveryBoy />}
    </div>
  );
};

export default Homepage;
