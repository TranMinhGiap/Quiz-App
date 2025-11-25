import { Link, NavLink, Outlet } from "react-router-dom";
import { Layout, Flex, Space, Button } from 'antd';
import './Layout.scss';
import { useSelector } from "react-redux";

const { Header, Footer, Content } = Layout;

const LayoutDefault = () => {
  const auth = useSelector((store) => store.auth);
  console.log(auth);

  return (
    <Layout className='layout'>
      <Header
        style={{
          position: 'sticky',
          top: 0, zIndex: 100,
          backgroundColor: 'orange',
          backdropFilter: 'blur(10px)', padding: '0 20px',
          boxShadow: '0 2px 8px #f0f1f2',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        <Flex justify='space-between' align='center'>
          {/* Logo */}
          <Space style={{ color: 'white', fontWeight: 600, fontSize: 22 }}>Quiz</Space>
          {/* Menu */}
          <Space>
            <ul className="menu">
              <li className="menu__item">
                <NavLink className="menu__link" to='/'>Home</NavLink>
              </li>
              <li className="menu__item">
                <NavLink className="menu__link" to='/topic'>Topic</NavLink>
              </li>
              <li className="menu__item">
                <NavLink className="menu__link" to='/answers'>Answer</NavLink>
              </li>
            </ul>
          </Space>
          {/* Info User */}
          <Space>
            <Link to='/login'>
              <Button color="pink" variant="solid">Đăng nhập</Button>
            </Link>
            <Link to='/register'>
              <Button color="pink" variant="solid">Đăng kí</Button>
            </Link>
          </Space>
        </Flex>
      </Header>
      <Content className="main">
        <Outlet />
      </Content>
      <Footer className="footer">Ant Design ©2025 Created by Ant</Footer>
    </Layout>
  );
};

export default LayoutDefault;