import { useEffect, useMemo, useState } from "react";
//import { useNavigate } from "react-router-dom";
import { getUsers } from "../api";
import MyModal from "../MyModal";

export default function UserList() {
  //const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  //const username = localStorage.getItem("username")
  const userid = localStorage.getItem("userid")
  useEffect(() => {
    (async () => {
      try {
        const data = await getUsers(); // must return array of users
        setUsers(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr("Unable to load users");
      } finally {
        setLoading(false);
      }
    })();
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
      return name.toLowerCase().includes(term) || email.toLowerCase().includes(term);
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
    return parts.map(p => p[0]?.toUpperCase() || "").join("");
  };

  const goToChat = async (u) => {
    // Navigate to your dedicated chat page
    // You can choose either a route param or query params; both examples below.

    // Option A: /chat/:id
    // navigate(`/chat/${u.id}`, { state: { name: displayName(u) } });
    // Option B (alternative): /chat?to=<id>&name=<name>
    // navigate(`/chat?to=${u.id}&name=${encodeURIComponent(displayName(u))}`);


    try {

      const res = await fetch("http://127.0.0.1:8000/chatrooms/private/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access")}`
        },
        body: JSON.stringify({
          user1: userid,
          user2: u.id
        }),
      });
      console.log(userid, u.id)
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


    // window.location.href = `/chat.html?username=${displayName(u)}`
  };



  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-header d-flex align-items-center justify-content-between">
        
          <div className="d-flex" style={{ gap: 8 }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="form-control"
              placeholder="Search users..."
              style={{ width: 240 }}
            />
          </div>
        </div>

        <div className="list-group list-group-flush">
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



    </div>
  );
}
