import { useState } from "react";

import toast from "react-hot-toast";

import {
  useNavigate,
  Link
}
from "react-router-dom";

import axiosInstance
from "../api/axiosInstance";

function Login() {

  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");



  // =====================================
  // LOGIN FUNCTION
  // =====================================

  const handleLogin =
    async (e) => {

      e.preventDefault();

      const toastId =
        toast.loading(
          "Logging in..."
        );

      try {

        setLoading(true);

        setError("");



        const res =
          await axiosInstance.post(

            "/userapi/login",

            {
              email,
              password
            }
          );



        // SAVE TOKEN
        localStorage.setItem(

          "token",

          res.data.token
        );



        // SUCCESS TOAST
        toast.success(

          "Welcome back 🚀",

          {
            id: toastId
          }
        );



        // GO DASHBOARD
        navigate("/dashboard");

      } catch (err) {

        console.log(err);

        const message =

          err.response?.data?.message

          ||

          "Login failed ❌";



        setError(message);



        // ERROR TOAST
        toast.error(

          message,

          {
            id: toastId
          }
        );

      } finally {

        setLoading(false);
      }
    };



  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">

      <form

        onSubmit={handleLogin}

        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
      >

        <h1 className="text-4xl font-bold mb-8 text-center">

          Login

        </h1>



        {/* ERROR */}

        {
          error &&

          <p className="bg-red-100 text-red-600 p-3 rounded mb-4">

            {error}

          </p>
        }



        {/* EMAIL */}

        <div className="mb-5">

          <label className="block mb-2 font-semibold">

            Email

          </label>

          <input

            type="email"

            placeholder="Enter email"

            className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-black"

            value={email}

            onChange={(e)=>

              setEmail(
                e.target.value
              )
            }

            required
          />

        </div>



        {/* PASSWORD */}

        <div className="mb-5">

          <label className="block mb-2 font-semibold">

            Password

          </label>

          <input

            type="password"

            placeholder="Enter password"

            className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-black"

            value={password}

            onChange={(e)=>

              setPassword(
                e.target.value
              )
            }

            required
          />

        </div>



        {/* BUTTON */}

        <button

          type="submit"

          disabled={loading}

          className="w-full bg-black text-white p-4 rounded-xl hover:bg-gray-800 transition duration-300"
        >

          {
            loading

            ?

            "Logging in..."

            :

            "Login"
          }

        </button>



        {/* REGISTER LINK */}

        <p className="mt-6 text-center">

          Don't have an account?

          <Link

            to="/register"

            className="text-blue-500 ml-2 hover:underline"
          >

            Register

          </Link>

        </p>

      </form>

    </div>
  );
}

export default Login;