import LayoutDefault from "../layout";
import PrivateRoutes from "../components/PrivateRoutes";
import Home from "../pages/Home";
import Error404 from "../pages/Error404";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Answer from "../pages/Answer";
import Quiz from "../pages/Quiz";
import Topic from "../pages/Topic";
import Result from "../pages/Result";
import Logout from "../pages/Logout";

const routes = [
  {
    path: "/",
    element: <LayoutDefault/>,
    children: [
      {
        index: true,
        element: <Home/>
      },
      {
        path: "/login",
        element: <Login/>
      },
      {
        path: "/register",
        element: <Register/>
      },
      {
        element: <PrivateRoutes/>,
        children: [
          {
            path: '/answers',
            element: <Answer/>
          },
          {
            path: '/quiz/:id',
            element: <Quiz/>
          },
          {
            path: '/result',
            element: <Result/>
          },
          {
            path: '/topic',
            element: <Topic/>
          },
          {
            path: '/logout',
            element: <Logout/>
          }
        ]
      },
      {
        path: "*",
        element: <Error404/>
      }
    ]
  }
];

export default routes;