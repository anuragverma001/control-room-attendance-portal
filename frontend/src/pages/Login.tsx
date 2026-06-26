import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const login = () => {
    navigate("/dashboard");
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
          className="border p-3 w-full mb-4 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-3 w-full mb-4 rounded"
        />

        <button
          onClick={login}
          className="bg-blue-600 text-white w-full p-3 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}
