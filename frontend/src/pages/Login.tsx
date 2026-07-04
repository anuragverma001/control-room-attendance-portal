import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
  
      const response = await loginUser(
        email,
        password
      );
  
      console.log("LOGIN RESPONSE", response.data);
  
      localStorage.setItem(
        "employeeId",
        response.data.employeeId
      );
  
      login(
        response.data.user,
        response.data.token
      );
  
      navigate("/dashboard");
  
    } catch (error: any) {
      console.error("LOGIN ERROR:", error);
  
      if (error?.response) {
        console.log(
          "RESPONSE:",
          error.response.data
        );
      }
  
      alert("Login Failed - Check Console");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Employee Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="border p-3 w-full mb-4 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="border p-3 w-full mb-4 rounded"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-blue-600 text-white w-full p-3 rounded"
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>
      </div>
    </div>
  );
}