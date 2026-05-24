import { useNavigate }
from "react-router-dom";

function Dashboard() {

  const navigate =
    useNavigate();



  // =====================================
  // LOGOUT
  // =====================================

  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    );

    navigate("/");
  };



  return (

    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}

      <div className="bg-black text-white p-5 flex justify-between items-center">

        <h1 className="text-3xl font-bold">

          AI Resume Analyzer

        </h1>

        <button

          onClick={handleLogout}

          className="bg-red-500 px-5 py-2 rounded-lg"
        >

          Logout

        </button>

      </div>



      {/* MAIN CONTENT */}

      <div className="max-w-6xl mx-auto p-10">

        <h2 className="text-4xl font-bold mb-10 text-center">

          Dashboard

        </h2>



        {/* CARDS */}

        <div className="grid md:grid-cols-2 gap-8">

          {/* UPLOAD */}

          <div

            onClick={() =>
              navigate("/upload")
            }

            className="bg-white p-10 rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition"
          >

            <h3 className="text-3xl font-bold mb-4">

              Upload Resume

            </h3>

            <p className="text-gray-600">

              Upload your resume and
              get AI ATS analysis.

            </p>

          </div>



          {/* HISTORY */}

          <div

            onClick={() =>
              navigate("/history")
            }

            className="bg-white p-10 rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition"
          >

            <h3 className="text-3xl font-bold mb-4">

              Resume History

            </h3>

            <p className="text-gray-600">

              View uploaded resumes
              and previous ATS scores.

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
