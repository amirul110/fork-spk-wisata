import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../../services/auth.service";
import { setAuth } from "../../store/authStore";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("budi@gmail.com");
  const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
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

      if (role === "admin") {
        nav("/admin/dashboard", { replace: true });
      } else if (role === "wisatawan") {
        nav("/wisatawan/preferensi", { replace: true });
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
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          SPK REKOMENDASI DESTINASI WISATA
          <br />
          DI KABUPATEN MAGETAN
        </h1>

        <form onSubmit={handleLogin} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contoh: budi@gmail.com"
            required
          />

          <label style={styles.label}>Password</label>

          {/* PASSWORD + TOGGLE */}
          <div style={styles.passwordWrapper}>
            <input
              style={{ ...styles.input, paddingRight: 44 }}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="masukkan password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.toggleBtn}
              aria-label="Tampilkan sandi"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button style={styles.button} disabled={loading} type="submit">
            {loading ? "Memproses..." : "Login"}
          </button>

          {msg.type !== "idle" && (
            <div
              style={{
                ...styles.alert,
                borderColor: msg.type === "error" ? "#b00020" : "#1f7a1f",
                color: msg.type === "error" ? "#b00020" : "#1f7a1f",
              }}
            >
              {msg.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    width: "100vw",
    display: "grid",
    placeItems: "center",
    background: "#f2f2f2",
    padding: 18,
  },
  card: {
    width: 520,
    maxWidth: "92vw",
    background: "#fff",
    border: "2px solid #333",
    padding: 28,
    boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
  },
  title: {
    margin: 0,
    marginBottom: 18,
    textAlign: "center",
    fontSize: 18,
    lineHeight: 1.3,
    fontWeight: 800,
    color: "#111",
  },
  form: { display: "grid", gap: 10 },
  label: { fontSize: 14, fontWeight: 800, color: "#111" },
  input: {
    height: 42,
    border: "2px solid #333",
    padding: "0 12px",
    outline: "none",
    fontSize: 14,
    background: "#fff",
    color: "#111",
    width: "100%",
  },
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  toggleBtn: {
    position: "absolute",
    right: 8,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 18,
  },
  button: {
    height: 44,
    border: "2px solid #333",
    background: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    marginTop: 6,
    fontSize: 14,
    color: "#111",
  },
  alert: {
    marginTop: 8,
    border: "2px solid",
    padding: "10px 12px",
    fontWeight: 800,
    fontSize: 14,
    background: "#fff",
  },
};
