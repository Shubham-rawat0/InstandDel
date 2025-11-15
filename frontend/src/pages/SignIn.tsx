import { useEffect, useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import axios from "axios";
import { auth } from "../../firebase";
import ClipLoader from "react-spinners/ClipLoader";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const SignIn = () => {
  const primaryColor = "#ff4d2d";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);
   const dispatch=useDispatch()
  const handleSignIn = async () => {
    try {
      setLoading(true);
      const serverUrl =
        import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
      if (!serverUrl) {
        throw new Error("no server url");
      }
      console.log(serverUrl);
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      console.log(result);
      dispatch(setUserData(result.data))
      setError(null);
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
  };

  useEffect(() => {
         if (!error) return;
  
         const timer = setTimeout(() => {
           setError(null);
         }, 5000);
  
         return () => clearTimeout(timer); 
       }, [error]);

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log(result);
      const serverUrl =
        import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
      if (!serverUrl) {
        throw new Error("no server url");
      }
      const data = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          email: result.user.email,
        },
        {
          withCredentials: true,
        }
      );
      console.log(data);
       dispatch(setUserData(data.data))
      setError(null)
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
  };
  return (
    <div
      className="min-h-screen flex w-full gap-5 items-center justify-center p-4"
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
          Sign in to your account to get started with delicious food deliveries
          at your door insatntly
        </p>

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

        <div
          className="cursor-pointer text-right mb-4 text-[#ff4d2d]"
          onClick={() => navigate("/forgotpassword")}
        >
          forgot password
        </div>

        <button
          onClick={handleSignIn}
          disabled={loading}
          className={`w-full font-semibold rounded-lg px-4 py-2 transition duration-200 bg-[#ff4d2d] cursor-pointer text-white hover:bg-[#e64323]`}
        >
          {loading ? <ClipLoader size={20} /> : "Sign In"}
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
          <span>Sign in with Google</span>
        </button>
        <p
          className="mt-2 text-center cursor-pointer"
          onClick={() => {
            navigate("/signup");
          }}
        >
          Want to create a new account?
          <span className="text-[#ff4d2d] "> Sign Up</span>
        </p>
      </div>
    </div>
  );
};
export default SignIn;
