// import React, { useState } from "react";
// import { register } from "../api";
// import { Link, useNavigate } from "react-router-dom"; 

// const Register = () => {
//   const [form, setForm] = useState({
//     email: "",
//     name: "",
//     date_of_birth: "",
//     password: "",
//     password2: "",
//     tc: true,
//   });
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate(); 

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();

//   //   if (!form.email || !form.name || !form.password || !form.password2) {
//   //     setMessage(":warning: Please fill all required fields.");
//   //     return;
//   //   }
//   //   if (form.password !== form.password2) {
//   //     setMessage(":x: Passwords do not match.");
//   //     return;
//   //   }

//   //   try {
//   //     const res = await register(form);
//   //     console.log("res ",res)
//   //     if (res && !res.errors) {
//   //       setMessage(" Registration successful!");
       
//   //       setTimeout(() => {
//   //         navigate("/home");
//   //       }, 500);
//   //     } else {
       
//   //       setMessage(res.errors.email)
//   //     }

//   //   } catch (err) {
//   //     setMessage(":x: Registration failed. Please try again.");
//   //   }
//   // };
  
//   const handleSubmit = async (e) => {
//   e.preventDefault();
//   if (!form.email || !form.name || !form.password || !form.password2) {
//     setMessage(":warning: Please fill all required fields.");
//     return;
//   }
//   if (form.password !== form.password2) {
//     setMessage(":x: Passwords do not match.");
//     return;
//   }
//   // Password strength validation
//   const passwordRegex =
//     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
//   if (!passwordRegex.test(form.password)) {
//     setMessage(
//       " Password must be at least 8 characters long, include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
//     );
//     return;
//   }
//   try {
//     const res = await register(form);
//     console.log("res ", res);
//     if (res && !res.errors) {
//       setMessage(":white_check_mark: Registration successful!");
//       setTimeout(() => {
//         navigate("/home");
//       }, 500);
//     } else {
//       setMessage(res.errors.email || ":x: Something went wrong");
//     }
//   } catch (err) {
//     setMessage(":x: Registration failed. Please try again.");
//   }
// };

//   return (
//     <div className="container  d-flex justify-content-center align-items-center vh-100">
//       <div className="p-4 bg-light border rounded shadow-lg" >
//       <h2 className="mb-3">Register</h2>
//       {message && <div className="alert alert-info">{message}</div>}
//       <form onSubmit={handleSubmit}>
//         <div className="form-group mb-3">
//           <label htmlFor="email">Email address</label>
//           <input
//             type="email"
//             className="form-control"
//             id="email"
//             placeholder="Enter email"
//             value={form.email}
//             onChange={(e) => setForm({ ...form, email: e.target.value })}
//             required
//           />
//         </div>
//         <div className="form-group mb-3">
//           <label htmlFor="name">Name</label>
//           <input
//             type="text"
//             className="form-control"
//             id="name"
//             placeholder="Enter Name"
//             value={form.name}
//             onChange={(e) => setForm({ ...form, name: e.target.value })}
//             required
//           />
//         </div>
//         <div className="form-group mb-3">
//           <label htmlFor="dob">Date Of Birth</label>
//           <input
//             type="date"
//             className="form-control"
//             id="dob"
//             value={form.date_of_birth}
//             onChange={(e) =>
//               setForm({ ...form, date_of_birth: e.target.value })
//             }
//           />
//         </div>
//         <div className="form-group mb-3">
//           <label htmlFor="password">Password</label>
//           <input
//             type="password"
//             className="form-control"
//             id="password"
//             placeholder="Password"
//             value={form.password}
//             onChange={(e) => setForm({ ...form, password: e.target.value })}
//             required
//           />
//         </div>
//         <div className="form-group mb-3">
//           <label htmlFor="password2">Confirm Password</label>
//           <input
//             type="password"
//             className="form-control"
//             id="password2"
//             placeholder="Enter Password Again"
//             value={form.password2}
//             onChange={(e) => setForm({ ...form, password2: e.target.value })}
//             required
//           />
//         </div>
//         <button type="submit" className="btn btn-primary w-100 mb-4">
//           Submit
//         </button>
//         <p>Already have an account !! <Link to="/login">Login</Link> </p>
//       </form>
//       </div>
//     </div>
//   );
// };
// export default Register;


import React, { useState } from "react";
import { register } from "../api";
import { Link, useNavigate } from "react-router-dom";
const Register = () => {
  const [form, setForm] = useState({
    email: "",
    name: "",
    date_of_birth: "",
    password: "",
    password2: "",
    tc: true,
  });
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }
    return "";
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.name || !form.password || !form.password2) {
      setMessage(" Please fill all required fields.");
      return;
    }
    if (form.password !== form.password2) {
      setMessage(" Passwords do not match.");
      return;
    }
    const pwdError = validatePassword(form.password);
    if (pwdError) {
      setPasswordError(pwdError);
      return;
    } else {
      setPasswordError("");
    }
    try {
      const res = await register(form);
      console.log("res ", res);
      if (res && !res.errors) {
        setMessage(" Registration successful!");
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        setMessage(res.errors.email);
      }
    } catch (err) {
      setMessage(":x: Registration failed. Please try again.");
    }
  };
  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="p-4 bg-light border rounded shadow-lg" style={{ maxWidth: "500px", width: "100%" }}>
        <h2 className="mb-4 text-center">Register</h2>
        {message && <div className="alert alert-info text-center">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label>Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label>Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label>Date Of Birth</label>
            <input
              type="date"
              className="form-control"
              value={form.date_of_birth}
              onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
            />
          </div>
          <div className="form-group mb-3">
            <label>Password</label>
            <input
              type="password"
              className={`form-control ${passwordError ? "is-invalid" : ""}`}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            {passwordError && <div className="invalid-feedback">{passwordError}</div>}
          </div>
          <div className="form-group mb-3">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Re-enter password"
              value={form.password2}
              onChange={(e) => setForm({ ...form, password2: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-3">
            Register
          </button>
          <p className="text-center">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};
export default Register;















