const API_URL="http://127.0.0.1:8000/auth/user";
 const token = localStorage.getItem("access");

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

  const res = await fetch(`${API_URL}/users/`, {
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
     const res = await fetch(`http://127.0.0.1:8000/chatrooms/public/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,  // 👈 yaha token bhejna zaroori hai
    },body:JSON.stringify(userData)
  });
  const data = await res.json()
  console.log(data)
    if (!res.ok) {
    throw new Error("Failed to create group");
  }
 return data;
}