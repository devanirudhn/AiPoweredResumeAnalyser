import { Navigate } from "react-router-dom";

function PublicRoute({ children }) {

  const token =
    localStorage.getItem("token");

  if (token && token !== "null" && token !== "undefined") {

    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default PublicRoute;
