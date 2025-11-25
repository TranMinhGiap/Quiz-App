import { Form, Input, Button, Typography, Card, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import Cookies from 'js-cookie';
import { useState } from "react";
import { GET } from "../../utils/request";
import { useDispatch } from "react-redux";
import { setAuth } from "../../redux/features/authSlice";

const Login = () => {

  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const { Title } = Typography;

  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await GET("/users", values);
      if(result && result.length > 0){
        navigate("/", { replace: true });
        Cookies.set('token', result[0].token, { secure: true, sameSite: 'strict' });
        dispatch(setAuth(result[0]))
      } else {
        messageApi.open({
          type: 'error',
          content: "Tài khoản hoặc mật khẩu không đúng"
        });
      }
      // // Lưu token
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 164px)" }}>
        <Card style={{ width: 450, padding: 20, boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
          <Title level={3} style={{ textAlign: "center" }}>
            Đăng nhập
          </Title>

          <Form name="login" onFinish={onFinish} layout="vertical">
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: "Vui lòng nhập email!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading} disabled={loading}>
                Đăng nhập
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default Login;