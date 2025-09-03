import React, { useState } from "react";
import { login } from "../api";
import { Link, useNavigate } from "react-router-dom";   // ✅ import navigate

const Login = () => {
  
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();   // ✅ initialize navigate

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setMessage(":warning: Please fill all required fields.");
      return;
    }

    try {
      const res = await login(form);
      console.log(res)
     
      if (res) {
         setMessage(" login successful!");
        // ✅ redirect to Home after 1 sec
        setTimeout(() => {
          navigate("/home");
        }, 500);
      } else {
        alert(res.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Error:", err);
    }


};
return (
  <div className="container mt-4 w-25 border rounded">
    <h2 className="mb-3">Login</h2>
    {message && <div className="alert alert-info">{message}</div>}
    <form onSubmit={handleSubmit}>
      <div className="form-group mb-3">
        <label htmlFor="email">Email address</label>
        <input
          type="email"
          className="form-control"
          id="email"
          placeholder="Enter email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>
      <div className="form-group mb-3">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          className="form-control"
          id="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary w-100 mb-4">
        Login
      </button>
      <p>Don't have an account !! <Link to="/">Register</Link> </p>
    </form>
  </div>
);
};
export default Login;











