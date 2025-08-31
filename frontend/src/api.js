const API_URL="http://127.0.0.1:8000/auth/user";


export const register = async(userData)=>{
 const data = await fetch(`${API_URL}/register/`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(userData)
 })
 const json = await data.json()

 if (data.ok) {
    localStorage.setItem("access",json.token.access);
    localStorage.setItem("refresh",json.token.refresh);
 }
 return json
}

export const getUsers = async () => {
  const token = localStorage.getItem("access"); // login ke time save kiya tha
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
