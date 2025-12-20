import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ExternalRedirect({ baseUrl }) {
  const location = useLocation();

  useEffect(() => {
    const target = `${baseUrl}${location.pathname}${location.search}${location.hash}`;
    window.location.replace(target);
  }, [baseUrl, location.pathname, location.search, location.hash]);

  return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Đang chuyển hướng...</span>
      </div>
      <p className="mt-3">Đang chuyển sang giao diện Admin mới...</p>
    </div>
  );
}


