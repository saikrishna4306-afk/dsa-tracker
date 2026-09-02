import { useEffect, useState } from "react";
import apiClient from "../api/client";

function AdminQuestions() {
  const [questions, setQuestions] = useState([]);

  const [form, setForm] = useState({
    title: "",
    difficulty: "EASY",
    topic: "",
    platform: "",
    url: "",
    tags: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadQuestions = async () => {
    try {
      const response = await apiClient.get(
        "/questions/"
      );

      setQuestions(
        response.data.results || []
      );
    } catch (error) {
      console.error(
        "Questions loading failed:",
        error
      );
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      title: "",
      difficulty: "EASY",
      topic: "",
      platform: "",
      url: "",
      tags: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      const data = {
        title: form.title,
        difficulty: form.difficulty,
        topic: form.topic,
        platform: form.platform,
        url: form.url,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      if (editingId) {
        await apiClient.patch(
          `/questions/${editingId}/`,
          data
        );
      } else {
        await apiClient.post(
          "/questions/",
          data
        );
      }

      resetForm();
      await loadQuestions();
    } catch (error) {
      console.error(
        "Question save failed:",
        error
      );

      alert(
        error.response?.data
          ? JSON.stringify(
              error.response.data
            )
          : "Unable to save question."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question) => {
    setEditingId(question.id);

    setForm({
      title: question.title,
      difficulty: question.difficulty,
      topic: question.topic,
      platform: question.platform,
      url: question.url,
      tags: Array.isArray(question.tags)
        ? question.tags.join(", ")
        : "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiClient.delete(
        `/questions/${id}/`
      );

      setQuestions((current) =>
        current.filter(
          (question) =>
            question.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Question deletion failed:",
        error
      );

      alert(
        "Unable to delete question."
      );
    }
  };

  return (
    <div className="page">
      <h1>
        {editingId
          ? "Edit Question"
          : "Add Question"}
      </h1>

      <form
        className="admin-form"
        onSubmit={handleSubmit}
      >
        <input
          name="title"
          placeholder="Question title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <select
          name="difficulty"
          value={form.difficulty}
          onChange={handleChange}
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

        <input
          name="topic"
          placeholder="Topic"
          value={form.topic}
          onChange={handleChange}
          required
        />

        <input
          name="platform"
          placeholder="Platform"
          value={form.platform}
          onChange={handleChange}
          required
        />

        <input
          name="url"
          type="url"
          placeholder="Question URL"
          value={form.url}
          onChange={handleChange}
          required
        />

        <input
          name="tags"
          placeholder="Tags separated by commas"
          value={form.tags}
          onChange={handleChange}
        />

        <div>
          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : editingId
              ? "Update Question"
              : "Add Question"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2>Existing Questions</h2>

      <div className="question-grid">
        {questions.map((question) => (
          <div
            className="question-card"
            key={question.id}
          >
            <h3>{question.title}</h3>

            <p>
              Difficulty:{" "}
              {question.difficulty}
            </p>

            <p>
              Topic: {question.topic}
            </p>

            <p>
              Platform:{" "}
              {question.platform}
            </p>

            <div className="admin-actions">
              <button
                onClick={() =>
                  handleEdit(question)
                }
              >
                Edit
              </button>

              <button
                onClick={() =>
                  handleDelete(question.id)
                }
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminQuestions;