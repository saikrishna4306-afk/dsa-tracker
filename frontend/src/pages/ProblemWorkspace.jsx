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
`def solution(nums, target):
    # Write your solution here
    pass`
  );

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const languageMap = {
    python: "PYTHON",
    javascript: "JAVASCRIPT",
    java: "JAVA",
    cpp: "CPP",
  };

  // ---------------------------------------------------------
  // Load Question
  // ---------------------------------------------------------

  useEffect(() => {
    const getQuestion = async () => {
      try {
        const response = await apiClient.get(
          `/questions/${questionId}/`
        );

        setQuestion(response.data);
      } catch (error) {
        console.error(
          "Failed to load question:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    getQuestion();
  }, [questionId]);

  // ---------------------------------------------------------
  // Run Code
  // ---------------------------------------------------------

  const handleRunCode = async () => {
    try {
      setSubmitting(true);
      setSubmissionResult(null);

      const response = await apiClient.post(
        "/progress/run/",
        {
          question: Number(questionId),
          language: languageMap[language],
          code: code,
        }
      );

      setSubmissionResult({
        ...response.data,
        isRun: true,
      });
    } catch (error) {
      console.error(
        "Failed to run code:",
        error
      );

      console.error(
        "Backend error:",
        error.response?.data
      );

      alert(
        error.response?.data?.detail ||
        "Failed to run code."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // Submit Solution
  // ---------------------------------------------------------

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

      setSubmissionResult({
        ...response.data,
        isRun: false,
      });
    } catch (error) {
      console.error(
        "Failed to submit solution:",
        error
      );

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

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="workspace-loading">
        <h2>Loading Problem...</h2>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Question Not Found
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // Main UI
  // ---------------------------------------------------------

  return (
    <div className="workspace-container">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="workspace-header">

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <h1>Problem Workspace</h1>

      </header>


      {/* =====================================================
          PROBLEM INFORMATION
      ===================================================== */}

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


      {/* =====================================================
          CODE WORKSPACE
      ===================================================== */}

      <section className="code-workspace">

        {/* Editor Header */}

        <div className="editor-header">

          <div>
            <h3>Solution</h3>

            <p>
              Write your solution below.
            </p>
          </div>


          {/* Language */}

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


        {/* =====================================================
            ACTION BUTTONS
        ===================================================== */}

        <div className="editor-actions">

          <button
            className="run-button"
            onClick={handleRunCode}
            disabled={submitting}
          >
            {submitting
              ? "Running..."
              : "▶ Run Code"}
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


        {/* =====================================================
            OUTPUT
        ===================================================== */}

        <div className="output-section">

          <h3>
            {submissionResult?.isRun
              ? "Run Result"
              : "Submission Result"}
          </h3>


          {/* No result */}

          {!submissionResult && (

            <div className="output-placeholder">

              <p>
                Run your code to test it, or submit
                your solution to save your submission.
              </p>

            </div>

          )}


          {/* ===================================================
              RESULT
          =================================================== */}

          {submissionResult && (

            <div className="submission-result">


              {/* =================================================
                  SUMMARY
              ================================================= */}

              <div className="result-summary">

                <div className="result-status">

                  <strong>
                    Status:
                  </strong>

                  <span
                    className={
                      submissionResult.status ===
                      "PASSED"
                        ? "status-passed"
                        : submissionResult.status ===
                          "FAILED"
                        ? "status-failed"
                        : "status-other"
                    }
                  >
                    {submissionResult.status}
                  </span>

                </div>


                {/* Submission ID */}

                {!submissionResult.isRun && (

                  <p>
                    <strong>
                      Submission ID:
                    </strong>{" "}
                    {submissionResult.id}
                  </p>

                )}


                {/* Test Cases */}

                <p>

                  <strong>
                    Test Cases:
                  </strong>{" "}

                  {submissionResult.test_cases_passed}

                  {" / "}

                  {submissionResult.total_test_cases}

                </p>

              </div>


              {/* =================================================
                  SCORE + AI
              ================================================= */}

              {!submissionResult.isRun && (

                <div className="score-section">


                  {/* =============================================
                      FINAL SCORE
                  ============================================= */}

                  <div className="final-score">

                    <span className="score-label">
                      Final Score
                    </span>

                    <span className="score-value">

                      {submissionResult.score !==
                        null &&
                      submissionResult.score !==
                        undefined
                        ? `${submissionResult.score} / 100`
                        : "Not evaluated yet"}

                    </span>

                  </div>


                  {/* =============================================
                      SCORE BREAKDOWN
                  ============================================= */}

                  <div className="score-breakdown">

                    <h4>
                      Score Breakdown
                    </h4>


                    {/* Correctness */}

                    <div className="score-row">

                      <span>
                        Correctness
                      </span>

                      <strong>

                        {submissionResult.total_test_cases >
                        0
                          ? `${Math.round(
                              (
                                submissionResult.test_cases_passed /
                                submissionResult.total_test_cases
                              ) * 40
                            )} / 40`
                          : "0 / 40"}

                      </strong>

                    </div>


                    {/* Algorithm */}

                    <div className="score-row">

                      <span>
                        Algorithm / Approach
                      </span>

                      <strong>

                        {submissionResult.algorithm_score ??
                          0}

                        {" / 25"}

                      </strong>

                    </div>


                    {/* Time */}

                    <div className="score-row">

                      <span>
                        Time Complexity
                      </span>

                      <strong>

                        {submissionResult.time_complexity_score ??
                          0}

                        {" / 15"}

                      </strong>

                    </div>


                    {/* Space */}

                    <div className="score-row">

                      <span>
                        Space Complexity
                      </span>

                      <strong>

                        {submissionResult.space_complexity_score ??
                          0}

                        {" / 10"}

                      </strong>

                    </div>


                    {/* Code Quality */}

                    <div className="score-row">

                      <span>
                        Code Quality
                      </span>

                      <strong>

                        {submissionResult.code_quality_score ??
                          0}

                        {" / 10"}

                      </strong>

                    </div>

                  </div>


                  {/* =================================================
                      AI EVALUATION
                  ================================================= */}

                  <div className="ai-feedback">

                    <div className="ai-feedback-header">

                      <div>
                        <h4>
                          AI Evaluation
                        </h4>

                        <p>
                          Detailed analysis of your
                          submitted solution.
                        </p>
                      </div>

                    </div>


                    <div className="ai-feedback-grid">


                      {/* =========================================
                          ALGORITHM
                      ========================================= */}

                      <div className="feedback-item">

                        <div className="feedback-item-header">

                          <strong>
                            Algorithm / Approach
                          </strong>

                          <span className="feedback-score">

                            {submissionResult.algorithm_score ??
                              0}

                            {" / 25"}

                          </span>

                        </div>

                        <p>
                          {submissionResult.algorithm_feedback ||
                            "Not evaluated yet."}
                        </p>

                      </div>


                      {/* =========================================
                          TIME COMPLEXITY
                      ========================================= */}

                      <div className="feedback-item">

                        <div className="feedback-item-header">

                          <strong>
                            Time Complexity
                          </strong>

                          <span className="feedback-score">

                            {submissionResult.time_complexity_score ??
                              0}

                            {" / 15"}

                          </span>

                        </div>

                        <p>
                          {submissionResult.time_complexity ||
                            "Not evaluated yet."}
                        </p>

                      </div>


                      {/* =========================================
                          SPACE COMPLEXITY
                      ========================================= */}

                      <div className="feedback-item">

                        <div className="feedback-item-header">

                          <strong>
                            Space Complexity
                          </strong>

                          <span className="feedback-score">

                            {submissionResult.space_complexity_score ??
                              0}

                            {" / 10"}

                          </span>

                        </div>

                        <p>
                          {submissionResult.space_complexity ||
                            "Not evaluated yet."}
                        </p>

                      </div>


                      {/* =========================================
                          CODE QUALITY
                      ========================================= */}

                      <div className="feedback-item">

                        <div className="feedback-item-header">

                          <strong>
                            Code Quality
                          </strong>

                          <span className="feedback-score">

                            {submissionResult.code_quality_score ??
                              0}

                            {" / 10"}

                          </span>

                        </div>

                        <p>
                          {submissionResult.code_quality_feedback ||
                            "Not evaluated yet."}
                        </p>

                      </div>


                      {/* =========================================
                          OVERALL FEEDBACK
                      ========================================= */}

                      <div className="feedback-item overall-feedback">

                        <div className="feedback-item-header">

                          <strong>
                            Overall Feedback
                          </strong>

                        </div>

                        <p>
                          {submissionResult.overall_feedback ||
                            "Not evaluated yet."}
                        </p>

                      </div>


                    </div>

                  </div>

                </div>

              )}


              {/* =================================================
                  TEST CASE RESULTS
              ================================================= */}

              {submissionResult.test_results &&
                submissionResult.test_results.length >
                  0 && (

                  <div className="test-results">

                    <h4>
                      Test Case Results
                    </h4>


                    {submissionResult.test_results.map(
                      (testResult, index) => {

                        const isHidden =
                          !testResult.input &&
                          !testResult.expected_output;

                        return (

                          <div
                            key={
                              testResult.test_case_id
                            }
                            className={
                              `test-result-item ${
                                testResult.passed
                                  ? "test-passed"
                                  : "test-failed"
                              }`
                            }
                          >


                            {/* Test Header */}

                            <div className="test-result-header">

                              <span>
                                Test Case{" "}
                                {index + 1}
                              </span>

                              <span>

                                {testResult.passed
                                  ? "✓ Passed"
                                  : "✗ Failed"}

                              </span>

                            </div>


                            {/* Hidden Test */}

                            {isHidden && (

                              <p className="hidden-test-message">

                                🔒 Hidden test case

                              </p>

                            )}


                            {/* Visible Test */}

                            {!isHidden && (

                              <div className="test-result-details">


                                {/* Input */}

                                <div>

                                  <strong>
                                    Input
                                  </strong>

                                  <pre>

                                    {JSON.stringify(
                                      testResult.input,
                                      null,
                                      2
                                    )}

                                  </pre>

                                </div>


                                {/* Expected */}

                                <div>

                                  <strong>
                                    Expected Output
                                  </strong>

                                  <pre>

                                    {JSON.stringify(
                                      testResult.expected_output,
                                      null,
                                      2
                                    )}

                                  </pre>

                                </div>


                                {/* Actual */}

                                <div>

                                  <strong>
                                    Your Output
                                  </strong>

                                  <pre>

                                    {JSON.stringify(
                                      testResult.actual_output,
                                      null,
                                      2
                                    )}

                                  </pre>

                                </div>


                                {/* Error */}

                                {testResult.error && (

                                  <div>

                                    <strong>
                                      Error
                                    </strong>

                                    <pre>
                                      {testResult.error}
                                    </pre>

                                  </div>

                                )}

                              </div>

                            )}

                          </div>

                        );
                      }
                    )}

                  </div>

                )}

            </div>

          )}

        </div>

      </section>

    </div>
  );
}

export default ProblemWorkspace;