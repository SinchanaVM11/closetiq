
import { useCallback, useEffect, useState } from "react";
import {
  createGarment,
  deleteGarment,
  getGarments,
  recommendOutfits,
} from "./services/api";
import "./index.css";

const CATEGORIES = ["top", "bottom", "dress", "outerwear", "shoes", "accessory"];
const STYLES = ["casual", "minimal", "street", "smart", "sporty"];
const OCCASIONS = ["college", "work", "casual", "party", "date", "travel"];

const INITIAL_FORM = {
  name: "",
  category: "top",
  color: "",
  style: "casual",
  occasions: ["college", "casual"],
  seasons: ["all"],
  imageUrl: "",
};

const CATEGORY_ICONS = {
  top: "◒",
  bottom: "◐",
  dress: "♧",
  outerwear: "◇",
  shoes: "⌁",
  accessory: "✳",
};

const plannerDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function App() {
  const [activePage, setActivePage] = useState("home");
  const [garments, setGarments] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [occasion, setOccasion] = useState("college");
  const [weather, setWeather] = useState("warm");
  const [preferredStyle, setPreferredStyle] = useState("casual");
  const [outfits, setOutfits] = useState([]);
  const [loadingWardrobe, setLoadingWardrobe] = useState(true);
  const [loadingOutfits, setLoadingOutfits] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadGarments = useCallback(async () => {
    setLoadingWardrobe(true);
    try {
      const result = await getGarments();
      setGarments(result.data || []);
      setError("");
    } catch (err) {
      setError(err.message || "Could not load your wardrobe.");
    } finally {
      setLoadingWardrobe(false);
    }
  }, []);

  useEffect(() => {
    loadGarments();
  }, [loadGarments]);

  const filteredGarments = garments.filter((garment) => {
    const matchesSearch = `${garment.name} ${garment.color} ${garment.style}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || garment.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const heroGarments = garments.slice(0, 3);
  const plannerItems = plannerDays.map((day, index) => ({
    day,
    outfit: garments[index % garments.length] || null,
    isToday: index === 2,
  }));

  async function handleAddGarment(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      await createGarment({
        ...form,
        name: form.name.trim(),
        color: form.color.trim(),
        imageUrl: form.imageUrl.trim(),
      });

      setForm(INITIAL_FORM);
      setShowForm(false);
      setNotice("Added to your wardrobe.");
      await loadGarments();
    } catch (err) {
      setError(err.message || "Could not save this item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteGarment(id) {
    if (!window.confirm("Remove this item from your wardrobe?")) return;

    setError("");
    setNotice("");

    try {
      await deleteGarment(id);
      setGarments((current) =>
        current.filter((garment) => garment._id !== id)
      );
      setNotice("Item removed from your wardrobe.");
    } catch (err) {
      setError(err.message || "Could not remove this item.");
    }
  }

  async function handleRecommend(event) {
    event.preventDefault();
    setLoadingOutfits(true);
    setError("");
    setNotice("");
    setOutfits([]);

    try {
      const result = await recommendOutfits({
        occasion,
        weather,
        style: preferredStyle,
      });

      setOutfits(result.data || []);

      if (!result.data?.length) {
        setNotice(
          "Add at least one top, one bottom, and one pair of shoes to generate complete outfits."
        );
      }
    } catch (err) {
      setError(err.message || "Could not generate outfit recommendations.");
    } finally {
      setLoadingOutfits(false);
    }
  }

  function toggleOccasion(value) {
    setForm((current) => ({
      ...current,
      occasions: current.occasions.includes(value)
        ? current.occasions.filter((item) => item !== value)
        : [...current.occasions, value],
    }));
  }

  const categoryCount = (category) =>
    garments.filter((item) => item.category === category).length;

  const navItems = [
    { id: "home", label: "Home", icon: "◌" },
    { id: "wardrobe", label: "Wardrobe", icon: "▣" },
    { id: "style", label: "Style me", icon: "✦" },
    { id: "inspiration", label: "Inspiration", icon: "◍" },
    { id: "history", label: "History", icon: "▤" },
    { id: "profile", label: "Profile", icon: "◎" },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => setActivePage("home")}>
          <span className="brand-mark">c.</span>
          <span>
            <strong>closetiq</strong>
            <small>your wardrobe, reimagined</small>
          </span>
        </button>

        <div className="sidebar-label">your space</div>

        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => setActivePage(item.id)}
          >
            <span>{item.icon}</span>
            {item.label}
            {item.id === "wardrobe" && <span className="nav-count">{garments.length}</span>}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-icon">✧</span>
            <p>Wear what you own. Build a mood. Repeat with intention.</p>
          </div>
          <span className="version-label">closetiq · editorial styling studio</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span className="breadcrumb">your personal style space</span>
          <span className="status-indicator">
            <span /> wardrobe connected
          </span>
        </header>

        {(error || notice) && (
          <div className={`feedback ${error ? "feedback-error" : ""}`}>
            <span>{error || notice}</span>
            <button
              onClick={() => {
                setError("");
                setNotice("");
              }}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {activePage === "home" && (
          <section className="page home-page">
            <div className="hero-panel">
              <div className="hero-copy">
                <span className="eyebrow">your wardrobe, reimagined</span>
                <h1>
                  Getting dressed,
                  <span className="heading-break">with a little more you.</span>
                </h1>
                <p>
                  Your wardrobe, your weather, your mood. Let&apos;s put it together.
                </p>
                <div className="hero-actions">
                  <button
                    type="button"
                    className="button button-dark"
                    onClick={() => setActivePage("style")}
                  >
                    Style my day
                  </button>
                  <button
                    type="button"
                    className="button button-light"
                    onClick={() => setActivePage("wardrobe")}
                  >
                    Add a piece
                  </button>
                </div>
                <div className="context-strip">
                  <span>College · warm weather · casual</span>
                  <strong>{garments.length} pieces in rotation</strong>
                </div>
              </div>

              <div className="hero-collage">
                {heroGarments.length ? (
                  heroGarments.map((garment, index) => (
                    <div
                      key={garment._id || index}
                      className={`collage-card card-${index + 1}`}
                      style={
                        garment.imageUrl
                          ? { backgroundImage: `url("${garment.imageUrl}")` }
                          : {}
                      }
                    >
                      {!garment.imageUrl && (
                        <span>{CATEGORY_ICONS[garment.category] || "✳"}</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="empty-collage">
                    <span className="empty-symbol">✧</span>
                    <p>Start your closet by adding your first garment.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="home-grid">
              <div className="panel feature-panel planter-panel">
                <div className="panel-header">
                  <span className="eyebrow">week plan</span>
                  <h2>Your weekly edit</h2>
                </div>
                <div className="planner-strip">
                  {plannerItems.map((item) => (
                    <div
                      key={item.day}
                      className={`planner-card ${item.isToday ? "today" : ""}`}
                    >
                      <span>{item.day}</span>
                      {item.outfit ? (
                        <>
                          <div
                            className="planner-thumb"
                            style={
                              item.outfit.imageUrl
                                ? { backgroundImage: `url("${item.outfit.imageUrl}")` }
                                : {}
                            }
                          >
                            {!item.outfit.imageUrl && (
                              <span>{CATEGORY_ICONS[item.outfit.category] || "✳"}</span>
                            )}
                          </div>
                          <strong>{item.outfit.name}</strong>
                        </>
                      ) : (
                        <div className="planner-empty">
                          <small>no outfit planned</small>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel feature-panel quick-panel">
                <div className="panel-header">
                  <span className="eyebrow">quick access</span>
                  <h2>Start from what you own</h2>
                </div>
                <div className="quick-actions">
                  <button type="button" onClick={() => setActivePage("wardrobe")}>
                    <span>Wardrobe</span>
                    <strong>{garments.length} pieces</strong>
                  </button>
                  <button type="button" onClick={() => setActivePage("style")}>
                    <span>Style me</span>
                    <strong>fresh matches</strong>
                  </button>
                  <button type="button" onClick={() => setActivePage("inspiration")}>
                    <span>Inspiration</span>
                    <strong>save ideas</strong>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activePage === "wardrobe" && (
          <section className="page">
            <div className="page-heading">
              <div>
                <span className="eyebrow">the collection</span>
                <h1>Your wardrobe<span className="heading-dot">.</span></h1>
                <p className="page-description">
                  Every piece you own, displayed like a curated archive.
                </p>
              </div>
              <button
                className="button button-dark"
                onClick={() => setShowForm((current) => !current)}
              >
                {showForm ? "Close ×" : "+ Add a piece"}
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">total pieces</span>
                <strong>{garments.length.toString().padStart(2, "0")}</strong>
                <span className="stat-foot">in your closet</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">tops</span>
                <strong>{categoryCount("top").toString().padStart(2, "0")}</strong>
                <span className="stat-foot">ready to style</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">bottoms</span>
                <strong>{categoryCount("bottom").toString().padStart(2, "0")}</strong>
                <span className="stat-foot">for easy combinations</span>
              </div>
              <div className="stat-card stat-highlight">
                <span className="stat-label">shoes</span>
                <strong>{categoryCount("shoes").toString().padStart(2, "0")}</strong>
                <span className="stat-foot">the finishing layer</span>
              </div>
            </div>

            {showForm && (
              <form className="garment-form panel" onSubmit={handleAddGarment}>
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">new addition</span>
                    <h2>Add to your collection</h2>
                  </div>
                </div>

                <div className="form-grid">
                  <label>
                    Item name *
                    <input
                      required
                      maxLength={100}
                      placeholder="e.g. Black oversized tee"
                      value={form.name}
                      onChange={(event) =>
                        setForm({ ...form, name: event.target.value })
                      }
                    />
                  </label>

                  <label>
                    Category *
                    <select
                      value={form.category}
                      onChange={(event) =>
                        setForm({ ...form, category: event.target.value })
                      }
                    >
                      {CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                          {item.charAt(0).toUpperCase() + item.slice(1)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Main color *
                    <input
                      required
                      maxLength={40}
                      placeholder="e.g. black"
                      value={form.color}
                      onChange={(event) =>
                        setForm({ ...form, color: event.target.value })
                      }
                    />
                  </label>

                  <label>
                    Style
                    <select
                      value={form.style}
                      onChange={(event) =>
                        setForm({ ...form, style: event.target.value })
                      }
                    >
                      {STYLES.map((item) => (
                        <option key={item} value={item}>
                          {item.charAt(0).toUpperCase() + item.slice(1)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="full-width">
                    Image URL <span className="optional">(optional)</span>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={form.imageUrl}
                      onChange={(event) =>
                        setForm({ ...form, imageUrl: event.target.value })
                      }
                    />
                  </label>

                  <fieldset className="full-width checkbox-group">
                    <legend>Where would you wear it?</legend>
                    <div className="chip-options">
                      {OCCASIONS.map((item) => (
                        <label className="check-chip" key={item}>
                          <input
                            type="checkbox"
                            checked={form.occasions.includes(item)}
                            onChange={() => toggleOccasion(item)}
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="button button-light"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="button button-dark"
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save to wardrobe ↗"}
                  </button>
                </div>
              </form>
            )}

            <div className="collection-toolbar">
              <div>
                <span className="eyebrow">your pieces</span>
                <h2>The collection <span className="muted-count">{garments.length}</span></h2>
              </div>
              <input
                className="search-input"
                type="search"
                placeholder="Search your wardrobe..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="filter-row">
              {["all", ...CATEGORIES].map((item) => (
                <button
                  key={item}
                  className={`filter-chip ${categoryFilter === item ? "selected" : ""}`}
                  onClick={() => setCategoryFilter(item)}
                >
                  {item === "all"
                    ? "Everything"
                    : item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>

            {loadingWardrobe ? (
              <div className="empty-state">
                <div className="loading-spinner" />
                <p>Opening your wardrobe...</p>
              </div>
            ) : filteredGarments.length === 0 ? (
              <div className="empty-state">
                <span className="empty-symbol">✳</span>
                <h3>{garments.length ? "Nothing found" : "Your story starts here."}</h3>
                <p>
                  {garments.length
                    ? "Try another search or category."
                    : "Add your first piece and start building outfits from what you own."}
                </p>
                {!garments.length && (
                  <button
                    className="button button-dark"
                    onClick={() => setShowForm(true)}
                  >
                    Add your first piece
                  </button>
                )}
              </div>
            ) : (
              <div className="wardrobe-grid">
                {filteredGarments.map((garment, index) => (
                  <article className="garment-card" key={garment._id}>
                    <div
                      className={`garment-visual visual-${index % 6}`}
                      style={
                        garment.imageUrl
                          ? { backgroundImage: `url("${garment.imageUrl}")` }
                          : {}
                      }
                    >
                      {!garment.imageUrl && (
                        <span className="garment-symbol">
                          {CATEGORY_ICONS[garment.category] || "✳"}
                        </span>
                      )}
                      <span className="category-tag">{garment.category}</span>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteGarment(garment._id)}
                        aria-label={`Delete ${garment.name}`}
                        title="Remove item"
                      >
                        ×
                      </button>
                    </div>
                    <div className="garment-info">
                      <div>
                        <h3>{garment.name}</h3>
                        <p>
                          <span
                            className="color-dot"
                            style={{ backgroundColor: garment.color }}
                          />
                          {garment.color}
                        </p>
                      </div>
                      <span className="garment-style">{garment.style}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activePage === "style" && (
          <section className="page style-page">
            <div className="page-heading">
              <div>
                <span className="eyebrow">daily styling studio</span>
                <h1>Let&apos;s get dressed<span className="heading-dot">.</span></h1>
                <p className="page-description">
                  Tell us about your day. We&apos;ll work with what you already own.
                </p>
              </div>
              <span className="style-star">✳</span>
            </div>

            <div className="style-layout">
              <form className="context-panel panel" onSubmit={handleRecommend}>
                <span className="eyebrow">01 · set the scene</span>
                <h2>What&apos;s the plan?</h2>
                <p className="panel-description">
                  Your outfit should fit your day, not the other way around.
                </p>

                <label className="field-label" htmlFor="occasion">the occasion</label>
                <div className="choice-grid">
                  {OCCASIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`choice-button ${occasion === item ? "chosen" : ""}`}
                      onClick={() => setOccasion(item)}
                    >
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </button>
                  ))}
                </div>

                <label className="field-label" htmlFor="weather">the weather</label>
                <select
                  id="weather"
                  className="full-select"
                  value={weather}
                  onChange={(event) => setWeather(event.target.value)}
                >
                  <option value="warm">☀ Warm / sunny</option>
                  <option value="hot">♨ Hot</option>
                  <option value="cool">☁ Cool</option>
                  <option value="cold">❄ Cold</option>
                  <option value="rainy">☂ Rainy / monsoon</option>
                </select>

                <label className="field-label" htmlFor="style">your mood</label>
                <select
                  id="style"
                  className="full-select"
                  value={preferredStyle}
                  onChange={(event) => setPreferredStyle(event.target.value)}
                >
                  {STYLES.map((item) => (
                    <option key={item} value={item}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </option>
                  ))}
                </select>

                <div className="context-summary">
                  <span>your brief</span>
                  <p>
                    {occasion} <span>·</span> {weather} weather <span>·</span>{" "}
                    {preferredStyle} style
                  </p>
                </div>

                <button
                  className="button button-dark recommend-button"
                  type="submit"
                  disabled={loadingOutfits}
                >
                  {loadingOutfits ? "Finding your look..." : "Find my outfits ↗"}
                </button>
                <p className="privacy-note">
                  Recommendations use your saved wardrobe and matching rules.
                </p>
              </form>

              <div className="recommendation-area">
                <div className="results-heading">
                  <div>
                    <span className="eyebrow">02 · the edit</span>
                    <h2>Looks for you</h2>
                  </div>
                  {outfits.length > 0 && (
                    <span className="result-count">
                      {outfits.length} {outfits.length === 1 ? "LOOK" : "LOOKS"}
                    </span>
                  )}
                </div>

                {loadingOutfits ? (
                  <div className="empty-state results-empty">
                    <div className="loading-spinner" />
                    <p>Putting the pieces together...</p>
                  </div>
                ) : outfits.length === 0 ? (
                  <div className="empty-state results-empty">
                    <span className="empty-symbol">✧</span>
                    <h3>Your next favorite outfit awaits.</h3>
                    <p>
                      Choose your occasion and mood, then let ClosetIQ put your existing
                      pieces together.
                    </p>
                    <span className="results-hint">
                      {garments.length} PIECES IN YOUR WARDROBE
                    </span>
                  </div>
                ) : (
                  <div className="outfit-list">
                    {outfits.map((outfit, index) => (
                      <article className="outfit-card" key={`${outfit.rank}-${index}`}>
                        <div className="outfit-card-header">
                          <div>
                            <span className="eyebrow">look 0{outfit.rank || index + 1}</span>
                            <h3>{outfit.title || "Your outfit edit"}</h3>
                          </div>
                          <div className="score-badge">
                            <strong>{outfit.score}</strong>
                            <span>/ 100</span>
                          </div>
                        </div>

                        <div className="outfit-items">
                          {(outfit.items || []).map((item) => (
                            <div className="outfit-item" key={item._id}>
                              <div
                                className="outfit-item-visual"
                                style={
                                  item.imageUrl
                                    ? { backgroundImage: `url("${item.imageUrl}")` }
                                    : {}
                                }
                              >
                                {!item.imageUrl && (
                                  <span>{CATEGORY_ICONS[item.category] || "✳"}</span>
                                )}
                              </div>
                              <div className="outfit-item-details">
                                <span className="eyebrow">{item.category}</span>
                                <strong>{item.name}</strong>
                                <span>{item.color}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="score-factors">
                          {Object.entries(outfit.factors || {}).map(([key, value]) => (
                            <div className="factor" key={key}>
                              <div className="factor-label">
                                <span>{key}</span>
                                <strong>{value}</strong>
                              </div>
                              <div className="factor-track">
                                <span style={{ width: `${value}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>

                        {outfit.reasons?.length > 0 && (
                          <div className="outfit-reasons">
                            <span>why it works</span>
                            <ul>
                              {outfit.reasons.map((reason) => (
                                <li key={reason}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activePage === "inspiration" && (
          <section className="page inspiration-page">
            <div className="page-heading">
              <div>
                <span className="eyebrow">moodboard</span>
                <h1>Inspiration<span className="heading-dot">.</span></h1>
                <p className="page-description">
                  Save looks you love and connect them back to the pieces you already own.
                </p>
              </div>
              <button type="button" className="button button-dark">
                Save an idea
              </button>
            </div>

            <div className="masonry-grid">
              {garments.length ? (
                garments.slice(0, 6).map((garment, index) => (
                  <article key={garment._id || index} className={`masonry-card card-${index % 4}`}>
                    <div
                      className="masonry-visual"
                      style={
                        garment.imageUrl
                          ? { backgroundImage: `url("${garment.imageUrl}")` }
                          : {}
                      }
                    >
                      {!garment.imageUrl && (
                        <span>{CATEGORY_ICONS[garment.category] || "✳"}</span>
                      )}
                    </div>
                    <div className="masonry-body">
                      <span>{garment.category}</span>
                      <h3>{garment.name}</h3>
                      <small>Find it in my wardrobe</small>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state full-span">
                  <span className="empty-symbol">✧</span>
                  <h3>Your inspiration board is waiting.</h3>
                  <p>Add a few garments and save ideas to start building your personal moodboard.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {activePage === "history" && (
          <section className="page history-page">
            <div className="page-heading">
              <div>
                <span className="eyebrow">style diary</span>
                <h1>Worn lately<span className="heading-dot">.</span></h1>
                <p className="page-description">
                  A journal of outfits you have worn and what you want to repeat.
                </p>
              </div>
            </div>

            {garments.length ? (
              <div className="history-list">
                {garments.slice(0, 4).map((garment, index) => (
                  <article key={garment._id || index} className="history-card panel">
                    <div
                      className="history-thumb"
                      style={
                        garment.imageUrl
                          ? { backgroundImage: `url("${garment.imageUrl}")` }
                          : {}
                      }
                    >
                      {!garment.imageUrl && (
                        <span>{CATEGORY_ICONS[garment.category] || "✳"}</span>
                      )}
                    </div>
                    <div className="history-copy">
                      <span className="eyebrow">{index + 1} week ago</span>
                      <h3>{garment.name}</h3>
                      <p>Worn for a {garment.style} look and saved as part of the week&apos;s styling notes.</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-symbol">✧</span>
                <h3>Your style diary is empty.</h3>
                <p>Mark an outfit as worn to start building a record of what you keep reaching for.</p>
              </div>
            )}
          </section>
        )}

        {activePage === "profile" && (
          <section className="page profile-page">
            <div className="page-heading">
              <div>
                <span className="eyebrow">your preferences</span>
                <h1>Profile<span className="heading-dot">.</span></h1>
                <p className="page-description">
                  A lightweight set of style signals that shape future recommendations.
                </p>
              </div>
            </div>

            <div className="profile-grid">
              <div className="panel profile-card">
                <span className="eyebrow">style identity</span>
                <h2>Core preferences</h2>
                <ul>
                  <li>Favored mood: minimal</li>
                  <li>Favorite colors: beige, navy, black</li>
                  <li>Comfort-first: yes</li>
                </ul>
              </div>

              <div className="panel profile-card">
                <span className="eyebrow">wardrobe rhythm</span>
                <h2>What matters</h2>
                <ul>
                  <li>Prioritizes day-to-day versatility</li>
                  <li>Prefers weather-aware dressing</li>
                  <li>Limits repeated outfit combos</li>
                </ul>
              </div>

              <div className="panel profile-card">
                <span className="eyebrow">settings</span>
                <h2>App preferences</h2>
                <ul>
                  <li>Styling updates on</li>
                  <li>Incoming weather view on</li>
                  <li>Save suggestions automatically off</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        <footer className="app-footer">
          <span>closetiq © 2026</span>
          <span>made for the way you get dressed.</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
