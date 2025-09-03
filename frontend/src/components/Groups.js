import { useEffect, useState } from "react";
import { Button, Card, ListGroup, Spinner } from "react-bootstrap";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const userid = localStorage.getItem("userid");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          "http://127.0.0.1:8000/chatrooms/public/groups",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
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
      const res = await fetch(
        `http://127.0.0.1:8000/chatrooms/public/crud/${groupId}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
          body: JSON.stringify({
            participant_id: [parseInt(userid)],
            name: name,
            room_type: room_type,
          }),
        }
      );

      const data = await res.json();
      console.log("inside joingroup", data);
      if (res.ok) {
        alert(`You joined ${data.name || "the group"} successfully!`);
        // Optional: update UI so that Join button gets disabled
        setGroups((prev) =>
          prev.map((g) => (g.id === groupId ? { ...g, joined: true } : g))
        );
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Error joining group:", err);
    }
  };

  return (
    <Card className="mt-4 shadow-sm">
      <Card.Header>Available Groups</Card.Header>
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
                  {(g.participant_id).length || 0} members
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={g.joined}
                onClick={() => joinGroup(g.id, g.name, g.room_type)}
              >
                {g.joined ? "Joined" : "Join"}
              </Button>
            </ListGroup.Item>
          ))}
      </ListGroup>
    </Card>
  );
}
