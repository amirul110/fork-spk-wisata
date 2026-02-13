import { useState } from "react";
import "../dashboard.css";
import Sidebar from "../../components/Sidebar";
import { adminMenu } from "../../app/adminMenu";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    username: "admin",
    email: "admin@gmail.com",
    password: "12345678",
  });

  const [form, setForm] = useState(profile);
  const [isEdit, setIsEdit] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    setProfile(form);
    setIsEdit(false);
  };

  const handleCancel = () => {
    setForm(profile);
    setIsEdit(false);
  };

  return (
    <div className="page">
      <Sidebar items={adminMenu} />

      <main className="content">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-800 mt-0 mb-2">
            <i className="pi pi-user mr-2"></i>Data Profile
          </h2>
          <hr className="border-top-1 border-300" />
        </div>

        {/* MODE VIEW */}
        {!isEdit && (
          <>
            <Card className="shadow-1 mb-3" style={{ maxWidth: 500 }}>
              <div className="flex flex-column gap-3">
                <div>
                  <span className="font-bold text-500 text-sm">Username</span>
                  <div className="text-800 font-semibold mt-1">{profile.username}</div>
                </div>
                <div>
                  <span className="font-bold text-500 text-sm">Email</span>
                  <div className="text-800 font-semibold mt-1">{profile.email}</div>
                </div>
                <div>
                  <span className="font-bold text-500 text-sm">Password</span>
                  <div className="text-800 font-semibold mt-1">********</div>
                </div>
              </div>
            </Card>

            <Button
              label="Edit Profile"
              icon="pi pi-pencil"
              severity="info"
              onClick={() => setIsEdit(true)}
            />
          </>
        )}

        {/* MODE EDIT */}
        {isEdit && (
          <Card className="shadow-1" style={{ maxWidth: 500 }}>
            <div className="flex flex-column gap-3">
              <div className="flex flex-column gap-2">
                <label className="font-bold text-sm">Username</label>
                <InputText
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              <div className="flex flex-column gap-2">
                <label className="font-bold text-sm">Email</label>
                <InputText
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              <div className="flex flex-column gap-2">
                <label className="font-bold text-sm">Password</label>
                <Password
                  name="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  toggleMask
                  feedback={false}
                  className="w-full"
                  inputClassName="w-full"
                />
              </div>

              <div className="flex gap-2 mt-2">
                <Button label="Simpan" icon="pi pi-check" onClick={handleSave} />
                <Button
                  label="Batal"
                  icon="pi pi-times"
                  severity="secondary"
                  onClick={handleCancel}
                />
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
