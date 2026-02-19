import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/header/Header.jsx";
import axios from "axios";
import "../styles/Profile.css";
import "../styles/ProfileView.css";

export default function Profile({ isLoggedIn, setIsLoggedIn, userId: currentUserId }) {
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();
  const profileUserId = paramUserId ? parseInt(paramUserId, 10) : currentUserId;

  const [profile, setProfile] = useState({
    username: "",
    avatarUrl: "/images/default.png",
    skills: [],
    reviews: [],
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  const isOwnProfile = profileUserId && currentUserId && Number(profileUserId) === Number(currentUserId);

  // Find current user's existing review
  const myReview = profile.reviews?.find((r) => Number(r.Reviewer) === Number(currentUserId)) || null;

  useEffect(() => {
    if (!profileUserId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    axios
      .get(`http://localhost:3001/users/${profileUserId}/public-profile`)
      .then((res) => {
        const data = res.data;
        setProfile({
          username: data.username || "User",
          avatarUrl: data.avatarUrl || "/images/default.png",
          skills: data.skills || [],
          reviews: data.reviews || [],
          avgRating: data.avgRating || 0,
        });
        // Pre-fill form if user already reviewed
        const existing = (data.reviews || []).find((r) => Number(r.Reviewer) === Number(currentUserId));
        if (existing) {
          setFeedbackRating(existing.Rating || 0);
          setFeedbackText(existing.Content || "");
        } else {
          setFeedbackRating(0);
          setFeedbackText("");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message || "Failed to load profile.");
      })
      .finally(() => setLoading(false));
  }, [profileUserId, currentUserId]);

  const avatarSrc = profile.avatarUrl?.startsWith("/") ? profile.avatarUrl : `/${profile.avatarUrl || ""}`;

  const loadProfile = () => {
    if (!profileUserId) return;
    axios
      .get(`http://localhost:3001/users/${profileUserId}/public-profile`)
      .then((res) => {
        const data = res.data;
        setProfile({
          username: data.username || "User",
          avatarUrl: data.avatarUrl || "/images/default.png",
          skills: data.skills || [],
          reviews: data.reviews || [],
          avgRating: data.avgRating || 0,
        });
        const existing = (data.reviews || []).find((r) => Number(r.Reviewer) === Number(currentUserId));
        if (existing) {
          setFeedbackRating(existing.Rating || 0);
          setFeedbackText(existing.Content || "");
        } else {
          setFeedbackRating(0);
          setFeedbackText("");
        }
      })
      .catch(() => {});
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!profileUserId || !currentUserId || feedbackRating < 1) return;
    setFeedbackSubmitting(true);
    const payload = { Rating: feedbackRating, Content: feedbackText, Reviewee: profileUserId };
    const isEdit = !!myReview;

    const promise = isEdit
      ? axios.put("http://localhost:3001/reviews/edit", payload, { withCredentials: true })
      : axios.post("http://localhost:3001/reviews/create", payload, { withCredentials: true });

    promise
      .then(() => {
        if (!isEdit) {
          setFeedbackRating(0);
          setFeedbackText("");
        }
        loadProfile();
      })
      .catch((err) => {
        alert(err.response?.data?.error || (isEdit ? "Could not update feedback." : "Could not submit feedback."));
      })
      .finally(() => setFeedbackSubmitting(false));
  };

  const handleMessage = () => {
    if (!profileUserId || !currentUserId) return;
    axios
      .post(
        "http://localhost:3001/chats/private",
        { otherUserId: profileUserId },
        { withCredentials: true }
      )
      .then((res) => {
        navigate("/chat", { state: { openChatId: res.data.ChatID } });
      })
      .catch((err) => {
        alert(err.response?.data?.error || "Could not open chat.");
      });
  };

  if (loading) {
    return (
      <>
        <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <main className="profile-view-wrap">
          <p>Loading...</p>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <main className="profile-view-wrap">
          <p className="form-error">{error}</p>
          {currentUserId && (
            <button className="btn btn-primary" onClick={() => navigate("/profile")}>
              Back to my profile
            </button>
          )}
        </main>
      </>
    );
  }

  return (
    <>
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <main className="profile-view-wrap">
        <section className="profile-view-card">
          <div className="profile-view-top">
            <img src={avatarSrc} alt={profile.username} className="profile-view-avatar" />
            <div className="profile-view-header">
              <h1>{profile.username}</h1>
              <p className="profile-view-join">Join Date: —</p>
              {!isOwnProfile && currentUserId && (
                <button
                  type="button"
                  className="profile-view-message-btn"
                  onClick={handleMessage}
                >
                  Message
                </button>
              )}
              {isOwnProfile && (
                <button
                  type="button"
                  className="btn btn-primary profile-view-settings-btn"
                  onClick={() => navigate("/usersettings")}
                >
                  User settings
                </button>
              )}
            </div>
          </div>

          <div className="profile-view-sections">
            <section className="profile-view-section">
              <h3>Feedbacks about me...</h3>
              <div className="profile-view-stars" aria-label={`Rating: ${profile.avgRating} out of 5`}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`star ${i <= profile.avgRating ? "filled" : ""}`}>
                    ★
                  </span>
                ))}
              </div>
              <div className="profile-view-feedback-box">
                {profile.reviews.length === 0 ? (
                  <p className="muted">No feedback yet.</p>
                ) : (
                  profile.reviews.map((r, i) => (
                    <div key={i} className="feedback-item">
                      <span className="feedback-rating">{r.Rating ? "★".repeat(r.Rating) : ""}</span>
                      {r.Content && <p>{r.Content}</p>}
                    </div>
                  ))
                )}
              </div>
              {!isOwnProfile && currentUserId && (
                <form className="feedback-form" onSubmit={handleSubmitFeedback}>
                  <p className="feedback-form-label">
                    {myReview ? "Edit your rating:" : "Your rating:"}
                  </p>
                  <div className="feedback-form-stars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        className={`feedback-star-btn ${i <= feedbackRating ? "filled" : ""}`}
                        onClick={() => setFeedbackRating(i)}
                        aria-label={`${i} star${i > 1 ? "s" : ""}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <label className="feedback-form-label">Your opinion (optional):</label>
                  <textarea
                    className="feedback-form-textarea"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value.slice(0, 200))}
                    placeholder="Write your feedback..."
                    rows={3}
                    maxLength={200}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary feedback-form-submit"
                    disabled={feedbackSubmitting || feedbackRating < 1}
                  >
                    {feedbackSubmitting
                      ? "Saving…"
                      : myReview
                        ? "Update feedback"
                        : "Submit feedback"}
                  </button>
                </form>
              )}
            </section>

            <section className="profile-view-section">
              <h3>Skills:</h3>
              <div className="profile-view-skills-box">
                {profile.skills.length === 0 ? (
                  <p className="muted">No skills listed.</p>
                ) : (
                  <ul className="profile-view-skills-list">
                    {profile.skills.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}
