import "./App.css";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Profile from "./components/Profile";
// import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Register from "./components/Register";
function App() {
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
    },
     {
      path: "/logout",
      element: <Logout />,
    },
  ]);

  return (

  <div className="App">
    <RouterProvider router={appRouter} />
  </div>

);
}

export default App;
