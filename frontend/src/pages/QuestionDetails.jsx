import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import apiClient from "../api/client";

function QuestionDetails() {
  const { id } = useParams();

  const [question, setQuestion] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        const response =
          await apiClient.get(
            `/questions/${id}/`
          );

        setQuestion(response.data);
      } catch (error) {
        console.error(
          "Question loading failed:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();
  }, [id]);

  if (loading) {
    return (
      <p className="loading">
        Loading question...
      </p>
    );
  }

  if (!question) {
    return (
      <div className="page">
        <p>Question not found.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="details-card">
        <h1>{question.title}</h1>

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

        {question.tags?.length > 0 && (
          <p>
            Tags:{" "}
            {question.tags.join(", ")}
          </p>
        )}

        <a
          href={question.url}
          target="_blank"
          rel="noreferrer"
        >
          Open Question
        </a>
      </div>
    </div>
  );
}

export default QuestionDetails;