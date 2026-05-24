import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import axiosInstance from "../api/axiosInstance";

function History() {

  const [resumes, setResumes] =
    useState([]);

  const [loading, setLoading] =
    useState(true);



  // ==========================================
  // Fetch Resume History
  // ==========================================

  const fetchHistory = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const res =
        await axiosInstance.get(

          "/resume/history",

          {
            headers: {

              Authorization:
                `Bearer ${token}`
            }
          }
        );

      setResumes(res.data);

    } catch (err) {

      console.log(err);

      toast.error(
        "Failed to fetch history ❌"
      );

    } finally {

      setLoading(false);
    }
  };



  // ==========================================
  // Download Resume
  // ==========================================

  const handleDownload = async (id) => {

    const toastId =
      toast.loading(
        "Preparing improved resume..."
      );

    try {

      const token =
        localStorage.getItem("token");

      const response =
        await fetch(

          `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/resume/download/${id}`,

          {
            headers: {

              Authorization:
                `Bearer ${token}`
            }
          }
        );



      const blob =
        await response.blob();



      const url =
        window.URL.createObjectURL(blob);



      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "improved_resume.pdf";



      document.body.appendChild(link);

      link.click();

      link.remove();



      toast.success(

        "Resume downloaded 🚀",

        {
          id: toastId
        }
      );

    } catch (err) {

      console.log(err);

      toast.error(

        "Download failed ❌",

        {
          id: toastId
        }
      );
    }
  };



  // ==========================================
  // Delete Resume
  // ==========================================

  const handleDelete = async (id) => {

    const toastId =
      toast.loading(
        "Deleting resume..."
      );

    try {

      const token =
        localStorage.getItem("token");

      await axiosInstance.delete(

        `/resume/${id}`,

        {
          headers: {

            Authorization:
              `Bearer ${token}`
          }
        }
      );



      setResumes(

        resumes.filter(

          (resume) =>

            resume._id !== id
        )
      );



      toast.success(

        "Resume deleted 🗑️",

        {
          id: toastId
        }
      );

    } catch (err) {

      console.log(err);

      toast.error(

        "Delete failed ❌",

        {
          id: toastId
        }
      );
    }
  };



  // ==========================================
  // useEffect
  // ==========================================

  useEffect(() => {

    fetchHistory();

  }, []);




  if (loading) {

    return (

      <div className="min-h-screen flex justify-center items-center">

        <h1 className="text-2xl font-bold">

          Loading...

        </h1>

      </div>
    );
  }



  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-4xl font-bold mb-8 text-center">

        Resume History

      </h1>



      {
        resumes.length === 0

        ?

        <div className="text-center text-xl">

          No resumes found

        </div>

        :

        <div className="grid gap-6">

          {
            resumes.map((resume) => (

              <div

                key={resume._id}

                className="bg-white rounded-2xl shadow-lg p-6"
              >

                {/* TITLE */}

                <h2 className="text-2xl font-bold mb-2">

                  {resume.title}

                </h2>



                {/* ROLE */}

                <p className="mb-2">

                  <span className="font-semibold">

                    Role:

                  </span>

                  {" "}

                  {resume.role}

                </p>



                {/* SCORE */}

                <p className="mb-4">

                  <span className="font-semibold">

                    ATS Score:

                  </span>

                  {" "}

                  {resume.analysis?.score}%

                </p>



                {/* MATCHED SKILLS */}

                <div className="mb-4">

                  <h3 className="font-bold mb-2">

                    Matched Skills

                  </h3>

                  <div className="flex flex-wrap gap-2">

                    {
                      resume.analysis?.skills?.map(

                        (skill, index) => (

                          <span

                            key={index}

                            className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                          >

                            {skill}

                          </span>
                        )
                      )
                    }

                  </div>

                </div>



                {/* MISSING KEYWORDS */}

                <div className="mb-4">

                  <h3 className="font-bold mb-2">

                    Missing Keywords

                  </h3>

                  <div className="flex flex-wrap gap-2">

                    {
                      resume.analysis?.missingKeywords?.map(

                        (keyword, index) => (

                          <span

                            key={index}

                            className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
                          >

                            {keyword}

                          </span>
                        )
                      )
                    }

                  </div>

                </div>



                {/* SUGGESTIONS */}

                <div className="mb-6">

                  <h3 className="font-bold mb-2">

                    AI Suggestions

                  </h3>

                  <ul className="list-disc pl-5">

                    {
                      resume.analysis?.suggestions?.map(

                        (suggestion, index) => (

                          <li key={index}>

                            {suggestion}

                          </li>
                        )
                      )
                    }

                  </ul>

                </div>



                {/* BUTTONS */}

                <div className="flex gap-4">

                  {/* DOWNLOAD */}

                  <button

                    onClick={() =>
                      handleDownload(
                        resume._id
                      )
                    }

                    className="bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 transition"
                  >

                    Download Resume

                  </button>



                  {/* DELETE */}

                  <button

                    onClick={() =>
                      handleDelete(
                        resume._id
                      )
                    }

                    className="bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700 transition"
                  >

                    Delete

                  </button>

                </div>

              </div>
            ))
          }

        </div>
      }

    </div>
  );
}

export default History;