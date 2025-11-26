import { Form, Input, Button, Typography, Card, message } from "antd";
import { LockOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import Cookies from 'js-cookie';
import { useState } from "react";
import { POST, GET } from "../../utils/request";
import { useDispatch } from "react-redux";
import { setAuth } from "../../redux/features/authSlice";

const Register = () => {

  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const { Title } = Typography;

  const navigate = useNavigate();

  // call api
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const token = btoa(Math.random().toString(36).substring(2) + Date.now());
      const payload = {
        email: values.email,
        fullName: values.fullName,
        password: values.password,
        token
      }
      const checkExitsEmail = await GET('/users', { email: payload.email });
      if(checkExitsEmail && checkExitsEmail.length > 0){
        messageApi.open({
          type: 'error',
          content: "Email đã tồn tại! Vui lòng nhập email khác"
        });
      } else {
        const result = await POST("/users", payload);
        if (result) {
          Cookies.set('token', result.token, { secure: true, sameSite: 'strict' });
          dispatch(setAuth(result));
          navigate("/", { replace: true });
        } else {
          messageApi.open({
            type: 'error',
            content: "Có lỗi khi tạo tài khoản"
          });
        }
      }
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
            Đăng ký
          </Title>

          <Form name="register" onFinish={onFinish} layout="vertical">
            <Form.Item
              name="fullName"
              label="Tên người dùng"
              rules={[{ required: true, message: "Vui lòng nhập tên người dùng!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Tên người dùng" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
            </Form.Item>

            <Form.Item
              name="confirm"
              label="Xác nhận mật khẩu"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu không trùng khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading} disabled={loading}>
                Đăng ký
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default Register;