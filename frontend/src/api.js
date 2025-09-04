import Logout from "./components/Logout";

const API_URL="http://127.0.0.1:8000/auth/user";
 const token = localStorage.getItem("access");



export async function fetchWithAuth(url, options = {}) {
  let access = localStorage.getItem("access");
  let refresh = localStorage.getItem("refresh");
  console.log("options",options)
  if (!options.headers) options.headers = {};
  options.headers["Authorization"] = `Bearer ${access}`;
  options.headers["Content-Type"] = "application/json";

  let response = await fetch(url, options);

  // Agar access token expire ho gaya
  if (response.status === 401 && refresh) {
    console.warn(":warning: Access token expired, trying refresh...");

  

    let refreshRes = await fetch("http://127.0.0.1:8000/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({"refresh": refresh }),
    });
   console.log(refreshRes)
    if (refreshRes.ok) {
      // new access token
      const data = await refreshRes.json();
      localStorage.setItem("access", data.access);
     // localStorage.setItem("refresh", data.refresh);
      // retry original request with new access token
      options.headers["Authorization"] = `Bearer ${data.access}`;
      response = await fetch(url, options);
    } else {
      // refresh token invalid / blacklisted
      console.error("Refresh token invalid or blacklisted, logging out...");

      // clear localStorage + redirect to login
      localStorage.clear();
     // window.location.href = "/login"; // adjust your login page path
      return; // stop further execution
    }
  }

  return response;
}




export const register = async(userData)=>{
 const data = await fetch(`${API_URL}/register/`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(userData)
 })
 const json = await data.json()
//console.log(json)
 if (data.ok) {
    localStorage.setItem("access",json.token.access);
    localStorage.setItem("refresh",json.token.refresh);
 }
 return json
}

export const login = async(userData)=>{
 const data = await fetch(`${API_URL}/login/`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(userData)
 })
 const json = await data.json()

 if (data.ok) {
    localStorage.setItem("access",json.token.access);
    localStorage.setItem("refresh",json.token.refresh);
     localStorage.setItem("userid",json.data.userid);
    localStorage.setItem("username",json.data.username);
 }
 return json
}

export const getUsers = async () => {

  const res = await fetchWithAuth(`${API_URL}/users/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,  // 👈 yaha token bhejna zaroori hai
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  return await res.json();
};

export const createGroup= async (userData)=>{
     const res = await fetchWithAuth(`http://127.0.0.1:8000/chatrooms/public/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,  // 👈 yaha token bhejna zaroori hai
    },body:JSON.stringify(userData)
  });
  const data = await res.json()
//  console.log(data)
    if (!res.ok) {
    throw new Error("Failed to create group");
  }
 return data;
}

