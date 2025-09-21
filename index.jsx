import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in ms

// President credentials
const presidents: Record<string, string> = {
  CHIKKABALLAPUR: "Udyam",
  CHINTAMANI: "Dhanush",
  BAGEPALLI: "Srinivas",
  GUDIBANDE: "Udyam",
  GOURIBIDNUR: "Udyam",
  CHELUR: "Udyam",
  SIDLAGHATTA: "Udyam",
  MANCHENAHALLI: "Udyam",
};

// ----- Login Page -----
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // 1. Check president credentials
    if (presidents[username?.toUpperCase()] === password) {
      // Presidents: single session only (no localStorage)
      window.location.href =
        "https://drive.google.com/drive/folders/1yszvsiZUrXVYMzhUxYu8CCscfo0u1taH";
      return;
    }

    // 2. Check member credentials
    const minId = 12526210; // 012526210
    const maxId = 12526980; // 012526980
    const userIdNum = parseInt(username, 10);

    if (!isNaN(userIdNum) && userIdNum >= minId && userIdNum <= maxId) {
      const seq = userIdNum - minId + 1;
      const expectedPassword = `${username}@${seq}`;

      if (password === expectedPassword) {
        localStorage.setItem("cya-auth", "true");
        localStorage.setItem("lastActive", Date.now().toString());
        navigate("/dashboard");
        return;
      }
    }

    // 3. Otherwise invalid
    setError("Invalid username or password");
  }

  function handleRegister() {
    window.location.href = "https://forms.gle/DwbL2xu7yH8xqHBr9";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
      <Card className="w-full max-w-md rounded-3xl shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Competitive Preparation Cell – CYA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username / Membership ID</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="rounded-2xl"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-2xl"
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button type="submit" className="w-full rounded-2xl">
              Login
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              New user?
            </p>
            <Button
              onClick={handleRegister}
              variant="outline"
              className="mt-2 w-full rounded-2xl"
            >
              Register Here
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ----- Dashboard Page (Members only) -----
function Dashboard() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  function handleLogout() {
    localStorage.removeItem("cya-auth");
    localStorage.removeItem("lastActive");
    navigate("/");
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const lastActive = parseInt(localStorage.getItem("lastActive") || "0", 10);
      if (Date.now() - lastActive > SESSION_TIMEOUT) {
        handleLogout();
      } else {
        localStorage.setItem("lastActive", Date.now().toString());
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // If a president somehow reaches dashboard, show error
    const auth = localStorage.getItem("cya-auth");
    if (!auth) {
      setError("Access denied: Presidents cannot access the Member Dashboard.");
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <Card className="max-w-lg p-6 text-center">
          <CardTitle className="text-red-700">{error}</CardTitle>
          <Button onClick={() => navigate("/")} className="mt-4">
            Go Back to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col">
      <div className="p-4 flex justify-between items-center bg-white shadow">
        <h1 className="text-xl font-bold">CYA – Member Dashboard</h1>
        <Button onClick={handleLogout} className="rounded-2xl">Logout</Button>
      </div>
      <div className="flex-1">
        <iframe
          src="https://competitivecell-cya.my.canva.site/"
          title="CYA Canva Site"
          className="w-full h-full border-0"
        ></iframe>
      </div>
    </div>
  );
}

// ----- Protected Route -----
function PrivateRoute({ children }: { children: JSX.Element }) {
  const isAuth = localStorage.getItem("cya-auth") === "true";
  const lastActive = parseInt(localStorage.getItem("lastActive") || "0", 10);

  if (!isAuth) return <Navigate to="/" />;

  if (Date.now() - lastActive > SESSION_TIMEOUT) {
    localStorage.removeItem("cya-auth");
    localStorage.removeItem("lastActive");
    return <Navigate to="/" />;
  }

  localStorage.setItem("lastActive", Date.now().toString());

  return children;
}

// ----- App Router -----
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
