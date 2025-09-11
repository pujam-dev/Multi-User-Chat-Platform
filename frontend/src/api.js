import Logout from "./components/Logout";

const API_URL = "http://127.0.0.1:8000/auth/user";
const token = sessionStorage.getItem("access");



export async function fetchWithAuth(url, options = {}) {
  let access = sessionStorage.getItem("access");
  let refresh = sessionStorage.getItem("refresh");
  //console.log("options",options)
  if (!options.headers) options.headers = {};
  options.headers["Authorization"] = `Bearer ${access}`;
  if (!(options.body instanceof FormData)) {
    options.headers["Content-Type"] = "application/json"
  }

  let response = await fetch(url, options);


  if (response.status === 401 && refresh) {
    console.warn(":warning: Access token expired, trying refresh...");



    let refreshRes = await fetch("http://127.0.0.1:8000/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "refresh": refresh }),
    });

    console.log(refreshRes)
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      sessionStorage.setItem("access", data.access);
      options.headers["Authorization"] = `Bearer ${data.access}`;

      response = await fetch(url, options);
    } else {
      console.error("Refresh token invalid or blacklisted, logging out...");

      sessionStorage.clear();
      return;
    }
  }

  return response;
}




export const register = async (userData) => {
  const data = await fetch(`${API_URL}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  })
  const json = await data.json()
 // console.log(json)
  if (data.ok) {
    sessionStorage.setItem("access", json.token.access);
    sessionStorage.setItem("refresh", json.token.refresh);
    sessionStorage.setItem("userid", json.data.id);
    sessionStorage.setItem("username", json.data.name);
  }
  return json
}

export const login = async (userData) => {
  const data = await fetch(`${API_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  })
  const json = await data.json()

  if (data.ok) {
    sessionStorage.setItem("access", json.token.access);
    sessionStorage.setItem("refresh", json.token.refresh);
    sessionStorage.setItem("userid", json.data.userid);
    sessionStorage.setItem("username", json.data.username);
  }
  return json
}

export const getUsers = async () => {

  const res = await fetchWithAuth(`${API_URL}/users/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  return await res.json();
};

export const createGroup = async (userData) => {
  const res = await fetchWithAuth(`http://127.0.0.1:8000/chatrooms/public/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    }, body: JSON.stringify(userData)
  });
  const data = await res.json()
  //  console.log(data)
  if (!res.ok) {
    throw new Error("Failed to create group");
  }
  return data;
}

