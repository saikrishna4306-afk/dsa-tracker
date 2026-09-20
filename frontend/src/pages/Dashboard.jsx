import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import apiClient from "../api/client";
import SpotlightCard from "../components/SpotlightCard/SpotlightCard";
import CountUp from "../components/CountUp/CountUp";

function Dashboard({ onLogout }) {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [selections, setSelections] = useState([]);
  const [progress, setProgress] = useState(null);
  const [dailyQuestion, setDailyQuestion] = useState(null);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("");

  const [loading, setLoading] = useState(true);
  const [progressWidth, setProgressWidth] = useState(0);

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

      const response = await apiClient.get("/questions/", {
        params,
      });

      if (Array.isArray(response.data)) {
        setQuestions(response.data);
      } else {
        setQuestions(response.data.results || []);
      }
    } catch (error) {
      console.error("Failed to load questions:", error);
    }
  };

  // ==========================================
  // GET MY QUESTIONS
  // ==========================================

  const getSelections = async () => {
    try {
      const response = await apiClient.get("/progress/");

      setSelections(response.data || []);
    } catch (error) {
      console.error("Failed to load my questions:", error);
    }
  };

  // ==========================================
  // GET PROGRESS
  // ==========================================

  const getProgress = async () => {
    try {
      const response = await apiClient.get("/progress/");

      const data = response.data || [];

      const total = data.length;

      const selected = data.filter(
        (item) => item.status === "SELECTED"
      ).length;

      const inProgress = data.filter(
        (item) => item.status === "IN_PROGRESS"
      ).length;

      const completed = data.filter(
        (item) => item.status === "COMPLETED"
      ).length;

      const percentage =
        total === 0
          ? 0
          : Math.round((completed / total) * 100);

      setProgress({
        total,
        selected,
        in_progress: inProgress,
        completed,
        percentage,
      });
    } catch (error) {
      console.error("Failed to load progress:", error);
    }
  };

  // ==========================================
  // GET DAILY QUESTION
  // ==========================================

  const getDailyQuestion = async () => {
    try {
      const response = await apiClient.get(
        "/progress/daily/"
      );

      setDailyQuestion(response.data);
    } catch (error) {
      console.error("No daily question:", error);

      setDailyQuestion(null);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    const loadDashboard = async () => {
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


  useEffect(() => {
  if (progress?.percentage !== undefined) {
    const timer = setTimeout(() => {
      setProgressWidth(progress.percentage);
    }, 100);

    return () => clearTimeout(timer);
  }
}, [progress?.percentage]);

  // ==========================================
  // APPLY FILTERS
  // ==========================================

  const handleFilter = async () => {
    await getQuestions();
  };

  // ==========================================
  // SELECT QUESTION
  // ==========================================

  const handleSelectQuestion = async (questionId) => {
    try {
      await apiClient.post("/progress/", {
        question: questionId,
        status: "SELECTED",
      });

      await getSelections();
      await getProgress();

      alert("Question selected successfully!");
    } catch (error) {
      console.error(
        "Question selection failed:",
        error
      );

      if (error.response?.status === 400) {
        alert(
          "You have already selected this question."
        );
      } else {
        alert("Unable to select question.");
      }
    }
  };

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const handleStatusChange = async (
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

  const getQuestionSelection = (questionId) => {
    return selections.find(
      (selection) =>
        selection.question === questionId
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
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="dashboard-header">

        <div>
          <div className="dashboard-eyebrow">
            DSA TRACKER
          </div>

          <h1>
            Welcome back 👋
          </h1>

          <p>
            Practice consistently. Track your
            progress. Master DSA.
          </p>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>


      {/* =========================
          DAILY QUESTION
      ========================= */}

      {dailyQuestion && (
        <section className="dashboard-card daily-card">

          <div className="daily-card-content">

            <div>

              <span className="daily-label">
                QUESTION OF THE DAY
              </span>

              <h2>
                {dailyQuestion.question?.title}
              </h2>

              <div className="question-meta">

                <span className="meta-pill difficulty">
                  {dailyQuestion.question?.difficulty}
                </span>

                <span className="meta-pill">
                  {dailyQuestion.question?.topic}
                </span>

                <span className="meta-pill">
                  {dailyQuestion.question?.platform}
                </span>

              </div>

            </div>

            <button
              className="premium-button"
              onClick={() =>
                navigate(
                  `/problem/${dailyQuestion.question.id}`
                )
              }
            >
              Solve Problem
              <span>→</span>
            </button>

          </div>

        </section>
      )}


      {/* =========================
          STAT CARDS
      ========================= */}

      <section className="stats-grid">

        {/* TOTAL QUESTIONS */}

        <SpotlightCard
          className="dashboard-stat-card"
          spotlightColor="rgba(139, 92, 246, 0.28)"
        >
          <span className="stat-label">
            Total Questions
          </span>

          <strong>
            <CountUp
              from={0}
              to={progress?.total || 0}
              duration={2000}
            />
          </strong>

          <span className="stat-description">
            Available for practice
          </span>
        </SpotlightCard>


        {/* SELECTED */}

        <SpotlightCard
          className="dashboard-stat-card"
          spotlightColor="rgba(168, 85, 247, 0.28)"
        >
          <span className="stat-label">
            Selected
          </span>

          <strong>
            <CountUp
              from={0}
              to={progress?.selected || 0}
              duration={2000}
            />
          </strong>

          <span className="stat-description">
            Added to your practice list
          </span>
        </SpotlightCard>


        {/* IN PROGRESS */}

        <SpotlightCard
          className="dashboard-stat-card"
          spotlightColor="rgba(59, 130, 246, 0.25)"
        >
          <span className="stat-label">
            In Progress
          </span>

          <strong>
            <CountUp
              from={0}
              to={progress?.in_progress || 0}
              duration={2000}
            />
          </strong>

          <span className="stat-description">
            Currently being practiced
          </span>
        </SpotlightCard>


        {/* COMPLETED */}

        <SpotlightCard
          className="dashboard-stat-card"
          spotlightColor="rgba(16, 185, 129, 0.25)"
        >
          <span className="stat-label">
            Completed
          </span>

          <strong>
            <CountUp
              from={0}
              to={progress?.completed || 0}
              duration={2000}
            />
          </strong>

          <span className="stat-description">
            Successfully completed
          </span>
        </SpotlightCard>

      </section>


      {/* =========================
          PROGRESS
      ========================= */}

      <section className="dashboard-grid">

        {/* PROGRESS CARD */}

        <div className="dashboard-card progress-card">

          <div className="card-heading">

            <div>
              <span className="card-kicker">
                YOUR JOURNEY
              </span>

              <h2>
                Overall Progress
              </h2>
            </div>

            {/* ANIMATED PERCENTAGE */}

            <div className="progress-percentage">
              <CountUp
                from={0}
                to={progress?.percentage || 0}
                duration={2000}
              />
              %
            </div>

          </div>


          {/* PROGRESS BAR */}

          <div className="progress-bar-container">

            <div
  className="progress-bar"
  style={{
    width: `${progressWidth}%`,
  }}
/>

          </div>


          {/* PROGRESS SUMMARY */}

          <div className="progress-summary">

            {/* COMPLETED */}

            <div>

              <span className="progress-dot completed-dot" />

              <span>
                Completed
              </span>

              <strong>
                <CountUp
                  from={0}
                  to={progress?.completed || 0}
                  duration={2000}
                />
              </strong>

            </div>


            {/* IN PROGRESS */}

            <div>

              <span className="progress-dot progress-dot-blue" />

              <span>
                In Progress
              </span>

              <strong>
                <CountUp
                  from={0}
                  to={progress?.in_progress || 0}
                  duration={2000}
                />
              </strong>

            </div>


            {/* SELECTED */}

            <div>

              <span className="progress-dot progress-dot-muted" />

              <span>
                Selected
              </span>

              <strong>
                <CountUp
                  from={0}
                  to={progress?.selected || 0}
                  duration={2000}
                />
              </strong>

            </div>

          </div>

        </div>


        {/* =========================
            QUICK SUMMARY
        ========================= */}

        <div className="dashboard-card summary-card">

          <span className="card-kicker">
            KEEP GOING
          </span>

          <h2>
            Build consistency.
          </h2>

          <p>
            Every problem you solve moves
            you one step closer to mastering
            data structures and algorithms.
          </p>

          <div className="summary-stat">

            <strong>
              <CountUp
                from={0}
                to={progress?.percentage || 0}
                duration={2000}
              />
              %
            </strong>

            <span>
              of your selected questions
              completed
            </span>

          </div>

        </div>

      </section>


      {/* =========================
          MY QUESTIONS
      ========================= */}

      <section className="section">

        <div className="section-header">

          <div>
            <span className="card-kicker">
              YOUR PRACTICE
            </span>

            <h2>
              My Questions
            </h2>

            <p>
              Questions you selected to practice.
            </p>
          </div>

          <span className="section-count">
            {selections.length} Questions
          </span>

        </div>


        {selections.length === 0 ? (

          <div className="dashboard-card empty-card">

            <div className="empty-icon">
              +
            </div>

            <h3>
              No questions selected yet
            </h3>

            <p>
              Select a question from the
              practice section below to start
              your journey.
            </p>

          </div>

        ) : (

          <div className="my-question-list">

            {selections.map((selection) => (

              <div
                className="dashboard-card my-question-card"
                key={selection.id}
              >

                <div className="my-question-info">

                  <div className="question-title-row">

                    <h3>
                      {selection.question_title}
                    </h3>

                    <span
                      className={`my-status ${
                        selection.status.toLowerCase()
                      }`}
                    >
                      {selection.status.replace(
                        "_",
                        " "
                      )}
                    </span>

                  </div>


                  <div className="question-meta">

                    <span>
                      {selection.difficulty}
                    </span>

                    <span>
                      {selection.topic}
                    </span>

                    <span>
                      {selection.platform}
                    </span>

                  </div>

                </div>


                <div className="my-question-actions">

                  <button
                    className="secondary-button"
                    onClick={() =>
                      navigate(
                        `/problem/${selection.question}`
                      )
                    }
                  >
                    Solve
                    <span>→</span>
                  </button>


                  {selection.status === "SELECTED" && (

                    <button
                      className="ghost-action"
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


                  {selection.status === "IN_PROGRESS" && (

                    <button
                      className="complete-action"
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

            ))}

          </div>

        )}

      </section>


      {/* =========================
          PRACTICE QUESTIONS
      ========================= */}

      <section className="section practice-section">

        <div className="section-header">

          <div>
            <span className="card-kicker">
              PROBLEM LIBRARY
            </span>

            <h2>
              Practice Questions
            </h2>

            <p>
              Discover problems and add them
              to your practice list.
            </p>
          </div>

        </div>


        {/* FILTERS */}

        <div className="dashboard-card filters-container">

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
              setDifficulty(e.target.value)
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
              setPlatform(e.target.value)
            }
          />


          <button
            className="premium-button filter-button"
            onClick={handleFilter}
          >
            Apply Filters
          </button>

        </div>


        {/* QUESTIONS */}

        {questions.length === 0 ? (

          <div className="dashboard-card empty-card">

            <h3>
              No questions found
            </h3>

            <p>
              Try changing your search or
              filters.
            </p>

          </div>

        ) : (

          <div className="question-list">

            {questions.map((question) => {

              const selection =
                getQuestionSelection(
                  question.id
                );

              return (

                <div
                  className="dashboard-card question-card"
                  key={question.id}
                >

                  <div className="question-info">

                    <div className="question-title-row">

                      <h3>
                        {question.title}
                      </h3>

                      {selection && (

                        <span
                          className={`practice-status ${
                            selection.status.toLowerCase()
                          }`}
                        >
                          {selection.status.replace(
                            "_",
                            " "
                          )}
                        </span>

                      )}

                    </div>


                    <div className="question-meta">

                      <span className="meta-pill">
                        {question.difficulty}
                      </span>

                      <span className="meta-pill">
                        {question.topic}
                      </span>

                      <span className="meta-pill">
                        {question.platform}
                      </span>

                    </div>


                    {question.tags &&
                      question.tags.length > 0 && (

                        <div className="question-tags">

                          {question.tags.map(
                            (tag, index) => (

                              <span key={index}>
                                {tag}
                              </span>

                            )
                          )}

                        </div>

                      )}

                  </div>


                  <div className="question-actions">

                    <button
                      className="secondary-button"
                      onClick={() =>
                        navigate(
                          `/problem/${question.id}`
                        )
                      }
                    >
                      Solve Problem
                      <span>→</span>
                    </button>


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

                  </div>

                </div>

              );
            })}

          </div>

        )}

      </section>

    </div>
  );
}

export default Dashboard;