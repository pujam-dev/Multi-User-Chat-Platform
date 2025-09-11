import { useEffect, useState } from "react";
import { Button, Card, ListGroup, Spinner } from "react-bootstrap";
import { fetchWithAuth } from "../api";
import { useNavigate } from "react-router-dom";
import MyModal from "../MyModal";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const userid = sessionStorage.getItem("userid");
   const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithAuth(
          "http://127.0.0.1:8000/chatrooms/public/groups",
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("access")}`,
            },
          }
        );
        const data = await res.json();
        console.log("Groups:", data);
        setGroups(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr("Unable to load groups");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const joinGroup = async (groupId, name, room_type) => {
    try {
      const res = await fetchWithAuth(
        `http://127.0.0.1:8000/chatrooms/public/crud/${groupId}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("access")}`,
          },
          body: JSON.stringify({
            participant_id: [parseInt(userid)],
            name: name,
            room_type: room_type,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem("chatRoom", JSON.stringify(data));
        setTimeout(() => {
          window.location.href = `/chat.html`;
        }, 1000);
        setGroups((prev) =>
          prev.map((g) =>
            g.id === groupId ? { ...g, joined: true } : g
          )
        );
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Error joining group:", err);
    }
  };

  const leaveGroup = async (groupId) => {
    try {
      const res = await fetchWithAuth(
        `http://127.0.0.1:8000/chatrooms/public/leave/${groupId}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("access")}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert(data.msg || "Left group successfully");
        setGroups((prev) =>
          prev.map((g) =>
            g.id === groupId ? { ...g, joined: false } : g
          )
        );
      } else {
        alert(data.error || "Failed to leave group");
      }
    } catch (err) {
      console.error("Error leaving group:", err);
    }
  };

  return (
    <div>
     
      <Card className="mt-4 shadow-sm">
         <h4 className="card-header ">Available Groups</h4>
      
        <ListGroup variant="flush">
          {loading && (
            <ListGroup.Item className="text-secondary">
              <Spinner animation="border" size="sm" /> Loading…
            </ListGroup.Item>
          )}
          {err && !loading && (
            <ListGroup.Item className="text-danger">{err}</ListGroup.Item>
          )}
          {!loading && !err && groups.length === 0 && (
            <ListGroup.Item className="text-secondary">
              No groups available
            </ListGroup.Item>
          )}
          {!loading &&
            !err &&
            groups.map((g) => (
              <ListGroup.Item
                key={g.id}
                className="d-flex align-items-center justify-content-between"
              >
                <div>
                  <strong>{g.name}</strong>
                  <div className="text-muted small">
                    {(g.participant_id || []).length} members
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      if (g.joined) {
                        sessionStorage.setItem(
                          "chatRoom",
                          JSON.stringify(g)
                        );
                      //  window.location.href = `/chat.html`;
                         navigate("/chat");
                      } else {
                        joinGroup(g.id, g.name, g.room_type);
                      }
                    }}
                  >
                    {g.joined ? "Chat" : "Join"}
                  </Button>

                  {g.joined && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        leaveGroup(g.id);
                      }}
                    >
                      Leave
                    </Button>
                  )}
                </div>
              </ListGroup.Item>
            ))}
        </ListGroup>
      </Card>
      <MyModal msg="Create Group" />
    </div>
  );
}
