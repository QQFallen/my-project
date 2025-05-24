import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation/Navigation";
import LoginPage from "@pages/Login/LoginPage";
import { RegisterPage } from "@pages/Register/RegisterPage";
import EventsPage from "@pages/Events/EventsPage";
import HomePage from "@pages/Home/HomePage";
import NotFoundPage from "@pages/NotFound/NotFoundPage";
import ProtectedRoute from "@components/ProtectedRoute";
import ProfilePage from "@pages/Profile/ProfilePage";
import EventFormPage from "@pages/EventForm/EventFormPage";
import "./App.css";

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
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

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/event/new" element={<EventFormPage />} />
            <Route path="/event/:id/edit" element={<EventFormPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
