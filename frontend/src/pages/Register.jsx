import { useState } from "react";

import toast from "react-hot-toast";

import {
  useNavigate,
  Link
}
from "react-router-dom";

import axiosInstance
from "../api/axiosInstance";

function Register() {

  const navigate =
    useNavigate();

  const [firstname, setFirstname] =
    useState("");

  const [lastname, setLastname] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");



  // =====================================
  // Register Function
  // =====================================

  const handleRegister =
    async (e) => {

      e.preventDefault();

      const toastId =
        toast.loading(
          "Creating account..."
        );

      try {

        setLoading(true);

        setError("");



        // API CALL
        const res =
          await axiosInstance.post(

            "/userapi/users",

            {
              firstname,
              lastname,
              email,
              password
            }
          );

        console.log(res.data);



        // SUCCESS TOAST
        toast.success(

          "Registration successful 🎉",

          {
            id: toastId
          }
        );



        // Navigate Login
        navigate("/");

      } catch (err) {

        console.log(err);

        const message =

          err.response?.data?.message

          ||

          "Registration failed ❌";



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

    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-5">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">

        <h1 className="text-4xl font-bold mb-8 text-center">

          Register

        </h1>



        {/* ERROR */}

        {
          error &&

          <p className="bg-red-100 text-red-600 p-3 rounded mb-4">

            {error}

          </p>
        }



        {/* FORM */}

        <form
          onSubmit={handleRegister}
          className="space-y-5"
        >

          {/* FIRSTNAME */}

          <div>

            <label className="block mb-2 font-semibold">

              First Name

            </label>

            <input

              type="text"

              placeholder="Enter first name"

              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-black"

              value={firstname}

              onChange={(e)=>

                setFirstname(
                  e.target.value
                )
              }

              required
            />

          </div>



          {/* LASTNAME */}

          <div>

            <label className="block mb-2 font-semibold">

              Last Name

            </label>

            <input

              type="text"

              placeholder="Enter last name"

              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-black"

              value={lastname}

              onChange={(e)=>

                setLastname(
                  e.target.value
                )
              }

              required
            />

          </div>



          {/* EMAIL */}

          <div>

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

          <div>

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

              "Registering..."

              :

              "Register"
            }

          </button>

        </form>



        {/* LOGIN LINK */}

        <p className="mt-6 text-center">

          Already have an account?

          <Link

            to="/"

            className="text-blue-500 ml-2 hover:underline"
          >

            Login

          </Link>

        </p>

      </div>

    </div>
  );
}

export default Register;