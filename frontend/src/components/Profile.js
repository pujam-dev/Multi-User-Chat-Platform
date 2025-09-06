import { useEffect, useState } from "react";
import { fetchWithAuth } from "../api";

export default function Profile() {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    date_of_birth: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithAuth(
          "http://127.0.0.1:8000/auth/user/profile/",
          {method:"GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
        const data = await res.json();
        console.log("profile get api",data)
        if (res.ok) {
          setProfile(data);
          setFormData({
            name: data.name || "",
            date_of_birt: data.date_of_birt || "",
            email: data.email || "",
          });
        } else {
          setErr("Failed to load profile");
        }
      } catch (error) {
        setErr("Error fetching profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccessMsg("");
    try {
      const res = await fetchWithAuth("http://127.0.0.1:8000/auth/user/profile/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.data);
        setSuccessMsg("Profile updated successfully");
      } else {
        setErr("Failed to update profile");
      }
    } catch (error) {
      setErr("Error updating profile");
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="container py-4">
      <h3>User Profile</h3>
      {err && <div className="alert alert-danger">{err}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <form onSubmit={handleUpdate}>
        <div className="mb-3">
          <label className="form-label">Bio</label>
          <textarea
            name="bio"
            className="form-control"
            value={formData.bio}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Status</label>
          <input
            type="text"
            name="location"
            className="form-control"
            value={formData.status}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Update Profile
        </button>
      </form>
      <h1>{profile.avatar}
      {profile.bio}
      {profile.status}</h1>
      <h1>hy</h1>
    </div>
  );
}
