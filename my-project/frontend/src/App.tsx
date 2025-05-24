import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { getToken } from "@utils/localStorage";
import Navigation from "./components/Navigation/Navigation";
import LoginPage from "@pages/Login/LoginPage";
import { RegisterPage } from "@pages/Register/RegisterPage";
import EventsPage from "@pages/Events/EventsPage";
import HomePage from "@pages/Home/HomePage";
import NotFoundPage from "@pages/NotFound/NotFoundPage";
import "./App.css";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getToken();
  if (token) {
    return <Navigate to="/all-events" />;
  }
  return <>{children}</>;
};

function App() {
  const location = useLocation();
  const is404Page = !["/", "/login", "/register", "/all-events"].includes(
    location.pathname,
  );

  return (
    <div className="app">
      {!is404Page && <Navigation />}
      <main className={`main ${is404Page ? "no-padding" : ""}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route path="/all-events" element={<EventsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
