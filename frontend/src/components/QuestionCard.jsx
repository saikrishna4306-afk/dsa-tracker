import { useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";

function QuestionCard({
  question,
  selection,
  onSelected,
}) {
  const [loading, setLoading] = useState(false);

  const handleSelect = async () => {
    try {
      setLoading(true);

      const response = await apiClient.post(
        "/progress/",
        {
          question: question.id,
        }
      );

      console.log(
        "Question selected:",
        response.data
      );

      onSelected?.(response.data);
    } catch (error) {
      console.error(
        "Selection failed:",
        error
      );

      if (error.response?.status === 400) {
        alert(
          "This question has already been selected."
        );
      } else {
        alert("Unable to select question.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="question-card">
      <h3>{question.title}</h3>

      <div className="question-info">
        <span>{question.difficulty}</span>
        <span>{question.topic}</span>
        <span>{question.platform}</span>
      </div>

      {selection ? (
        <>
          <p>
            Status:{" "}
            <strong>{selection.status}</strong>
          </p>

          <Link
            to={`/questions/${question.id}`}
          >
            View Details
          </Link>
        </>
      ) : (
        <button
          onClick={handleSelect}
          disabled={loading}
        >
          {loading
            ? "Selecting..."
            : "Select Question"}
        </button>
      )}
    </div>
  );
}

export default QuestionCard;