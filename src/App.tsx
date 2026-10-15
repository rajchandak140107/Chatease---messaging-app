import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ChatLayout from "./components/layout/ChatLayout";
import { getSession } from "./utils/session";

function ChatRoute() {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  return <ChatLayout token={session.token} currentUserId={session.id} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={getSession() ? "/chat" : "/login"} replace />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<ChatRoute />} />
      </Routes>
    </BrowserRouter>
  );
}