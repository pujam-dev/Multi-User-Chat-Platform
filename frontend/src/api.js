import Logout from "./components/Logout";

const API_URL="http://127.0.0.1:8000/auth/user";
 const token = localStorage.getItem("access");



export async function fetchWithAuth(url, options = {}) {
    let access = localStorage.getItem("access");
    let refresh = localStorage.getItem("refresh");
    if (!options.headers) {
        options.headers = {};
    }
    options.headers["Authorization"] = `Bearer ${access}`;
    options.headers["Content-Type"] = "application/json";
    let response = await fetch(url, options);
    // अगर access token expire हो गया
    const refreshPayload={
      refresh:localStorage.getItem("refresh"),
    }
    if (response.status === 401 && refresh) {
        console.warn(":warning: Access token expired, trying refresh...");
        let refreshRes = await fetch("http://127.0.0.1:8000/token/refresh/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(refreshPayload)
        });
        console.log(refreshRes)

        if (refreshRes.ok) {
           // console.log("if is working")
            let data = await refreshRes.json();
            localStorage.setItem("access", data.access);
            // दोबारा request try करो
            options.headers["Authorization"] = `Bearer ${data.access}`;
            response = await fetch(url, options);
        } else {
            console.error("Refresh token invalid, please login again.");
            // logout logic
            // <Logout/>
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

