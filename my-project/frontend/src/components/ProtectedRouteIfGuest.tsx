import { JSX, useEffect, useState } from "react";
import { getToken } from "@utils/localStorage";
import { checkAuth } from "@api/authService";
import { useNavigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

const ProtectedRouteIfGuest = ({ children }: Props) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const token = getToken();
      if (!token) {
        setChecking(false);
        return;
      }

      try {
        const res = await checkAuth(token);
        if (res?.user) {
          navigate("/all-events");
        } else {
          setChecking(false);
        }
      } catch {
        setChecking(false);
      }
    };

    verify();
  }, []);

  if (checking) return null;

  return children;
};

export default ProtectedRouteIfGuest;
