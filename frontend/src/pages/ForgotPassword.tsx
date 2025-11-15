import axios from "axios";
import { useEffect, useState } from "react"
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";

const ForgotPassword = () => {
    const [step,setStep]=useState(1 )
      const [email, setEmail] = useState("");
      const [otp, setOtp] = useState("");
      const [newPassword, setNewPassword] = useState("");
      const [confirmPassword, setConfirmPassword] = useState("");
      const navigate=useNavigate()
        const [error, setError] = useState<string | null>(null);
        const [loading, setLoading] = useState(false);

      const handleSendOtp=async()=>{
        try {
           setLoading(true);
          const serverUrl = import.meta.env.VITE_SERVER_URL;
          if (!serverUrl) {
            throw new Error("no server url");
          }
          const result = await axios.post(
            `${serverUrl}/api/auth/send-otp`,
            {
              email,
            },
            {
              withCredentials: true,
            }
          );
          console.log(result);
           setLoading(false);
          setStep(2);
        } catch (err: any) {
           setLoading(false);
          if (axios.isAxiosError(err)) {
            setError(
              err.response?.data?.message ||
                "Something went wrong. Please try again."
            );
          } else {
            setError("Unexpected error occurred.");
          }
        }
      }
        useEffect(() => {
               if (!error) return;
        
               const timer = setTimeout(() => {
                 setError(null);
               }, 5000);
        
               return () => clearTimeout(timer); 
             }, [error]);

      const handleVerifyOtp=async () => {
        try {
           setLoading(true);
         const serverUrl = import.meta.env.VITE_SERVER_URL;
         if (!serverUrl) {
           throw new Error("no server url");
         }
          const result = await axios.post(
            `${serverUrl}/api/auth/verify-otp`,
            {
              email,
              otp,
            },
            {
              withCredentials: true,
            }
          );
          console.log(result);
           setLoading(false);
          setStep(3);
        } catch (err: any) {
           setLoading(false);
          if (axios.isAxiosError(err)) {
            setError(
              err.response?.data?.message ||
                "Something went wrong. Please try again."
            );
          } else {
            setError("Unexpected error occurred.");
          }
        }
      };

      const handleResetPassword = async () => {
        if(newPassword!=confirmPassword){
          return null
        }
        try {
           setLoading(true);
         const serverUrl = import.meta.env.VITE_SERVER_URL;
         if (!serverUrl) {
           throw new Error("no server url");
         }
          const result = await axios.post(
            `${serverUrl}/api/auth/reset-password`,
            {
              email,
              newPassword,
            },
            {
              withCredentials: true,
            }
          );
          console.log(result);
           setLoading(false);
          navigate("/signin");
        } catch (err: any) {
           setLoading(false);
          if (axios.isAxiosError(err)) {
            setError(
              err.response?.data?.message ||
                "Something went wrong. Please try again."
            );
          } else {
            setError("Unexpected error occurred.");
          }
        }
      };

  return (
    <div className="flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="flex items-center gap-4 mb-4">
          <IoIosArrowRoundBack
            size={30}
            className="text-[#ff4d2d]"
            onClick={() => {
              navigate("/signin");
            }}
          />
          <h1 className="text-2xl font-bold text-center text-[#ff4d2d]">
            forgot password
          </h1>
        </div>
        {step == 1 && (
          <div>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                Email
              </label>
              <input
                required
                type="email"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="enter your email"
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                value={email}
              />
            </div>{" "}
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className={`w-full font-semibold rounded-lg px-4 py-2 transition duration-200 bg-[#ff4d2d] cursor-pointer text-white hover:bg-[#e64323]`}
            >
              {loading ? <ClipLoader size={20} /> : "Send OTP"}
            </button>
            {error && (
              <div className="mt-3 bg-red-100 border text-center border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {step == 2 && (
          <div>
            <div className="mb-6">
              <label
                htmlFor="otp"
                className="block text-gray-700 font-medium mb-1"
              >
                OTP
              </label>
              <input
                required
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="enter otp"
                onChange={(e) => {
                  setOtp(e.target.value);
                }}
                value={otp}
              />
            </div>{" "}
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className={`w-full font-semibold rounded-lg px-4 py-2 transition duration-200 bg-[#ff4d2d] cursor-pointer text-white hover:bg-[#e64323]`}
            >
              {loading ? <ClipLoader size={20} /> : "Verify"}
            </button>
            {error && (
              <div className="mt-3 bg-red-100 border text-center border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {step == 3 && (
          <div>
            <div className="mb-6">
              <label
                htmlFor="newPassword"
                className="block text-gray-700 font-medium mb-1"
              >
                New password
              </label>
              <input
                required
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="enter new password"
                onChange={(e) => {
                  setNewPassword(e.target.value);
                }}
                value={newPassword}
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="Password"
                className="block text-gray-700 font-medium mb-1"
              >
                confirm password
              </label>
              <input
                required
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="confirm new password"
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
                value={confirmPassword}
              />
            </div>
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className={`w-full font-semibold rounded-lg px-4 py-2 transition duration-200 bg-[#ff4d2d] cursor-pointer text-white hover:bg-[#e64323]`}
            >
              {loading ? <ClipLoader size={20} /> : "Change password"}
            </button>
            {error && (
              <div className="mt-3 bg-red-100 border text-center border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default ForgotPassword