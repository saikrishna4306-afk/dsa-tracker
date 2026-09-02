import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import apiClient from "../api/client";
import "../styles/Dashboard.css";

function Dashboard({ onLogout }) {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [selections, setSelections] =
    useState([]);

  const [progress, setProgress] =
    useState(null);

  const [dailyQuestion, setDailyQuestion] =
    useState(null);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] =
    useState("");

  const [topic, setTopic] = useState("");
  const [platform, setPlatform] =
    useState("");

  const [loading, setLoading] =
    useState(true);


  // ==========================================
  // GET QUESTIONS
  // ==========================================

  const getQuestions = async () => {
    try {
      const params = {};

      if (search) {
        params.search = search;
      }

      if (difficulty) {
        params.difficulty = difficulty;
      }

      if (topic) {
        params.topic = topic;
      }

      if (platform) {
        params.platform = platform;
      }

      const response =
        await apiClient.get(
          "/questions/",
          { params }
        );

      if (Array.isArray(response.data)) {
        setQuestions(response.data);
      } else {
        setQuestions(
          response.data.results || []
        );
      }

    } catch (error) {
      console.error(
        "Failed to load questions:",
        error
      );
    }
  };


  // ==========================================
  // GET MY QUESTIONS
  // ==========================================

  const getSelections = async () => {
    try {
      const response =
        await apiClient.get(
          "/progress/"
        );

      setSelections(
        response.data || []
      );

    } catch (error) {
      console.error(
        "Failed to load my questions:",
        error
      );
    }
  };


  // ==========================================
  // GET PROGRESS
  // ==========================================

  const getProgress = async () => {
    try {
      const response =
        await apiClient.get(
          "/progress/"
        );

      const data =
        response.data || [];

      const total = data.length;

      const selected =
        data.filter(
          (item) =>
            item.status === "SELECTED"
        ).length;

      const inProgress =
        data.filter(
          (item) =>
            item.status ===
            "IN_PROGRESS"
        ).length;

      const completed =
        data.filter(
          (item) =>
            item.status ===
            "COMPLETED"
        ).length;

      const percentage =
        total === 0
          ? 0
          : Math.round(
              (completed / total) *
                100
            );

      setProgress({
        total,
        selected,
        in_progress: inProgress,
        completed,
        percentage,
      });

    } catch (error) {
      console.error(
        "Failed to load progress:",
        error
      );
    }
  };


  // ==========================================
  // GET DAILY QUESTION
  // ==========================================

  const getDailyQuestion = async () => {
    try {
      const response =
        await apiClient.get(
          "/progress/daily/"
        );

      setDailyQuestion(
        response.data
      );

    } catch (error) {
      console.error(
        "No daily question:",
        error
      );

      setDailyQuestion(null);
    }
  };


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    const loadDashboard =
      async () => {
        setLoading(true);

        await Promise.all([
          getQuestions(),
          getSelections(),
          getProgress(),
          getDailyQuestion(),
        ]);

        setLoading(false);
      };

    loadDashboard();
  }, []);


  // ==========================================
  // APPLY FILTERS
  // ==========================================

  const handleFilter = async () => {
    await getQuestions();
  };


  // ==========================================
  // SELECT QUESTION
  // ==========================================

  const handleSelectQuestion =
    async (questionId) => {
      try {
        await apiClient.post(
          "/progress/",
          {
            question: questionId,
            status: "SELECTED",
          }
        );

        await getSelections();
        await getProgress();

        alert(
          "Question selected successfully!"
        );

      } catch (error) {
        console.error(
          "Question selection failed:",
          error
        );

        if (
          error.response?.status === 400
        ) {
          alert(
            "You have already selected this question."
          );
        } else {
          alert(
            "Unable to select question."
          );
        }
      }
    };


  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const handleStatusChange =
    async (
      selectionId,
      status
    ) => {
      try {
        await apiClient.patch(
          `/progress/${selectionId}/`,
          {
            status,
          }
        );

        await getSelections();
        await getProgress();

      } catch (error) {
        console.error(
          "Failed to update status:",
          error
        );

        alert(
          "Unable to update question status."
        );
      }
    };


  // ==========================================
  // FIND SELECTION
  // ==========================================

  const getQuestionSelection =
    (questionId) => {
      return selections.find(
        (selection) =>
          selection.question ===
          questionId
      );
    };


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>
          Loading Dashboard...
        </h2>
      </div>
    );
  }


  return (
    <div className="dashboard-container">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="dashboard-header">

        <div>

          <h1>DSA Tracker</h1>

          <p>
            Practice, track and improve
            your problem-solving skills.
          </p>

        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>


      {/* ======================================
          DAILY QUESTION
      ====================================== */}

      {dailyQuestion && (
        <section className="daily-question-section">

          <div className="daily-question-content">

            <div>

              <span className="daily-label">
                QUESTION OF THE DAY
              </span>

              <h2>
                {
                  dailyQuestion
                    .question?.title
                }
              </h2>

              <div className="question-meta">

                <span>
                  {
                    dailyQuestion
                      .question
                      ?.difficulty
                  }
                </span>

                <span>
                  {
                    dailyQuestion
                      .question
                      ?.topic
                  }
                </span>

                <span>
                  {
                    dailyQuestion
                      .question
                      ?.platform
                  }
                </span>

              </div>

            </div>


            <button
              className="daily-solve-button"
              onClick={() =>
                navigate(
                  `/problem/${dailyQuestion.question.id}`
                )
              }
            >
              Solve Problem →
            </button>

          </div>

        </section>
      )}


      {/* ======================================
          STATS
      ====================================== */}

      <section className="stats-grid">

        <div className="stat-card">

          <span className="stat-label">
            Total Questions
          </span>

          <strong>
            {progress?.total || 0}
          </strong>

        </div>


        <div className="stat-card">

          <span className="stat-label">
            Selected
          </span>

          <strong>
            {progress?.selected || 0}
          </strong>

        </div>


        <div className="stat-card">

          <span className="stat-label">
            In Progress
          </span>

          <strong>
            {progress?.in_progress || 0}
          </strong>

        </div>


        <div className="stat-card">

          <span className="stat-label">
            Completed
          </span>

          <strong>
            {progress?.completed || 0}
          </strong>

        </div>

      </section>


      {/* ======================================
          OVERALL PROGRESS
      ====================================== */}

      <section className="progress-section">

        <div className="progress-heading">

          <div>

            <h2>
              Overall Progress
            </h2>

            <p>
              Track your completed
              questions.
            </p>

          </div>

          <strong>
            {progress?.percentage || 0}%
          </strong>

        </div>


        <div className="progress-bar-container">

          <div
            className="progress-bar"
            style={{
              width: `${
                progress?.percentage ||
                0
              }%`,
            }}
          />

        </div>

      </section>


      {/* ======================================
          MY QUESTIONS
      ====================================== */}

      <section className="my-questions-section">

        <div className="my-questions-heading">

          <div>

            <h2>
              My Questions
            </h2>

            <p>
              Questions you have selected
              to practice.
            </p>

          </div>

          <span>
            {selections.length} Questions
          </span>

        </div>


        {selections.length === 0 ? (

          <div className="my-questions-empty">

            <h3>
              No questions selected yet
            </h3>

            <p>
              Select a question from
              Practice Questions to
              start solving.
            </p>

          </div>

        ) : (

          <div className="my-question-list">

            {selections.map(
              (selection) => (

                <div
                  className="my-question-card"
                  key={selection.id}
                >

                  <div className="my-question-info">

                    <h3>
                      {
                        selection.question_title
                      }
                    </h3>

                    <p>
                      {
                        selection.difficulty
                      }
                      {" • "}
                      {
                        selection.topic
                      }
                      {" • "}
                      {
                        selection.platform
                      }
                    </p>

                    <span
                      className={`my-status ${selection.status.toLowerCase()}`}
                    >
                      {
                        selection.status.replace(
                          "_",
                          " "
                        )
                      }
                    </span>

                  </div>


                  <div className="my-question-actions">

                    {/* SOLVE */}

                    <button
                      className="solve-button"
                      onClick={() =>
                        navigate(
                          `/problem/${selection.question}`
                        )
                      }
                    >
                      Solve Problem →
                    </button>


                    {/* START */}

                    {selection.status ===
                      "SELECTED" && (

                      <button
                        className="start-button"
                        onClick={() =>
                          handleStatusChange(
                            selection.id,
                            "IN_PROGRESS"
                          )
                        }
                      >
                        Start
                      </button>

                    )}


                    {/* COMPLETE */}

                    {selection.status ===
                      "IN_PROGRESS" && (

                      <button
                        className="complete-button"
                        onClick={() =>
                          handleStatusChange(
                            selection.id,
                            "COMPLETED"
                          )
                        }
                      >
                        Mark Completed
                      </button>

                    )}

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* ======================================
          PRACTICE QUESTIONS
      ====================================== */}

      <section className="practice-section">

        <div className="practice-heading">

          <h2>
            Practice Questions
          </h2>

          <p>
            Select questions you want
            to practice.
          </p>

        </div>


        {/* FILTERS */}

        <div className="filters-container">

          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />


          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(
                e.target.value
              )
            }
          >

            <option value="">
              All Difficulties
            </option>

            <option value="EASY">
              Easy
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="HARD">
              Hard
            </option>

          </select>


          <input
            type="text"
            placeholder="Topic"
            value={topic}
            onChange={(e) =>
              setTopic(e.target.value)
            }
          />


          <input
            type="text"
            placeholder="Platform"
            value={platform}
            onChange={(e) =>
              setPlatform(
                e.target.value
              )
            }
          />


          <button
            className="filter-button"
            onClick={handleFilter}
          >
            Apply Filters
          </button>

        </div>


        {/* QUESTION LIST */}

        <div className="question-list">

          {questions.length === 0 ? (

            <div className="no-questions">

              <h3>
                No questions found
              </h3>

              <p>
                Try changing your search
                or filters.
              </p>

            </div>

          ) : (

            questions.map(
              (question) => {

                const selection =
                  getQuestionSelection(
                    question.id
                  );

                return (
                  <div
                    className="question-card"
                    key={question.id}
                  >

                    <div className="question-info">

                      <h3>
                        {question.title}
                      </h3>


                      <div className="question-meta">

                        <span>
                          {
                            question.difficulty
                          }
                        </span>

                        <span>
                          {
                            question.topic
                          }
                        </span>

                        <span>
                          {
                            question.platform
                          }
                        </span>

                      </div>


                      {question.tags &&
                        question.tags.length >
                          0 && (

                        <div className="question-tags">

                          {question.tags.map(
                            (
                              tag,
                              index
                            ) => (

                              <span
                                key={index}
                              >
                                {tag}
                              </span>

                            )
                          )}

                        </div>

                      )}

                    </div>


                    <div className="question-actions">

                      {/* SOLVE */}

                      <button
                        className="solve-button"
                        onClick={() =>
                          navigate(
                            `/problem/${question.id}`
                          )
                        }
                      >
                        Solve Problem →
                      </button>


                      {/* SELECT */}

                      {!selection && (

                        <button
                          className="select-button"
                          onClick={() =>
                            handleSelectQuestion(
                              question.id
                            )
                          }
                        >
                          + Select
                        </button>

                      )}


                      {/* STATUS */}

                      {selection && (

                        <span
                          className={`practice-status ${selection.status.toLowerCase()}`}
                        >
                          {
                            selection.status.replace(
                              "_",
                              " "
                            )
                          }
                        </span>

                      )}

                    </div>

                  </div>
                );
              }
            )

          )}

        </div>

      </section>

    </div>
  );
}

export default Dashboard;