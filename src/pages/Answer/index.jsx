import { useEffect, useState } from "react";
import { Table, Button, Skeleton, message, Card } from "antd";
import { GET } from "../../utils/request";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Answer = () => {
  const auth = useSelector((store) => store.auth);
  const [answers, setAnswers] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  console.log(auth);
  const userId = auth.user?.id;

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        return;
      }

      try {
        setLoading(true);
        const [resultTopics, resultAnswers] = await Promise.all([
          GET("/topics"),
          GET("/answers", { userId: userId })
        ]);

        setTopics(resultTopics);

        // Tạo Map để lookup nhanh (tối ưu nếu topics nhiều)
        const topicMap = new Map(
          resultTopics.map((topic) => [String(topic.id), topic.name]) 
        );

        // Enrich answers: Chuyển topicId về string 
        const enrichedAnswers = resultAnswers.map((answer) => ({
          ...answer,
          name: topicMap.get(String(answer.topicId)) || "Chưa xác định"
        }));

        setAnswers(enrichedAnswers);

      } catch (error) {
        console.error("Fetch error:", error);
        messageApi.error("Lỗi tải dữ liệu: " + (error.message || "Vui lòng thử lại"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, messageApi]);

  // Cấu hình cột cho bảng
  const columns = [
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
        <Link to={`/result/${record.id}`}>
          <Button type="primary">Xem chi tiết</Button>
        </Link>
      ),
    },
  ];

  return (
    <>
      {contextHolder}

      <Card style={{ maxWidth: 800, margin: "40px auto" }}>
        <h2 style={{ marginBottom: 20, textAlign: "center"  }}>Danh sách các bài đã làm</h2>

        {loading ? (
          <>
            <Skeleton active />
            <Skeleton active />
          </>
        ) : (
          <Table
            dataSource={answers}
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

export default Answer;