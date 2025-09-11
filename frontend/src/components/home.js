import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import MyModal from "../MyModal";
import Groups from "./Groups";
import { fetchWithAuth } from "../api";
import Logout from "./Logout";

export default function Home() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const username = sessionStorage.getItem("username")
  const userid = sessionStorage.getItem("userid");
  const [viewMode, setViewMode] = useState("chats");
  const [formData, setFormData] = useState({
    name: "",
    avatar: "",
  });


  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithAuth(
          "http://127.0.0.1:8000/auth/user/profile/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("access")}`,
            },
          }
        );
        const data = await res.json();
        console.log("Combined Profile Data:", data);

        if (res.ok) {
          setFormData({
            name: data.name || "",
            avatar: data.avatar || ""
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



  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithAuth(
          "http://127.0.0.1:8000/chatrooms/mychats",
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("access")}`,
            },
          }
        );
        const data = await res.json();
        console.log("my chats", data.data);
        const chatroom_id = data.data[0].chatroom_id;
        setUsers(
          Array.isArray(data.data)
            ? data.data.map((u) => ({ ...u, new_message: false }))
            : []
        );
      } catch (e) {
        setErr("No chats yet");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  //2

  useEffect(() => {
    const userId = sessionStorage.getItem("userid");
    if (!userId) return;
    const wsUrl = `ws://127.0.0.1:9000/ws/notify/${userId}`;
    console.log("connecting notify ws:", wsUrl);
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => {
      console.log("Notify WS open");
    };
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        console.log("Notify message:", data);
        if (data.type === "notify" || data.type === "notification") {

          setUsers((prevUsers) =>
            prevUsers.map((u) =>
              u.chatroom_id === data.chatroom_id
                ? { ...u, new_message: true }
                : u
            )
          );
        }
      } catch (err) {
        console.log("Notify: non-json", ev.data);
      }
    };
    ws.onerror = (err) => {
      console.error("Notify WS error", err);
    };
    ws.onclose = (evt) => {
      console.warn("Notify WS closed", evt.code, evt.reason);
    };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => {
      const name =
        u.name ||
        u.username ||
        [u.first_name, u.last_name].filter(Boolean).join(" ") ||
        "";
      const email = u.email || "";
      return (
        name.toLowerCase().includes(term) || email.toLowerCase().includes(term)
      );
    });
  }, [q, users]);

  const displayName = (u) =>

    u.name ||
    u.username ||
    [u.first_name, u.last_name].filter(Boolean).join(" ") ||
    "Unnamed User";

  const initials = (u) => {
    const n = displayName(u).trim();
    const parts = n.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() || "").join("");
  };

  const goToChat = async (u) => {
    try {
      const res = await fetchWithAuth(
        "http://127.0.0.1:8000/chatrooms/private/create/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("access")}`,
          },
          body: JSON.stringify({
            user1: userid,
            user2: u.id,
          }),
        }
      );
      //console.log(userid, u.id)
      const data = await res.json();
      if (res.ok) {
        console.log("Private room:", data);
        sessionStorage.setItem("chatRoom", JSON.stringify(data));

        window.location.href = `/chat.html`;
     
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };
  const handleProfileClick = () => {
    navigate("/profile"); // Navigate to Profile Page
  };

  const handleLogoutClick = () => {
    sessionStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="container py-4 ">

      <div className="card bg-light ">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h3>Welcome, {username}</h3>

          <div>
            <button
              className={`btn me-2 ${viewMode === "chats" ? "btn-primary" : "btn-outline-primary"
                }`}
              onClick={() => setViewMode("chats")}
            >
              Chats
            </button>
            <button
              className={`btn ${viewMode === "groups" ? "btn-primary" : "btn-outline-primary"
                }`}
              onClick={() => setViewMode("groups")}
            >
              Groups
            </button>
          </div>

          {/* Avatar + Dropdown */}
          <div className="position-relative">
            {formData.avatar ?
              <img
                src={`http://127.0.0.1:8000/auth/user${formData.avatar}`}
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                style={{
                  width: "40px",
                  height: "40px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
              </img>
              :
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                style={{
                  width: "40px",
                  height: "40px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {(username.split(/\s+/).slice(0, 2)).map((p) => p[0]?.toUpperCase() || "").join("")}
              </div>}
            {dropdownOpen && (
              <div
                className="position-absolute bg-white border rounded shadow"
                style={{ top: "50px", right: 0, minWidth: "150px", zIndex: 10 }}
              >
                <button className="dropdown-item m-2 border" onClick={handleProfileClick}>
                  Profile
                </button>
                <button
                  className="dropdown-item m-2 border"
                  onClick={handleLogoutClick}
                >
                  <Logout />
                </button>
              </div>
            )}
          </div>
        </div>
        {/* <div className="card-header d-flex align-items-center justify-content-between">
         

          <div className="d-flex" style={{ gap: 8 }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="form-control"
              placeholder="Search users..."
              style={{ width: 240 }}
            />
          </div>
        </div> */}
      </div>
      {viewMode === "chats" ? (<>
        <div className="card shadow-sm mt-4">
          <h4 className="card-header ">Chats</h4>
          <div className=" card  list-group list-group-flush">
            {loading && (
              <div className="list-group-item text-secondary">Loading…</div>
            )}
            {err && !loading && (
              <div className="list-group-item text-danger">{err}</div>
            )}
            {!loading && !err && filtered.length === 0 && (
              <div className="list-group-item text-secondary">No users found</div>
            )}

            {!loading &&
              !err &&
              filtered.map((u) => (
                <div
                  key={u.id}
                  className="list-group-item d-flex align-items-center justify-content-between"
                >
                  <div className="d-flex align-items-center" style={{ gap: 12 }}>
                    {/* Simple circle avatar with initials (no extra lib) */}
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#e9ecef",
                        fontWeight: 600,
                      }}
                    >
                      {initials(u)}
                    </div>
                    <div>
                      <div className="fw-semibold">{displayName(u)}</div>
                      <div className="text-muted small">{u.email || "-"}</div>
                      {/* <div className="text-danger">{not}</div> */}
                      <div className="text-danger">
                        {u.new_message ? "New Message" : "no new msg"}
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => goToChat(u)}
                    title={`Chat with ${displayName(u)}`}
                  >
                    Chat
                  </button>
                </div>
              ))}
          </div>

        </div>
        <MyModal msg="+" /></>
      ) : (
        <Groups />
      )}

    </div>
  );
}
