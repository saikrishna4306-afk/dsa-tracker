import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import "../styles/QuestionManagement.css";

function QuestionManagement() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingQuestion, setEditingQuestion] =
    useState(null);

  const [formData, setFormData] = useState({
    title: "",
    difficulty: "EASY",
    topic: "",
    platform: "",
    url: "",
    tags: "",
  });

  // ------------------------------------------
  // Get questions
  // ------------------------------------------

  const getQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/questions/"
      );

      console.log(
        "Questions:",
        response.data
      );

      setQuestions(
        response.data.results || []
      );
    } catch (error) {
      console.error(
        "Questions failed:",
        error
      );

      setError(
        "Unable to load questions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getQuestions();
  }, []);

  // ------------------------------------------
  // Form input
  // ------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ------------------------------------------
  // Open Add form
  // ------------------------------------------

  const handleAddClick = () => {
    setEditingQuestion(null);

    setFormData({
      title: "",
      difficulty: "EASY",
      topic: "",
      platform: "",
      url: "",
      tags: "",
    });

    setShowForm(true);
  };

  // ------------------------------------------
  // Open Edit form
  // ------------------------------------------

  const handleEditClick = (question) => {
    setEditingQuestion(question);

    setFormData({
      title: question.title || "",
      difficulty:
        question.difficulty || "EASY",
      topic: question.topic || "",
      platform: question.platform || "",
      url: question.url || "",
      tags: Array.isArray(question.tags)
        ? question.tags.join(", ")
        : "",
    });

    setShowForm(true);
  };

  // ------------------------------------------
  // Close form
  // ------------------------------------------

  const handleCancel = () => {
    setShowForm(false);
    setEditingQuestion(null);
  };

  // ------------------------------------------
  // Submit form
  // ------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: formData.title,
        difficulty: formData.difficulty,
        topic: formData.topic,
        platform: formData.platform,
        url: formData.url,

        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== ""),
      };

      if (editingQuestion) {
        // EDIT

        await apiClient.patch(
          `/questions/${editingQuestion.id}/`,
          payload
        );

        alert(
          "Question updated successfully."
        );
      } else {
        // ADD

        await apiClient.post(
          "/questions/",
          payload
        );

        alert(
          "Question added successfully."
        );
      }

      setShowForm(false);
      setEditingQuestion(null);

      await getQuestions();

    } catch (error) {
      console.error(
        "Save question failed:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      setError(
        error.response?.data?.detail ||
        "Unable to save question."
      );
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------
  // Delete question
  // ------------------------------------------

  const handleDelete = async (question) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${question.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiClient.delete(
        `/questions/${question.id}/`
      );

      alert(
        "Question deleted successfully."
      );

      await getQuestions();

    } catch (error) {
      console.error(
        "Delete question failed:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to delete question."
      );
    }
  };

  return (
    <div className="question-management-page">

      {/* Header */}

      <header className="qm-header">

        <div className="qm-brand">
          <h1>DSA Tracker</h1>

          <span>ADMIN</span>
        </div>

        <button
          className="qm-back-button"
          onClick={() =>
            navigate("/admin")
          }
        >
          ← Admin Dashboard
        </button>

      </header>


      {/* Main */}

      <main className="qm-container">

        {/* Page heading */}

        <div className="qm-page-heading">

          <div>
            <h2>Question Management</h2>

            <p>
              Add, edit and manage DSA
              questions.
            </p>
          </div>

          <button
            className="add-question-button"
            onClick={handleAddClick}
          >
            + Add Question
          </button>

        </div>


        {/* Error */}

        {error && (
          <div className="qm-error">
            {error}
          </div>
        )}


        {/* Add/Edit Form */}

        {showForm && (

          <section className="question-form-section">

            <div className="form-heading">

              <div>
                <h2>
                  {editingQuestion
                    ? "Edit Question"
                    : "Add New Question"}
                </h2>

                <p>
                  Enter the question details
                  below.
                </p>
              </div>

              <button
                className="close-form-button"
                onClick={handleCancel}
              >
                ×
              </button>

            </div>


            <form
              className="question-form"
              onSubmit={handleSubmit}
            >

              {/* Title */}

              <div className="form-group">

                <label>
                  Question Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Two Sum"
                  required
                />

              </div>


              {/* Difficulty */}

              <div className="form-group">

                <label>
                  Difficulty
                </label>

                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  required
                >

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

              </div>


              {/* Topic */}

              <div className="form-group">

                <label>
                  Topic
                </label>

                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="e.g. Arrays"
                  required
                />

              </div>


              {/* Platform */}

              <div className="form-group">

                <label>
                  Platform
                </label>

                <input
                  type="text"
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  placeholder="e.g. LeetCode"
                  required
                />

              </div>


              {/* URL */}

              <div className="form-group full-width">

                <label>
                  Problem URL
                </label>

                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://leetcode.com/..."
                  required
                />

              </div>


              {/* Tags */}

              <div className="form-group full-width">

                <label>
                  Tags
                </label>

                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="array, hashmap, two-pointer"
                />

                <small>
                  Separate tags with commas.
                </small>

              </div>


              {/* Buttons */}

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingQuestion
                    ? "Update Question"
                    : "Add Question"}
                </button>

              </div>

            </form>

          </section>

        )}


        {/* Questions */}

        <section className="questions-management-section">

          <div className="qm-section-heading">

            <div>
              <h2>
                All Questions
              </h2>

              <p>
                {questions.length} questions
                available.
              </p>
            </div>

          </div>


          {loading ? (

            <div className="qm-loading">
              Loading questions...
            </div>

          ) : questions.length === 0 ? (

            <div className="qm-empty">

              <h3>
                No questions found
              </h3>

              <p>
                Click "Add Question" to create
                your first question.
              </p>

            </div>

          ) : (

            <div className="qm-table-container">

              <table className="qm-table">

                <thead>

                  <tr>
                    <th>Question</th>
                    <th>Difficulty</th>
                    <th>Topic</th>
                    <th>Platform</th>
                    <th>Tags</th>
                    <th>Actions</th>
                  </tr>

                </thead>


                <tbody>

                  {questions.map(
                    (question) => (

                      <tr key={question.id}>

                        <td>

                          <strong>
                            {question.title}
                          </strong>

                        </td>


                        <td>

                          <span
                            className={`qm-difficulty ${question.difficulty.toLowerCase()}`}
                          >
                            {question.difficulty}
                          </span>

                        </td>


                        <td>
                          {question.topic}
                        </td>


                        <td>
                          {question.platform}
                        </td>


                        <td>

                          <div className="qm-tags">

                            {question.tags &&
                            question.tags.length >
                              0 ? (

                              question.tags.map(
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
                              )

                            ) : (
                              <span>
                                No tags
                              </span>
                            )}

                          </div>

                        </td>


                        <td>

                          <div className="qm-actions">

                            <button
                              className="edit-button"
                              onClick={() =>
                                handleEditClick(
                                  question
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-button"
                              onClick={() =>
                                handleDelete(
                                  question
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default QuestionManagement;