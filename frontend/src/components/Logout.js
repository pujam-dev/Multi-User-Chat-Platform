import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");

    if (!refresh) return alert("No refresh token found");

    const response = await fetch("http://127.0.0.1:8000/auth/user/logout/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access}`, // Access token जरूर भेजो
        },
        body: JSON.stringify({ refresh }),
    });

 // Safe JSON parsing
    let data = null;
    try {
        data = await response.json();
    } catch (error) {
        console.log("No JSON in response");
    }

    console.log(data);

    if (response.ok) {
        localStorage.clear();
        window.location.href = "/login";
    } else {
        alert(data?.error || "Logout failed");
    }
};

  return (
    <div className="text-center mt-5">
      <button className="btn btn-primary" onClick={handleSubmit}>
        Logout
      </button>
    </div>
  );
};

export default Logout;
