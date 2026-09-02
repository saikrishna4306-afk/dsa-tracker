import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../api/client";
import "../styles/ProblemWorkspace.css";

function ProblemWorkspace() {
  const { questionId } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);

  const [language, setLanguage] = useState("python");

  const [code, setCode] = useState(
`def solution():
    # Write your solution here
    pass`
  );

  const [loading, setLoading] = useState(true);

  // Submission states
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Convert frontend language values to Django values
  const languageMap = {
    python: "PYTHON",
    javascript: "JAVASCRIPT",
    java: "JAVA",
    cpp: "CPP",
  };

  // Load question
  useEffect(() => {
    const getQuestion = async () => {
      try {
        const response = await apiClient.get(
          `/questions/${questionId}/`
        );

        setQuestion(response.data);
      } catch (error) {
        console.error("Failed to load question:", error);
      } finally {
        setLoading(false);
      }
    };

    getQuestion();
  }, [questionId]);

  // Run Code
  const handleRunCode = () => {
    alert("Code execution will be implemented next.");
  };

  // Submit Solution
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setSubmissionResult(null);

      const response = await apiClient.post(
        "/progress/submissions/",
        {
          question: Number(questionId),
          language: languageMap[language],
          code: code,
        }
      );

      setSubmissionResult(response.data);

    } catch (error) {
      console.error("Failed to submit solution:", error);

      console.error(
        "Backend error:",
        error.response?.data
      );

      alert(
        error.response?.data?.detail ||
        "Failed to submit solution."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="workspace-loading">
        <h2>Loading Problem...</h2>
      </div>
    );
  }

  // Question not found
  if (!question) {
    return (
      <div className="workspace-error">
        <h2>Question not found</h2>

        <button
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="workspace-container">

      {/* Header */}
      <header className="workspace-header">

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <h1>Problem Workspace</h1>

      </header>


      {/* Problem Information */}
      <section className="problem-info">

        <div className="problem-heading">

          <div>

            <h2>{question.title}</h2>

            <div className="problem-meta">

              <span>
                {question.difficulty}
              </span>

              <span>
                {question.topic}
              </span>

              <span>
                {question.platform}
              </span>

            </div>

          </div>


          <a
            href={question.url}
            target="_blank"
            rel="noreferrer"
            className="original-problem-button"
          >
            Open Original Problem ↗
          </a>

        </div>


        {/* Tags */}
        {question.tags &&
          question.tags.length > 0 && (

            <div className="workspace-tags">

              {question.tags.map(
                (tag, index) => (
                  <span key={index}>
                    {tag}
                  </span>
                )
              )}

            </div>

          )}

      </section>


      {/* Code Workspace */}
      <section className="code-workspace">

        {/* Editor Header */}
        <div className="editor-header">

          <div>

            <h3>Solution</h3>

            <p>
              Write your solution below.
            </p>

          </div>


          {/* Language Selection */}
          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value)
            }
            disabled={submitting}
          >

            <option value="python">
              Python
            </option>

            <option value="javascript">
              JavaScript
            </option>

            <option value="java">
              Java
            </option>

            <option value="cpp">
              C++
            </option>

          </select>

        </div>


        {/* Code Editor */}
        <textarea
          className="code-editor"
          value={code}
          onChange={(e) =>
            setCode(e.target.value)
          }
          spellCheck="false"
          disabled={submitting}
        />


        {/* Actions */}
        <div className="editor-actions">

          <button
            className="run-button"
            onClick={handleRunCode}
            disabled={submitting}
          >
            ▶ Run Code
          </button>


          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : "Submit Solution"}
          </button>

        </div>


        {/* Submission Result */}
        <div className="output-section">

          <h3>
            Submission Result
          </h3>


          {!submissionResult ? (

            <div className="output-placeholder">

              <p>
                Submit your solution to see
                the result.
              </p>

            </div>

          ) : (

            <div className="submission-result">

              <p>
                <strong>Status:</strong>{" "}
                {submissionResult.status}
              </p>


              <p>
                <strong>
                  Submission ID:
                </strong>{" "}
                {submissionResult.id}
              </p>


              <p>
                <strong>
                  Test Cases:
                </strong>{" "}
                {submissionResult.test_cases_passed}
                {" / "}
                {submissionResult.total_test_cases}
              </p>


              <p>
                <strong>
                  Score:
                </strong>{" "}

                {submissionResult.score !== null
                  ? submissionResult.score
                  : "Not evaluated yet"}
              </p>


              <p>
                <strong>
                  Feedback:
                </strong>{" "}

                {submissionResult.feedback
                  ? submissionResult.feedback
                  : "Not evaluated yet"}
              </p>

            </div>

          )}

        </div>

      </section>

    </div>
  );
}

export default ProblemWorkspace;