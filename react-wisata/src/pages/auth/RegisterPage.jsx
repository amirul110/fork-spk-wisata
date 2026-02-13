import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default function RegisterPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "idle", text: "" });

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg({ type: "idle", text: "" });

    if (password !== confirmPassword) {
      setMsg({ type: "error", text: "Password dan konfirmasi password tidak sama" });
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { username, email, password });
      nav("/login", { state: { successMsg: "Registrasi berhasil, silahkan login" } });
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.response?.data?.message || "Registrasi gagal, coba lagi",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen surface-200 p-3">
      <Card className="w-full shadow-4" style={{ maxWidth: 480 }}>
        <div className="text-center mb-4">
          <i className="pi pi-user-plus text-primary text-4xl mb-2"></i>
          <h1 className="text-xl font-bold text-800 m-0 line-height-3">
            Registrasi Wisatawan
          </h1>
        </div>

        <form onSubmit={handleRegister} className="flex flex-column gap-3">
          <div className="flex flex-column gap-2">
            <label className="font-bold text-800 text-sm">Username</label>
            <InputText
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
              className="w-full"
            />
          </div>

          <div className="flex flex-column gap-2">
            <label className="font-bold text-800 text-sm">Email</label>
            <InputText
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh: budi@gmail.com"
              required
              className="w-full"
            />
          </div>

          <div className="flex flex-column gap-2">
            <label className="font-bold text-800 text-sm">Password</label>
            <Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              toggleMask
              feedback={false}
              required
              className="w-full"
              inputClassName="w-full"
            />
          </div>

          <div className="flex flex-column gap-2">
            <label className="font-bold text-800 text-sm">Konfirmasi Password</label>
            <Password
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Masukkan ulang password"
              toggleMask
              feedback={false}
              required
              className="w-full"
              inputClassName="w-full"
            />
          </div>

          <Button
            label={loading ? "Memproses..." : "Simpan"}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-save"}
            disabled={loading}
            type="submit"
            className="w-full mt-2"
          />

          {msg.type !== "idle" && (
            <Message
              severity="error"
              text={msg.text}
              className="w-full"
            />
          )}

          <div className="text-center mt-2">
            <span className="text-600 text-sm">Sudah punya akun? </span>
            <Link to="/login" className="text-primary text-sm font-bold no-underline">
              Login di sini
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
