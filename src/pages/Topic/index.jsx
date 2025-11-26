import { useEffect, useState } from "react";
import { Table, Button, Skeleton, message, Card } from "antd";
import { GET } from "../../utils/request";
import { Link } from "react-router-dom";

const Topic = () => {
  const [topic, setTopic] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await GET("/topics");
        setTopic(result);
      } catch (error) {
        messageApi.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
      width: "80px",
      align: "center",
    },
    {
      title: "Tên chủ đề",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "",
      key: "action",
      width: "120px",
      align: "center",
      render: (_, record) => (
        <Link to={`/quiz/${record.id}`}>
          <Button type="primary">Làm bài</Button>
        </Link>
      ),
    },
  ];

  return (
    <>
      {contextHolder}

      <Card style={{ maxWidth: 800, margin: "40px auto" }}>
        <h2 style={{ marginBottom: 20, textAlign: "center"  }}>Danh sách chủ đề ôn luyện</h2>

        {loading ? (
          <>
            <Skeleton active />
            <Skeleton active />
          </>
        ) : (
          <Table
            dataSource={topic}
            columns={columns}
            rowKey="id"
            bordered
            pagination={false}
          />
        )}
      </Card>
    </>
  );
};

export default Topic;
