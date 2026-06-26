import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginRequest } from "../../services/auth.service";
import { setAuth } from "../../store/authStore";
import { clearSelectedWisata } from "../../store/wisataStore";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";

export default function LoginPage() {
  const nav = useNavigate();
  const location = useLocation();
  const successMsg = location.state?.successMsg || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "idle", text: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "idle", text: "" });

    try {
      const res = await loginRequest(email, password);

      const token = res?.auth?.token;
      const role = res?.auth?.user?.role;
      const user = res?.auth?.user;

      if (!token || !role) throw new Error("Token / role tidak ditemukan");

      setAuth({ token, role, user });
      clearSelectedWisata();

      if (role === "admin") {
        nav("/admin/dashboard", { replace: true });
      } else if (role === "wisatawan") {
        nav("/wisatawan/dashboard", { replace: true });
      } else {
        throw new Error("Role tidak dikenal");
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 400) {
        setMsg({ type: "error", text: "Email atau password salah" });
      } else {
        setMsg({
          type: "error",
          text: err?.response?.data?.message || err?.message || "Login gagal",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen surface-200 p-3">
      <Card className="w-full shadow-4" style={{ maxWidth: 480 }}>
        <div className="text-center mb-4">
          <i className="pi pi-map-marker text-primary text-4xl mb-2"></i>
          <h1 className="text-xl font-bold text-800 m-0 line-height-3">
            SISTEM PENUNJANG KEPUTUSAN REKOMENDASI DESTINASI WISATA
            <br />
            DI KABUPATEN MAGETAN
          </h1>
        </div>

        <form onSubmit={handleLogin} className="flex flex-column gap-3">
          <div className="flex flex-column gap-2">
            <label className="font-bold text-800 text-sm">Email</label>
            <InputText
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
        
              required
              className="w-full"
            />
          </div>

          <div className="flex flex-column gap-2">
            <label className="font-bold text-800 text-sm">Password</label>
            <Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              feedback={false}
              required
              className="w-full"
              inputClassName="w-full"
            />
          </div>

          <Button
            label={loading ? "Memproses..." : "Login"}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"}
            disabled={loading}
            type="submit"
            className="w-full mt-2"
          />

          {successMsg && msg.type === "idle" && (
            <Message severity="success" text={successMsg} className="w-full" />
          )}

          {msg.type !== "idle" && (
            <Message
              severity={msg.type === "error" ? "error" : "success"}
              text={msg.text}
              className="w-full"
            />
          )}

          <div className="text-center mt-2">
            <span className="text-600 text-sm">Belum punya akun? </span>
            <Link to="/register" className="text-primary text-sm font-bold no-underline">
              Register di sini
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
