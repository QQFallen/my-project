import { JSX, useEffect, useState } from "react";
import { getToken } from "@utils/localStorage";
import { checkAuth } from "@api/authService";
import { useNavigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: Props) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await checkAuth(token);
        if (res?.user) {
          setIsAuthorized(true);
        } else {
          navigate("/login");
        }
      } catch {
        navigate("/login");
      } finally {
        setChecking(false);
      }
    };

    verify();
  }, []);

  if (checking) return null;

  return isAuthorized ? children : null;
};

export default ProtectedRoute;
