import React, { useState } from "react";
import { register } from "../api";
const Register = () => {
  const [form, setForm] = useState({
    email: "",
    name: "",
    date_of_birth: "",
    password: "",
    password2: "",
    tc: true,
  });
  const [message, setMessage] = useState(""); // feedback message
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simple validations
    if (!form.email || !form.name || !form.password || !form.password2) {
      setMessage(":warning: Please fill all required fields.");
      return;
    }
    if (form.password !== form.password2) {
      setMessage(":x: Passwords do not match.");
      return;
    }
    try {
      const res = await register(form);
      setMessage(res.msg || ":white_check_mark: Registration successful!");
    } catch (err) {
      setMessage(":x: Registration failed. Please try again.");
    }
  };
  return (
    <div className="container mt-4 w-25 border rounded">
      <h2 className="mb-3">Register</h2>
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
          <label htmlFor="name">Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            placeholder="Enter Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="dob">Date Of Birth</label>
          <input
            type="date"
            className="form-control"
            id="dob"
            value={form.date_of_birth}
            onChange={(e) =>
              setForm({ ...form, date_of_birth: e.target.value })
            }
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
        <div className="form-group mb-3">
          <label htmlFor="password2">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            id="password2"
            placeholder="Enter Password Again"
            value={form.password2}
            onChange={(e) => setForm({ ...form, password2: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100 mb-4">
          Submit
        </button>
      </form>
    </div>
  );
};
export default Register;











