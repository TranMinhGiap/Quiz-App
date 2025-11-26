import { useEffect } from "react";
import Cookies from 'js-cookie';
import { useDispatch } from "react-redux";
import { logout } from '../../redux/features/authSlice';
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Xóa token
    Cookies.remove("token", { path: "/" });

    // Xóa user trong redux
    dispatch(logout());

    // Điều hướng
    navigate("/login", { replace: true });
  }, [dispatch, navigate]);

  return (
    <></>
  )
};

export default Logout;
