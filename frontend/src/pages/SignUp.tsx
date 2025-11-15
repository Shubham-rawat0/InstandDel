import { useEffect, useState } from "react"
import { FaRegEye } from "react-icons/fa"
import { FaRegEyeSlash } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {auth} from "../../firebase"
import { IoIosArrowRoundBack } from "react-icons/io"
import ClipLoader from "react-spinners/ClipLoader";
import { useDispatch } from "react-redux"
import { setUserData } from "../redux/userSlice"


const SignUp = () => {
    const primaryColor='#ff4d2d'
    const bgColor='#fff9f6'
    const borderColor='#ddd'
    const [showPassword,setShowPassword]=useState(false)
    const [role,setRole]=useState("user")
    const navigate=useNavigate()
    const [fullName,setFullName]=useState("")
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const [mobile,setMobile]=useState("")
    const [getMobile ,setGetMobile]=useState(false)
    const [googleUser,setGoogleUser]=useState<any>(null)
    const [error, setError] = useState<string | null>(null);
    const [loading,setLoading]=useState(false)
    const dispatch=useDispatch()

    const handleSignup=async()=>{
      try {
        setLoading(true)
        const serverUrl = import.meta.env.VITE_SERVER_URL;
        if (!serverUrl) {
          throw new Error("no server url");
        }
        console.log(serverUrl);
        const result = await axios.post(
          `${serverUrl}/api/auth/signup`,
          {
            fullName,
            email,
            mobile,
            password,
            role
          },
          { withCredentials: true }
        );
        console.log(result);
        dispatch(setUserData(result.data))
        setError(null);
        setLoading(false)
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

    const handleGoogleAuth=async()=>{
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log(result);
        setGoogleUser(result);
        setGetMobile(true);
        setError(null);
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
    const sendGoogleAuthDeatils=async()=>{
      try {
        setLoading(true);
        if (!mobile || !googleUser) {
          throw new Error("no mobile and google user");
        }
        const serverUrl = import.meta.env.VITE_SERVER_URL;
        if (!serverUrl) {
          throw new Error("no server url");
        }
        const result = await axios.post(
          `${serverUrl}/api/auth/google-auth`,
          {
            fullName: googleUser.user.displayName,
            email: googleUser.user.email,
            role,
            mobile,
          },
          {
            withCredentials: true,
          }
        );
        dispatch(setUserData(result.data));
         setError(null);
        // if(data.status==201){
        //   navigate("/home")
        // }
        setLoading(false);
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

  return (
    <>
      {getMobile && (
        <div className="flex w-full items-center gap-5 justify-center min-h-screen p-4 bg-[#fff9f6]">
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
                Register mobile number
              </h1>
            </div>
            <div>
              <div className="mb-6">
                <label
                  htmlFor="mobile"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Mobile no.
                </label>
                <input
                  required
                  type="text"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                  placeholder="enter mobile number"
                  onChange={(e) => {
                    setMobile(e.target.value);
                  }}
                  value={mobile}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="role"
                  className="block text-gray-700 font-medium mb-1"
                >
                  role
                </label>
                <div className="flex gap-2">
                  {["user", "owner", "deliveryBoy"].map((r) => {
                    return (
                      <button
                        key={r}
                        className="flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors cursor-pointer"
                        onClick={() => setRole(r)}
                        style={
                          role == r
                            ? { backgroundColor: primaryColor, color: "white" }
                            : { border: `1px solid black`, color: "#333" }
                        }
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={() => {
                  setGetMobile(false);
                  sendGoogleAuthDeatils();
                }}
                className={`w-full font-semibold rounded-lg px-4 py-2 transition duration-200 bg-[#ff4d2d] cursor-pointer text-white hover:bg-[#e64323]`}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {!getMobile && (
        <div
          className="min-h-screen flex w-full items-center justify-center p-4"
          style={{ backgroundColor: bgColor }}
        >
          <div
            className={`bg-white rounded-xl shadow-lg w-full max-w-md p-8 border`}
            style={{ border: `1px solid ${borderColor}` }}
          >
            <h1
              className={`text-3xl font-bold mb-2`}
              style={{ color: `${primaryColor}` }}
            >
              Instant Del
            </h1>
            <p className="text-gray-600 mb-8">
              create your account to get started with delicious food deliveries
              at your door insatntly
            </p>

            {/* fullname */}

            <div className="mb-4">
              <label
                htmlFor="fullName"
                className="block text-gray-700 font-medium mb-1"
              >
                Full name
              </label>
              <input
                required
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="enter your full name"
                onChange={(e) => {
                  setFullName(e.target.value);
                }}
                value={fullName}
                style={{ border: `1px solid ${borderColor}` }}
              />
            </div>

            {/* email*/}

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                Email
              </label>
              <input
                required
                type="email"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="enter your email"
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                value={email}
                style={{ border: `1px solid ${borderColor}` }}
              />
            </div>

            {/* mobile */}

            <div className="mb-4">
              <label
                htmlFor="mobile"
                className="block text-gray-700 font-medium mb-1"
              >
                Mobile number
              </label>
              <input
                required
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="enter your mobile number"
                onChange={(e) => {
                  setMobile(e.target.value);
                }}
                value={mobile}
                style={{ border: `1px solid ${borderColor}` }}
              />
            </div>

            {/* password */}

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-1"
              >
                password
              </label>
              <div className="relative">
                <input
                  required
                  type={`${showPassword ? "text" : "password"}`}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                  placeholder="enter password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  value={password}
                  style={{ border: `1px solid ${borderColor}` }}
                />
                <button
                  className="absolute right-3 top-3.5 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>
            </div>

            {/* role */}

            <div className="mb-4">
              <label
                htmlFor="role"
                className="block text-gray-700 font-medium mb-1"
              >
                role
              </label>
              <div className="flex gap-2">
                {["user", "owner", "deliveryBoy"].map((r) => {
                  return (
                    <button
                      key={r}
                      className="flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors cursor-pointer"
                      onClick={() => setRole(r)}
                      style={
                        role == r
                          ? { backgroundColor: primaryColor, color: "white" }
                          : { border: `1px solid black`, color: "#333" }
                      }
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={handleSignup}
              className={`w-full font-semibold rounded-lg px-4 py-2 transition duration-200 bg-[#ff4d2d] cursor-pointer text-white hover:bg-[#e64323]`}
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} /> : "Sign up"}
            </button>
            {error && (
              <div className="mt-3 bg-red-100 border text-center border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handleGoogleAuth}
              className={`w-full mt-4 flex items-center cursor-pointer justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 border-gray-400 hover:bg-gray-100`}
            >
              <FcGoogle size={20} />
              <span>Sign up with Google</span>
            </button>
            <p
              className="mt-2 text-center cursor-pointer"
              onClick={() => {
                navigate("/signin");
              }}
            >
              Already have an account?
              <span className="text-[#ff4d2d] "> Sign In</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
  
}
export default SignUp