import { useEffect, useState } from "react";

import apiClient from "../api/client";

function MyProgress() {
  const [selections, setSelections] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadProgress = async () => {
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
          "Progress loading failed:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const updateStatus = async (
    id,
    status
  ) => {
    try {
      const response =
        await apiClient.patch(
          `/progress/${id}/`,
          { status }
        );

      setSelections(
        (current) =>
          current.map(
            (selection) =>
              selection.id === id
                ? response.data
                : selection
          )
      );
    } catch (error) {
      console.error(
        "Status update failed:",
        error
      );
    }
  };

  if (loading) {
    return (
      <p className="loading">
        Loading progress...
      </p>
    );
  }

  const completed =
    selections.filter(
      (item) =>
        item.status ===
        "COMPLETED"
    ).length;

  const percentage =
    selections.length > 0
      ? Math.round(
          (completed /
            selections.length) *
            100
        )
      : 0;

  return (
    <div className="page">
      <h1>My Progress</h1>

      <div className="progress-summary">
        <h2>{percentage}%</h2>
        <p>Completion Rate</p>
      </div>

      <div className="progress-list">
        {selections.map(
          (selection) => (
            <div
              className="progress-card"
              key={selection.id}
            >
              <h3>
                Question #
                {selection.question}
              </h3>

              <p>
                Status:{" "}
                <strong>
                  {selection.status}
                </strong>
              </p>

              <div className="status-buttons">
                <button
                  onClick={() =>
                    updateStatus(
                      selection.id,
                      "SELECTED"
                    )
                  }
                >
                  Selected
                </button>

                <button
                  onClick={() =>
                    updateStatus(
                      selection.id,
                      "IN_PROGRESS"
                    )
                  }
                >
                  In Progress
                </button>

                <button
                  onClick={() =>
                    updateStatus(
                      selection.id,
                      "COMPLETED"
                    )
                  }
                >
                  Completed
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {selections.length === 0 && (
        <p>
          You haven't selected
          any questions yet.
        </p>
      )}
    </div>
  );
}

export default MyProgress;