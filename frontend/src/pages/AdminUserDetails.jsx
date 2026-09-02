import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../api/client";
import "../styles/AdminUserDetails.css";

function AdminUserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const response = await apiClient.get(
          `/dashboard/admin/users/${userId}/`
        );

        console.log("Student details:", response.data);

        setData(response.data);
      } catch (error) {
        console.error(
          "Student details failed:",
          error
        );

        setError(
          "Unable to load student details."
        );
      } finally {
        setLoading(false);
      }
    };

    getUserDetails();
  }, [userId]);

  if (loading) {
    return (
      <div className="details-page">
        <div className="details-loading">
          <div className="details-spinner"></div>
          <h2>Loading student details...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-page">
        <div className="details-error">
          <h2>{error}</h2>

          <button
            onClick={() => navigate("/admin")}
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="details-page">
        <div className="details-error">
          <h2>No student data found.</h2>

          <button
            onClick={() => navigate("/admin")}
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  const user = data.user;
  const progress = data.progress;
  const questions = data.questions || [];

  const studentName =
    user.first_name || user.last_name
      ? `${user.first_name || ""} ${
          user.last_name || ""
        }`.trim()
      : user.username;

  return (
    <div className="details-page">

      {/* Header */}

      <header className="details-header">

        <div>
          <h1>DSA Tracker</h1>

          <span className="admin-badge">
            ADMIN
          </span>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/admin")}
        >
          ← Admin Dashboard
        </button>

      </header>


      <main className="details-container">

        {/* Student profile */}

        <section className="student-profile">

          <div className="large-avatar">
            {studentName
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h2>{studentName}</h2>

            <p>
              @{user.username}
            </p>

            <span>
              {user.email || "No email available"}
            </span>
          </div>

        </section>


        {/* Progress cards */}

        <section className="progress-grid">

          <div className="progress-card">
            <span>Total Questions</span>
            <strong>
              {progress.total}
            </strong>
          </div>

          <div className="progress-card">
            <span>Selected</span>
            <strong>
              {progress.selected}
            </strong>
          </div>

          <div className="progress-card">
            <span>In Progress</span>
            <strong>
              {progress.in_progress}
            </strong>
          </div>

          <div className="progress-card completed-card">
            <span>Completed</span>
            <strong>
              {progress.completed}
            </strong>
          </div>

        </section>


        {/* Overall progress */}

        <section className="overall-progress">

          <div className="section-title">

            <div>
              <h2>Overall Progress</h2>

              <p>
                Student's question completion
                progress.
              </p>
            </div>

            <strong>
              {progress.percentage}%
            </strong>

          </div>

          <div className="large-progress-bar">

            <div
              className="large-progress-fill"
              style={{
                width: `${progress.percentage}%`,
              }}
            ></div>

          </div>

        </section>


        {/* Questions */}

        <section className="questions-section">

          <div className="questions-header">

            <div>
              <h2>Questions</h2>

              <p>
                Questions selected by this
                student.
              </p>
            </div>

            <span>
              {questions.length} Questions
            </span>

          </div>


          {questions.length === 0 ? (

            <div className="no-questions">

              <h3>
                No questions selected
              </h3>

              <p>
                This student has not selected
                any questions yet.
              </p>

            </div>

          ) : (

            <div className="question-list">

              {questions.map((item) => (

                <div
                  className="question-card"
                  key={item.id}
                >

                  <div className="question-main">

                    <h3>
                      {item.question_title}
                    </h3>

                    <div className="question-meta">

                      <span
                        className={`difficulty ${item.difficulty.toLowerCase()}`}
                      >
                        {item.difficulty}
                      </span>

                      <span>
                        {item.topic}
                      </span>

                      <span>
                        {item.platform}
                      </span>

                    </div>

                  </div>


                  <div className="question-status">

                    <span
                      className={`status ${item.status.toLowerCase()}`}
                    >
                      {item.status.replace(
                        "_",
                        " "
                      )}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default AdminUserDetails;