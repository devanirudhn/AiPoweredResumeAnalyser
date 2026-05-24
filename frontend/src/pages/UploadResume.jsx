import { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";

function UploadResume() {
  const [role, setRole] = useState("frontend");
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  // =====================================
  // HANDLE UPLOAD
  // =====================================

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!resume) {
      toast.error("Please select a PDF file first");
      return;
    }

    try {
      setLoading(true);
      const toastId = toast.loading("Analyzing Resume...");

      // token
      const token = localStorage.getItem("token");

      // form data
      const formData = new FormData();
      formData.append("role", role);
      formData.append("resume", resume);

      // API CALL
      const res = await axiosInstance.post(
        "/resume/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      console.log(res.data);
      
      toast.success("Analysis Complete!", { id: toastId });

      // store analysis
      setAnalysis(res.data.analysis);

    } catch (err) {
      console.log(err);
      toast.dismiss();
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-5">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          AI Resume Analyzer
        </h1>

        {/* FORM */}
        <form onSubmit={handleUpload} className="space-y-5">
          {/* ROLE */}
          <div>
            <label className="block mb-2 font-semibold">
              Select Role
            </label>
            <select
              className="w-full border p-3 rounded-lg"
              value={role}
              onChange={(e)=> setRole(e.target.value)}
            >
              <option value="frontend">Frontend Developer</option>
              <option value="backend">Backend Developer</option>
              <option value="fullstack">Full Stack Developer</option>
              <option value="cloud">Cloud Engineer</option>
              <option value="devops">DevOps Engineer</option>
              <option value="aiEngineer">AI Engineer</option>
              <option value="dataScientist">Data Scientist</option>
              <option value="cybersecurity">Cybersecurity Engineer</option>
            </select>
          </div>

          {/* FILE */}
          <div>
            <label className="block mb-2 font-semibold">
              Upload Resume PDF
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e)=> setResume(e.target.files[0])}
              className="w-full border p-3 rounded-lg bg-white"
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-4 rounded-xl hover:bg-gray-800 transition"
          >
            {loading ? "Analyzing Resume..." : "Upload & Analyze"}
          </button>
        </form>

        {/* ANALYSIS */}
        {analysis && (
          <div className="mt-10">
            <h2 className="text-3xl font-bold mb-6">
              ATS Analysis
            </h2>

            {/* SCORE */}
            <div className="bg-green-100 p-5 rounded-xl mb-5">
              <h3 className="text-2xl font-bold">
                ATS Score: {analysis.score}/100
              </h3>
            </div>

            {/* MATCHED */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">
                Matched Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.matchedKeywords?.map((item, index) => (
                  <span key={index} className="bg-green-200 px-3 py-1 rounded-full">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* MISSING */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">
                Missing Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords?.map((item, index) => (
                  <span key={index} className="bg-red-200 px-3 py-1 rounded-full">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* SUGGESTIONS */}
            <div>
              <h3 className="text-xl font-semibold mb-3">
                Suggestions
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                {analysis.suggestions?.map((item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadResume;