import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {

  const token =
    localStorage.getItem("token");

  if (!token || token === "null" || token === "undefined") {

    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;