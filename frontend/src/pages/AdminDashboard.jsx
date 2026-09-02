import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import apiClient from "../api/client";
import "../styles/AdminDashboard.css";

function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    total_questions: 0,
    total_completed: 0,
  });

  const [users, setUsers] = useState([]);

  const [loadingStats, setLoadingStats] =
    useState(true);

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [error, setError] = useState("");

  // --------------------------------------------------
  // Get admin statistics
  // --------------------------------------------------

  const getStats = async () => {
    try {
      setLoadingStats(true);

      const response =
        await apiClient.get(
          "/dashboard/admin/dashboard/"
        );

      console.log(
        "Admin dashboard:",
        response.data
      );

      setStats(response.data);

    } catch (error) {
      console.error(
        "Admin dashboard failed:",
        error
      );

      setError(
        "Unable to load dashboard statistics."
      );
    } finally {
      setLoadingStats(false);
    }
  };

  // --------------------------------------------------
  // Get all users
  // --------------------------------------------------

  const getUsers = async () => {
    try {
      setLoadingUsers(true);

      const response =
        await apiClient.get(
          "/dashboard/admin/users/"
        );

      console.log(
        "Admin users:",
        response.data
      );

      /*
        Your API currently returns an array:

        [
          {
            id: 2,
            username: "sk",
            email: "...",
            assigned: 1,
            selected: 1,
            completed: 0,
            in_progress: 0,
            progress: 0
          }
        ]
      */

      setUsers(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );

    } catch (error) {
      console.error(
        "Users failed:",
        error
      );

      setError(
        "Unable to load student activity."
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  // --------------------------------------------------
  // Initial load
  // --------------------------------------------------

  useEffect(() => {
    getStats();
    getUsers();
  }, []);

  // --------------------------------------------------
  // Student name
  // --------------------------------------------------

  const getStudentName = (user) => {
    if (
      user.first_name ||
      user.last_name
    ) {
      return `${user.first_name || ""} ${
        user.last_name || ""
      }`.trim();
    }

    return user.username;
  };

  // --------------------------------------------------
  // Avatar letter
  // --------------------------------------------------

  const getInitial = (user) => {
    return getStudentName(user)
      .charAt(0)
      .toUpperCase();
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="admin-dashboard-page">

      {/* ==========================================
          HEADER
      ========================================== */}

      <header className="admin-header">

        <div className="admin-brand">

          <h1>
            DSA Tracker
          </h1>

          <span className="admin-badge">
            ADMIN
          </span>

        </div>


        <button
          className="admin-logout-button"
          onClick={onLogout}
        >
          Logout
        </button>

      </header>


      {/* ==========================================
          MAIN
      ========================================== */}

      <main className="admin-container">

        {/* Page heading */}

        <section className="admin-page-heading">

          <div>

            <h2>
              Admin Dashboard
            </h2>

            <p>
              Monitor students and their
              DSA progress.
            </p>

          </div>


          <button
            className="manage-questions-button"
            onClick={() =>
              navigate(
                "/admin/questions"
              )
            }
          >
            + Manage Questions
          </button>

        </section>


        {/* Error */}

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}


        {/* ======================================
            STAT CARDS
        ====================================== */}

        <section className="admin-stats">

          {/* Total Users */}

          <div className="admin-stat-card">

            <div className="stat-icon">
              👥
            </div>

            <div>

              <span>
                Total Users
              </span>

              <strong>
                {loadingStats
                  ? "..."
                  : stats.total_users}
              </strong>

            </div>

          </div>


          {/* Active Users */}

          <div className="admin-stat-card">

            <div className="stat-icon">
              ✓
            </div>

            <div>

              <span>
                Active Users
              </span>

              <strong>
                {loadingStats
                  ? "..."
                  : stats.active_users}
              </strong>

            </div>

          </div>


          {/* Questions */}

          <div className="admin-stat-card">

            <div className="stat-icon">
              📚
            </div>

            <div>

              <span>
                Total Questions
              </span>

              <strong>
                {loadingStats
                  ? "..."
                  : stats.total_questions}
              </strong>

            </div>

          </div>


          {/* Completed */}

          <div className="admin-stat-card">

            <div className="stat-icon">
              🏆
            </div>

            <div>

              <span>
                Completed
              </span>

              <strong>
                {loadingStats
                  ? "..."
                  : stats.total_completed}
              </strong>

            </div>

          </div>

        </section>


        {/* ======================================
            STUDENT ACTIVITY
        ====================================== */}

        <section className="student-activity">

          {/* Section heading */}

          <div className="activity-heading">

            <div>

              <h2>
                Student Activity
              </h2>

              <p>
                View each student's DSA
                progress and completed
                questions.
              </p>

            </div>


            <span className="student-count">
              {users.length} Students
            </span>

          </div>


          {/* Loading */}

          {loadingUsers ? (

            <div className="admin-loading">
              Loading students...
            </div>

          ) : users.length === 0 ? (

            <div className="admin-empty">
              <h3>
                No students found
              </h3>

              <p>
                There are currently no
                students to display.
              </p>
            </div>

          ) : (

            <div className="student-table-wrapper">

              <table className="student-table">

                <thead>

                  <tr>

                    <th>
                      Student
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Selected
                    </th>

                    <th>
                      In Progress
                    </th>

                    <th>
                      Completed
                    </th>

                    <th>
                      Progress
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {users.map((student) => (

                    <tr
                      key={student.id}
                    >

                      {/* Student */}

                      <td>

                        <div className="student-info">

                          <div className="student-avatar">
                            {getInitial(
                              student
                            )}
                          </div>

                          <div>

                            <strong>
                              {getStudentName(
                                student
                              )}
                            </strong>

                            <span>
                              @{student.username}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* Email */}

                      <td>

                        <span className="student-email">

                          {student.email ||
                            "No email"}

                        </span>

                      </td>


                      {/* Selected */}

                      <td>

                        <span className="number-badge">

                          {student.selected ||
                            0}

                        </span>

                      </td>


                      {/* In Progress */}

                      <td>

                        <span className="number-badge">

                          {student.in_progress ||
                            0}

                        </span>

                      </td>


                      {/* Completed */}

                      <td>

                        <span className="completed-badge">

                          {student.completed ||
                            0}

                        </span>

                      </td>


                      {/* Progress */}

                      <td>

                        <div className="progress-cell">

                          <div className="small-progress-bar">

                            <div
                              className="small-progress-fill"
                              style={{
                                width: `${
                                  student.progress ||
                                  0
                                }%`,
                              }}
                            ></div>

                          </div>

                          <strong>
                            {student.progress ||
                              0}
                            %
                          </strong>

                        </div>

                      </td>


                      {/* Action */}

                      <td>

                        <button
                          className="view-student-button"
                          onClick={() =>
                            navigate(
                              `/admin/users/${student.id}`
                            )
                          }
                        >
                          View
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;