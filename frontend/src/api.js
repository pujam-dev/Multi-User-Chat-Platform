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