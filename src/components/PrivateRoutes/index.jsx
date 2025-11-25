import { Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = () => {
  const isLogin = true;
  return (
    <>
      {isLogin ? <Outlet/> : <Navigate to='/login' />}
    </>
  );
};

export default PrivateRoutes;