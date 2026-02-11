import { useState } from "react";
import "../dashboard.css";
import Sidebar from "../../components/Sidebar";
import { wisatawanMenu } from "../../app/wisatawanMenu";

export default function Profile() {
  const [profile, setProfile] = useState({
    username: "spk_wisata1",
    email: "spkwisata@gmail.com",
    password: "12345678",
  });

  const [form, setForm] = useState(profile);
  const [isEdit, setIsEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 tambahan

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    setProfile(form);
    setIsEdit(false);
    setShowPassword(false);
  };

  const handleCancel = () => {
    setForm(profile);
    setIsEdit(false);
    setShowPassword(false);
  };

  return (
    <div className="page">
      <Sidebar items={wisatawanMenu} />

      <main className="content">
        <h2>Data Profile</h2>
        <div className="hrline" />

        {/* MODE VIEW */}
        {!isEdit && (
          <>
            <div className="box">
              <p><strong>Username :</strong> {profile.username}</p>
              <p><strong>Email :</strong> {profile.email}</p>
              <p><strong>Password :</strong> ********</p>
            </div>

            <button className="btn" onClick={() => setIsEdit(true)}>
              Edit Profile
            </button>
          </>
        )}

        {/* MODE EDIT */}
        {isEdit && (
          <div className="box">
            <div style={{ marginBottom: 10 }}>
              <label>Username</label><br />
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Email</label><br />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Password</label><br />
              <input
                type={showPassword ? "text" : "password"} // 👈 toggle
                name="password"
                value={form.password}
                onChange={handleChange}
              />

              <div style={{ marginTop: 6 }}>
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                <label htmlFor="showPassword" style={{ marginLeft: 6 }}>
                  Tampilkan sandi
                </label>
              </div>
            </div>

            <button className="btn" onClick={handleSave}>
              Simpan
            </button>
            <button
              className="btn"
              style={{ marginLeft: 10 }}
              onClick={handleCancel}
            >
              Batal
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
