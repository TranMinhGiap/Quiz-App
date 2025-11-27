import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Skeleton,
  message,
  Progress,
  Row,
  Col,
  Divider,
  Tag,
  Typography,
  Space,
  Tooltip,
  Button,
} from "antd";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  MinusCircleTwoTone,
  SmileTwoTone,
  TrophyTwoTone,
} from "@ant-design/icons";
import confetti from "canvas-confetti";
import { GET } from "../../utils/request";

const { Title, Text } = Typography;

const Result = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [quiz, setQuiz] = useState([]);

  const [messageApi, contextHolder] = message.useMessage();

  // ============================================================
  // TÍNH TOÁN THỐNG KÊ 
  // ============================================================
  const {
    enrichedQuestions,
    total,
    correct,
    wrong,
    unanswered,
    accuracy,
  } = useMemo(() => {
    if (!submission || !quiz.length) {
      return {
        enrichedQuestions: [],
        total: 0,
        correct: 0,
        wrong: 0,
        unanswered: 0,
        accuracy: 0,
      };
    }

    const answerList = submission.answers || [];

    const enriched = quiz.map((q, index) => {
      const answerObj = answerList.find(
        (a) => String(a.questionId) === String(q.id)
      );

      const hasAnswer = !!answerObj;
      const userAnswerIndex = hasAnswer ? answerObj.answer : null;

      const isCorrect =
        hasAnswer && userAnswerIndex === q.correctAnswer;

      return {
        ...q,
        order: index + 1,
        userAnswerIndex,
        isCorrect,
        isUnanswered: !hasAnswer,
      };
    });

    const totalQ = enriched.length;
    const correctCount = enriched.filter((q) => q.isCorrect).length;
    const unansweredCount = enriched.filter((q) => q.isUnanswered).length;
    const wrongCount = totalQ - correctCount - unansweredCount;

    const acc =
      totalQ === 0 ? 0 : Math.round((correctCount / totalQ) * 100);

    return {
      enrichedQuestions: enriched,
      total: totalQ,
      correct: correctCount,
      wrong: wrongCount,
      unanswered: unansweredCount,
      accuracy: acc,
    };
  }, [submission, quiz]);

  // ============================================================
  // ĐÁNH GIÁ
  // ============================================================
  const levelInfo = useMemo(() => {
    if (accuracy >= 90) {
      return {
        label: "Xuất sắc",
        color: "green",
        desc: "Hiệu suất làm bài rất tốt, hãy tiếp tục phát huy!",
      };
    }
    if (accuracy >= 80) {
      return {
        label: "Khá",
        color: "blue",
        desc: "Bạn làm khá tốt, cố gắng thêm chút nữa sẽ lên Xuất sắc!",
      };
    }
    if (accuracy >= 50) {
      return {
        label: "Trung bình",
        color: "orange",
        desc: "Bạn cần ôn tập thêm để cải thiện kết quả.",
      };
    }
    return {
      label: "Yếu",
      color: "red",
      desc: "Đừng nản, hãy xem lại các câu sai và thử lại lần nữa nhé!",
    };
  }, [accuracy]);

  // ============================================================
  useEffect(() => {
    if (accuracy >= 80) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });

        if (Date.now() < end) requestAnimationFrame(frame);
      };

      frame();
    }
  }, [accuracy]);

  // ============================================================
  // FETCH DATA — lấy bài làm + câu hỏi
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const answerRes = await GET("/answers", { id });

        if (!Array.isArray(answerRes) || answerRes.length === 0) {
          messageApi.error("Không tìm thấy kết quả bài làm.");
          return;
        }

        const submissionObj = answerRes[0];
        setSubmission(submissionObj);

        const questionRes = await GET("/questions", {
          topicId: submissionObj.topicId,
        });

        setQuiz(Array.isArray(questionRes) ? questionRes : []);
      } catch (error) {
        console.error(error);
        messageApi.error("Có lỗi khi hiển thị kết quả bài làm.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ============================================================
  // LOADING UI
  // ============================================================
  if (loading || !submission) {
    return (
      <>
        {contextHolder}
        <Card
          style={{ maxWidth: 900, margin: "24px auto", borderRadius: 16 }}
        >
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </>
    );
  }

  // ============================================================
  // KẾT QUẢ
  // ============================================================
  return (
    <>
      {contextHolder}

      <div
        style={{
          maxWidth: 1100,
          margin: "24px auto 40px",
          padding: "0 16px",
        }}
      >
        {/* HEADER */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Space align="center">
              <TrophyTwoTone twoToneColor="#faad14" style={{ fontSize: 32 }} />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  Kết quả bài làm
                </Title>
                <Text type="secondary">
                  Mã bài làm: <strong>{submission.id}</strong>
                </Text>
              </div>
            </Space>
          </Col>
        </Row>

        {/* BANNER ĐỘNG VIÊN + CHÚC MỪNG */}
        <Card
          style={{
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            background:
              accuracy >= 80
                ? "linear-gradient(135deg, #f6ffed, #d9f7be)"
                : "linear-gradient(135deg, #fff7e6, #ffe7ba)",
            border:
              accuracy >= 80
                ? "1px solid #b7eb8f"
                : "1px solid #ffd591",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                {accuracy >= 80 ? (
                  <SmileTwoTone
                    twoToneColor="#52c41a"
                    style={{ fontSize: 36 }}
                  />
                ) : (
                  <SmileTwoTone
                    twoToneColor="#fa8c16"
                    style={{ fontSize: 36 }}
                  />
                )}

                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    {accuracy >= 80 ? "Chúc mừng bạn!" : "Cố lên bạn nhé!"}
                  </Title>

                  <Text strong>
                    {accuracy >= 80
                      ? `Bạn đã đạt ${accuracy}% — Rất xuất sắc!`
                      : `Bạn đạt ${accuracy}%. Bạn chỉ cần cố gắng thêm chút nữa!`}
                  </Text>
                </div>
              </Space>
            </Col>

            <Col>
              <Button
                size="large"
                color="primary" 
                variant="filled"
                style={{ borderRadius: 12 }}
                onClick={() => navigate(`/quiz/${submission.topicId}`)}
              >
                Làm lại bài test
              </Button>
            </Col>
          </Row>
        </Card>

        {/* ---- PHẦN THỐNG KÊ ---- */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={10}>
            <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 20 }}>
              <Row justify="center" style={{ marginBottom: 12 }}>
                <Progress
                  type="dashboard"
                  percent={accuracy}
                  strokeWidth={accuracy === 100 ? 4 : 8}
                  size={180}
                  format={(p) => `${p}% đúng`}
                />
              </Row>

              <Divider style={{ margin: "8px 0 16px" }} />

              <Row gutter={12}>
                <Col span={12}>
                  <Text type="secondary">Tổng số câu</Text>
                  <Title level={4} style={{ margin: 0 }}>
                    {total}
                  </Title>
                </Col>

                <Col span={12}>
                  <Text type="secondary">Đã trả lời</Text>
                  <Title level={4} style={{ margin: 0 }}>
                    {total - unanswered}
                  </Title>
                </Col>
              </Row>

              {/* MỨC ĐỘ ĐÁNH GIÁ */}
              <Divider style={{ margin: "8px 0 12px" }} />
              <Space vertical>
                <Text type="secondary">Đánh giá mức độ</Text>
                <Space align="center">
                  <Tag color={levelInfo.color} style={{ fontSize: 14 }}>
                    {levelInfo.label}
                  </Tag>
                  <Text type="secondary">{levelInfo.desc}</Text>
                </Space>
              </Space>
            </Card>
          </Col>

          {/* ---------- BẢN ĐỒ CÂU HỎI ---------- */}
          <Col xs={24} md={14}>
            <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 20 }}>
              <Title level={5} style={{ marginBottom: 12 }}>
                Thống kê chi tiết
              </Title>

              <Row gutter={[16, 16]}>
                {/* ĐÚNG */}
                <Col span={8}>
                  <Card
                    size="small"
                    style={{
                      borderRadius: 12,
                      background: "#f6ffed",
                      borderColor: "#b7eb8f",
                    }}
                  >
                    <Space>
                      <CheckCircleTwoTone twoToneColor="#52c41a" />
                      <div>
                        <Text type="secondary">Đúng</Text>
                        <Title level={4} style={{ margin: 0 }}>
                          {correct}
                        </Title>
                      </div>
                    </Space>
                  </Card>
                </Col>

                {/* SAI */}
                <Col span={8}>
                  <Card
                    size="small"
                    style={{
                      borderRadius: 12,
                      background: "#fff1f0",
                      borderColor: "#ffa39e",
                    }}
                  >
                    <Space>
                      <CloseCircleTwoTone twoToneColor="#ff4d4f" />
                      <div>
                        <Text type="secondary">Sai</Text>
                        <Title level={4} style={{ margin: 0 }}>
                          {wrong}
                        </Title>
                      </div>
                    </Space>
                  </Card>
                </Col>

                {/* CHƯA LÀM */}
                <Col span={8}>
                  <Card
                    size="small"
                    style={{
                      borderRadius: 12,
                      background: "#f0f5ff",
                      borderColor: "#adc6ff",
                    }}
                  >
                    <Space>
                      <MinusCircleTwoTone twoToneColor="#595959" />
                      <div>
                        <Text type="secondary">Chưa làm</Text>
                        <Title level={4} style={{ margin: 0 }}>
                          {unanswered}
                        </Title>
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>

              <Divider style={{ margin: "12px 0 8px" }} />

              {/* MINI MAP */}
              <Text type="secondary">Bản đồ câu hỏi</Text>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(32px, 1fr))",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                {enrichedQuestions.map((q) => {
                  let bg = "#f5f5f5";
                  let color = "#595959";

                  if (q.isCorrect) {
                    bg = "#f6ffed";
                    color = "#389e0d";
                  } else if (q.isUnanswered) {
                    bg = "#fafafa";
                    color = "#8c8c8c";
                  } else {
                    bg = "#fff1f0";
                    color = "#cf1322";
                  }

                  return (
                    <Tooltip
                      key={q.id}
                      title={
                        q.isUnanswered
                          ? `Câu ${q.order}: chưa làm`
                          : q.isCorrect
                          ? `Câu ${q.order}: đúng`
                          : `Câu ${q.order}: sai`
                      }
                    >
                      <div
                        style={{
                          height: 32,
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: bg,
                          color,
                          border: "1px solid #d9d9d9",
                          fontWeight: 500,
                        }}
                      >
                        {q.order}
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            </Card>
          </Col>
        </Row>

        {/* ---- DANH SÁCH CHI TIẾT ---- */}
        <Card style={{ marginTop: 24, borderRadius: 16 }} bodyStyle={{ padding: 20 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            Chi tiết từng câu hỏi
          </Title>

          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {enrichedQuestions.map((q) => {
              const userAnswerText =
                q.userAnswerIndex !== null &&
                q.userAnswerIndex !== undefined
                  ? q.answers[q.userAnswerIndex]
                  : "Chưa trả lời";

              const correctAnswerText = q.answers[q.correctAnswer];

              let statusTag;
              if (q.isUnanswered) {
                statusTag = <Tag>Chưa làm</Tag>;
              } else if (q.isCorrect) {
                statusTag = <Tag color="green">Đúng</Tag>;
              } else {
                statusTag = <Tag color="red">Sai</Tag>;
              }

              return (
                <Card
                  key={q.id}
                  size="small"
                  style={{ borderRadius: 12 }}
                  bodyStyle={{ padding: 16 }}
                >
                  <Space direction="vertical" style={{ width: "100%" }} size={8}>
                    {/* TIÊU ĐỀ CÂU */}
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Text strong>
                          Câu {q.order}. {q.question}
                        </Text>
                      </Col>
                      <Col>{statusTag}</Col>
                    </Row>

                    {/* DANH SÁCH ĐÁP ÁN */}
                    {q.answers.map((ans, idx) => {
                      const isUser = idx === q.userAnswerIndex;
                      const isCorrect = idx === q.correctAnswer;

                      let bg = "#fafafa";
                      let border = "#f0f0f0";
                      let icon = null;

                      if (isCorrect) {
                        bg = "#f6ffed";
                        border = "#b7eb8f";
                        icon = (
                          <CheckCircleTwoTone twoToneColor="#52c41a" />
                        );
                      } else if (isUser && !isCorrect) {
                        bg = "#fff1f0";
                        border = "#ffa39e";
                        icon = (
                          <CloseCircleTwoTone twoToneColor="#ff4d4f" />
                        );
                      }

                      return (
                        <div
                          key={idx}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 8,
                            border: `1px solid ${border}`,
                            background: bg,
                            display: "flex",
                            alignItems: "center",
                            marginTop: 4,
                          }}
                        >
                          <span style={{ marginRight: 8 }}>
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <span style={{ flex: 1 }}>{ans}</span>
                          {icon && (
                            <span style={{ marginLeft: 8 }}>{icon}</span>
                          )}
                        </div>
                      );
                    })}

                    {/* GIẢI THÍCH */}
                    {!q.isUnanswered && !q.isCorrect && (
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Bạn chọn: <strong>{userAnswerText}</strong> — Đáp án
                        đúng: <strong>{correctAnswerText}</strong>
                      </Text>
                    )}

                    {q.isCorrect && (
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Tuyệt vời! Bạn đã chọn đúng đáp án:{" "}
                        <strong>{correctAnswerText}</strong>
                      </Text>
                    )}

                    {q.isUnanswered && (
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Bạn chưa trả lời câu này. Đáp án đúng là{" "}
                        <strong>{correctAnswerText}</strong>.
                      </Text>
                    )}
                  </Space>
                </Card>
              );
            })}
          </Space>
        </Card>
      </div>
    </>
  );
};

export default Result;