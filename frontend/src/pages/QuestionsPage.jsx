import { useEffect, useState } from "react";

import apiClient from "../api/client";
import QuestionCard from "../components/QuestionCard";

function QuestionsPage() {
  const [questions, setQuestions] =
    useState([]);

  const [selections, setSelections] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [difficulty, setDifficulty] =
    useState("");

  const [topic, setTopic] =
    useState("");

  const [platform, setPlatform] =
    useState("");

  const [nextUrl, setNextUrl] =
    useState(null);

  const [previousUrl, setPreviousUrl] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const loadQuestions = async (
    url = null
  ) => {
    try {
      setLoading(true);

      let response;

      if (url) {
        const cleanUrl =
          url.replace(
            "http://127.0.0.1:8000/api",
            ""
          );

        response =
          await apiClient.get(cleanUrl);
      } else {
        const params =
          new URLSearchParams();

        if (search)
          params.append(
            "search",
            search
          );

        if (difficulty)
          params.append(
            "difficulty",
            difficulty
          );

        if (topic)
          params.append(
            "topic",
            topic
          );

        if (platform)
          params.append(
            "platform",
            platform
          );

        response =
          await apiClient.get(
            `/questions/?${params.toString()}`
          );
      }

      setQuestions(
        response.data.results || []
      );

      setNextUrl(response.data.next);
      setPreviousUrl(
        response.data.previous
      );
    } catch (error) {
      console.error(
        "Questions loading failed:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSelections = async () => {
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
        "Selections loading failed:",
        error
      );
    }
  };

  useEffect(() => {
    loadQuestions();
    loadSelections();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    loadQuestions();
  };

  return (
    <div className="page">
      <h1>Questions</h1>

      <form
        className="filter-bar"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={difficulty}
          onChange={(event) =>
            setDifficulty(
              event.target.value
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
          placeholder="Topic"
          value={topic}
          onChange={(event) =>
            setTopic(event.target.value)
          }
        />

        <input
          placeholder="Platform"
          value={platform}
          onChange={(event) =>
            setPlatform(
              event.target.value
            )
          }
        />

        <button type="submit">
          Search
        </button>
      </form>

      {loading ? (
        <p className="loading">
          Loading questions...
        </p>
      ) : (
        <>
          <div className="question-grid">
            {questions.map(
              (question) => {
                const selection =
                  selections.find(
                    (item) =>
                      item.question ===
                      question.id
                  );

                return (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    selection={selection}
                    onSelected={(newSelection) =>
                      setSelections(
                        (current) => [
                          ...current,
                          newSelection,
                        ]
                      )
                    }
                  />
                );
              }
            )}
          </div>

          {questions.length === 0 && (
            <p>
              No questions found.
            </p>
          )}

          <div className="pagination">
            <button
              disabled={!previousUrl}
              onClick={() =>
                loadQuestions(
                  previousUrl
                )
              }
            >
              Previous
            </button>

            <button
              disabled={!nextUrl}
              onClick={() =>
                loadQuestions(nextUrl)
              }
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default QuestionsPage;