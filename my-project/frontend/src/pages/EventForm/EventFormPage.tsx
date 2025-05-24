import React from "react";

const EventFormPage: React.FC = () => {
  return (
    <div style={{
      maxWidth: 600,
      margin: "2rem auto",
      padding: "2rem",
      background: "#18181a",
      borderRadius: 16,
      color: "#fff",
      boxShadow: "0 4px 24px rgba(229,57,53,0.10)"
    }}>
      <h2 style={{ color: "#e53935", textAlign: "center" }}>
        Страница создания/редактирования события
      </h2>
      <p style={{ color: "#ff8a80", textAlign: "center" }}>
        Здесь будет форма для создания или редактирования мероприятия.
      </p>
    </div>
  );
};

export default EventFormPage; 