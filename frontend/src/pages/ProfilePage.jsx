import { useEffect, useState } from "react";

import apiClient from "../api/client";

function ProfilePage() {
  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response =
          await apiClient.get(
            "/users/profile/"
          );

        setProfile(response.data);
      } catch (error) {
        console.error(
          "Profile loading failed:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <p className="loading">
        Loading profile...
      </p>
    );
  }

  return (
    <div className="page">
      <h1>My Profile</h1>

      <div className="profile-card">
        {profile &&
          Object.entries(profile).map(
            ([key, value]) => (
              <div
                className="profile-row"
                key={key}
              >
                <strong>
                  {key}
                </strong>

                <span>
                  {String(value)}
                </span>
              </div>
            )
          )}
      </div>
    </div>
  );
}

export default ProfilePage;