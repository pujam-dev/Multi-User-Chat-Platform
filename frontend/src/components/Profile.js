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
    bio: "",
    status: "",
    avatar:"",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithAuth(
          "http://127.0.0.1:8000/auth/user/profile/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
        const data = await res.json();
        console.log("Combined Profile Data:", data);

        if (res.ok) {
          setProfile(data);
          setFormData({
            email: data.email || "",
            name: data.name || "",
            date_of_birth: data.date_of_birth || "",
            bio: data.bio || "",
            status: data.status || "",
            avatar:data.avatar || ""
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
    // setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    const {name,value,files}=e.target
    if ( name === "avatar"){
      setFormData((prev)=>({...prev, avatar:files[0]}))
    } else{
      setFormData((prev)=>({...prev,[name]:value}))
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccessMsg("");

    const formDataToSend= new FormData();
    formDataToSend.append("bio",formData.bio)
    formDataToSend.append("status",formData.status)
    formDataToSend.append("avatar",formData.avatar)


    try {
      const res = await fetchWithAuth(
        "http://127.0.0.1:8000/auth/user/profile/",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
          body:formDataToSend,
        }
      );
      const data = await res.json();
      if (res.ok) {
        setProfile((prev) => ({
          ...prev,
          ...data.data,
        }));
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
    <div className="container py-5" style={{ maxWidth: "600px", backgroundColor: "#f8f9fa", borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
      <h3 className="text-center mb-4">User Profile</h3>

      {err && <div className="alert alert-danger">{err}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Avatar */}
      <div className="text-center mb-4">
        {profile.avatar ? (
          <img
            src={`http://127.0.0.1:8000/auth/user${profile.avatar}`}
            alt="User Avatar"
            className="rounded-circle border"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              border: "3px solid #007bff",
            }}
          />
        ) : (
          <div
            className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
            style={{
              width: "120px",
              height: "120px",
              fontSize: "48px",
              border: "3px solid #007bff",
            }}
          >
            {profile.name ? profile.name[0].toUpperCase() : "U"}
          </div>
        )}
      </div>

      <form onSubmit={handleUpdate}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name" disabled
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com" disabled
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            className="form-control"
            value={formData.date_of_birth}
            onChange={handleChange} disabled
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Avatar</label>
          <input 
           type="file"
            name="avatar"
            className="form-control"
            rows="3"
            onChange={handleChange}
            placeholder="Upload ur avatar here"
            accept="image/*"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Bio</label>
          <textarea
            name="bio"
            className="form-control"
            rows="3"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us something about yourself..."
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Status</label>
          <input
            type="text"
            name="status"
            className="form-control"
            value={formData.status}
            onChange={handleChange}
            placeholder="Your current status"
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Update Profile
        </button>
      </form>

    </div>


  );
}
