import "./App.css";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Profile from "./components/Profile";
// import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider ,redirect} from 'react-router-dom';
import Register from "./components/Register";
import Home from "./components/home";
function App() {

  function requireAuth(){
    const token = sessionStorage.getItem("access")
    if (!token){
      return redirect("/login")
    }
    return null
  }

  const appRouter = createBrowserRouter([
    {
      path: "/",
      element: <Register />,
      
    },
      {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/profile",
      element: <Profile />,
      loader:()=> requireAuth(),
    },
     {
      path: "/logout",
      element: <Logout />,
      loader:()=> requireAuth(),
    },
      {
      path: "/home",
      element: <Home />,
      loader:()=> requireAuth(),
    },
    
  ]);

  return (

  <div className="App">
    <RouterProvider router={appRouter} />
  </div>

);
}

export default App;
