import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Radio,
  Button,
  Skeleton,
  message,
  Progress,
  Row,
  Col,
  Divider,
} from "antd";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  MinusCircleTwoTone,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { GET, POST } from "../../utils/request";
import { useSelector } from "react-redux";

// ==========================
// QUIZ COMPONENT
// ==========================
const Quiz = () => {
  const [topic, setTopic] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const auth = useSelector((store) => store.auth);

  const { id } = useParams();
  const [messageApi, contextHolder] = message.useMessage();
  const questionRefs = useRef([]);

  // FETCH DATA
  // ==========================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [resultTopic, resultQuiz] = await Promise.all([
          GET("/topics", { id }),
          GET("/questions", { topicId: id })
        ]);

        setTopic(resultTopic[0]);
        setQuiz(resultQuiz);

        questionRefs.current = resultQuiz.map(() => React.createRef());
      } catch (err) {
        messageApi.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ==========================
  // PROGRESS
  // ==========================
  const answeredCount = Object.keys(answers).length;
  const progressPercent =
    quiz.length > 0 ? Math.round((answeredCount / quiz.length) * 100) : 0;

  // ==========================
  // SCROLL HANDLER
  // ==========================
  const scrollToQuestion = (index) => {
    questionRefs.current[index].current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  // ==========================
  // SUBMIT QUIZ
  // ==========================
  const handleSubmit = async () => {
    if(!auth.user.id){
      return;
    }
    let correct = 0;

    quiz.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    // Lưu kết quả bài làm
    const result = Object.entries(answers).map(([k, v]) => ({ questionId: k, answer: v }));
    const newAnswer = {
      userId: auth.user.id,
      topicId: id,
      answers: result
    }

    try {
      const result = await POST("/answers", newAnswer);
      if (result) {
        messageApi.open({
          type: 'success',
          content: "Kết quả bài làm đã được lưu"
        });
      }
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: "Có lỗi khi lưu kết quả bài làm"
      });
    }
  };

  // Redo Quiz
  const handleRedo = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    messageApi.open({
      type: 'success',
      content: "Bắt đầu làm lại bài"
    });
  }

  // ==========================
  // GET STATUS ICON
  // ==========================
  const getStatusIcon = (q) => {
    if (isSubmitted) {
      if (answers[q.id] === q.correctAnswer)
        return <CheckCircleTwoTone twoToneColor="#52c41a" />;
      if (answers[q.id] !== undefined)
        return <CloseCircleTwoTone twoToneColor="#ff4d4f" />;
      return <MinusCircleTwoTone twoToneColor="#d9d9d9" />;
    }

    return answers[q.id] !== undefined ? (
      <CheckCircleTwoTone twoToneColor="#1677ff" />
    ) : (
      <MinusCircleTwoTone twoToneColor="#d9d9d9" />
    );
  };

  // ==========================
  // GET STATUS COLOR FOR GRID
  // ==========================
  const getStatusColor = (q) => {
    if (isSubmitted) {
      if (answers[q.id] === q.correctAnswer) return "#52c41a";
      if (answers[q.id] !== undefined) return "#ff4d4f";
      return "#d9d9d9";
    }
    return answers[q.id] !== undefined ? "#1677ff" : "#d9d9d9";
  };

  return (
    <>
      {contextHolder}

      <Row
        gutter={[20, 20]}
        style={{
          maxWidth: 1400,
          margin: "30px auto",
        }}
      >
        {/* ==========================
            LEFT PANEL (Navigator + Progress)
        ========================== */}
        <Col xs={24} md={8} lg={6} xl={6}>
          <Card
            style={{
              position: "sticky",
              top: 20,
              padding: 20,
              borderRadius: 12,
            }}
          >
            <h3 style={{ textAlign: "center" }}>Tiến độ làm bài</h3>

            <Progress
              percent={progressPercent}
              status={isSubmitted ? "success" : "active"}
              strokeColor={isSubmitted ? "#52c41a" : "#1677ff"}
            />

            <p style={{ textAlign: "center", fontWeight: 500 }}>
              {answeredCount}/{quiz.length} câu
            </p>

            <Divider />

            <h4 style={{ textAlign: "center" }}>Danh sách câu hỏi</h4>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 10,
              }}
            >
              {quiz.map((q, index) => (
                <div
                  key={q.id}
                  onClick={() => scrollToQuestion(index)}
                  style={{
                    padding: "8px 0",
                    borderRadius: 8,
                    background: getStatusColor(q),
                    color: "#fff",
                    cursor: "pointer",
                    textAlign: "center",
                    fontWeight: 600,
                    userSelect: "none",
                  }}
                >
                  {index + 1}
                </div>
              ))}
            </div>

            {!isSubmitted && quiz.length > 0 ? (
              <Button type="primary" size="large" block style={{ marginTop: 25 }} onClick={handleSubmit}>
                Nộp bài
              </Button>
            ) : (
              <Button color="primary" variant="filled" size="large" block style={{ marginTop: 25 }} onClick={handleRedo}>
                Làm lại
              </Button>
            )}
          </Card>
        </Col>

        {/* ==========================
            RIGHT PANEL (Questions)
        ========================== */}
        <Col xs={24} md={16} lg={18} xl={18}>
          <Card style={{ padding: 20, borderRadius: 12 }}>
            {loading || !topic ? (
              <>
                <Skeleton active />
                <Skeleton active />
                <Skeleton active />
              </>
            ) : (
              <>
                <h2 style={{ textAlign: "center", fontSize: 28, marginBottom: 20 }}>
                  Quiz: <span style={{ color: "#1677ff" }}>{topic.name}</span>
                </h2>

                {quiz.map((q, index) => (
                  <Card
                    key={q.id}
                    ref={questionRefs.current[index]}
                    style={{
                      marginBottom: 25,
                      borderRadius: 12,
                      background: "#fafafa",
                      transition: "0.3s",
                    }}
                    hoverable
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {getStatusIcon(q)}
                      <h3>
                        Câu {index + 1}: {q.question}
                      </h3>
                    </div>

                    <Radio.Group
                      onChange={(e) =>
                        setAnswers({ ...answers, [q.id]: e.target.value })
                      }
                      value={answers[q.id]}
                      disabled={isSubmitted}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {q.answers.map((ans, idx) => (
                          <Radio value={idx} key={idx}>
                            {ans}
                          </Radio>
                        ))}
                      </div>
                    </Radio.Group>

                    {isSubmitted && (
                      <p style={{ marginTop: 10 }}>
                        {answers[q.id] === q.correctAnswer ? (
                          <span style={{ color: "green" }}>✔ Chính xác</span>
                        ) : (
                          <span style={{ color: "red" }}>
                            ✘ Sai — Đáp án đúng: <b>{q.answers[q.correctAnswer]}</b>
                          </span>
                        )}
                      </p>
                    )}
                  </Card>
                ))}

                {/* ==========================
                    RESULT PANEL + BANNER
                ========================== */}
                {isSubmitted && (
                  <>
                    <Card
                      style={{
                        marginTop: 30,
                        textAlign: "center",
                        background: "#f6ffed",
                        borderColor: "#b7eb8f",
                      }}
                    >
                      <h2>
                        Kết quả: {score}/{quiz.length} câu đúng
                      </h2>

                      <p>
                        {score === quiz.length
                          ? "Tuyệt vời! Bạn đã trả lời đúng toàn bộ!"
                          : score >= quiz.length / 2
                            ? "Bạn làm rất tốt!"
                            : "Cố gắng hơn lần sau nhé!"}
                      </p>
                    </Card>
                  </>
                )}
              </>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Quiz;