import { useEffect, useMemo, useState } from "react";
import {
  createGarment,
  deleteGarment,
  getGarments,
  recommendOutfits,
  updateGarment,
} from "./services/api";
import { findClosestMatches, garmentFallback } from "./utils/recommendation";
import "./index.css";
import "./App.css";

const CATEGORIES = ["top", "bottom", "dress", "outerwear", "shoes", "accessory"];
const OCCASIONS = ["college", "work", "casual", "party", "date", "travel"];
const STYLES = ["casual", "minimal", "street", "smart", "sporty"];
const COLORS = ["black", "white", "blue", "navy", "beige", "grey", "brown", "green", "red", "pink", "cream"];
const EMPTY_FORM = { name: "", category: "top", color: "", style: "casual", occasions: ["casual"], seasons: ["all"], imageUrl: "" };

function App() {
  const [page, setPage] = useState("wardrobe");
  const [garments, setGarments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [editing, setEditing] = useState(null);

  async function refresh() {
    setLoading(true);
    try {
      const result = await getGarments();
      setGarments(result.data || []);
      setNotice(null);
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }
  // The initial request synchronizes the app with the Mongo-backed wardrobe.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refresh(); }, []);

  async function saveGarment(values) {
    try {
      if (editing) await updateGarment(editing._id, values);
      else await createGarment(values);
      setEditing(null);
      await refresh();
      setNotice({ type: "success", text: editing ? "Piece updated." : "Piece added to your wardrobe." });
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    }
  }

  async function removeGarment(id) {
    if (!window.confirm("Remove this piece from your wardrobe?")) return;
    try {
      await deleteGarment(id);
      setGarments((current) => current.filter((item) => item._id !== id));
      setNotice({ type: "success", text: "Piece removed." });
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    }
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} count={garments.length} />
      <main className="main-content">
        <header className="topbar">
          <span className="wordmark-mobile">closetiq</span>
          <span className="topbar-kicker">your personal style space</span>
          <span className="connection"><i /> wardrobe connected</span>
        </header>
        {notice && <div className={`notice ${notice.type}`} role="status"><span>{notice.text}</span><button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message">×</button></div>}
        {page === "wardrobe" && <WardrobePage garments={garments} loading={loading} onSave={saveGarment} onEdit={setEditing} onDelete={removeGarment} editing={editing} />}
        {page === "style" && <StylePage garments={garments} />}
        {page === "recreate" && <RecreatePage garments={garments} />}
      </main>
    </div>
  );
}

function Sidebar({ page, setPage, count }) {
  const links = [
    { id: "wardrobe", label: "My wardrobe", icon: "▦" },
    { id: "style", label: "Style me", icon: "✦" },
    { id: "recreate", label: "Recreate this look", icon: "◌" },
  ];
  return <aside className="sidebar">
    <button className="brand" type="button" onClick={() => setPage("wardrobe")}><span className="brand-mark">c.</span><span><strong>closetiq</strong><small>wardrobe, reimagined</small></span></button>
    <p className="sidebar-label">your studio</p>
    <nav aria-label="Primary navigation">{links.map((link) => <button key={link.id} type="button" className={`nav-item ${page === link.id ? "active" : ""}`} onClick={() => setPage(link.id)}><span className="nav-icon">{link.icon}</span>{link.label}{link.id === "wardrobe" && <b>{count}</b>}</button>)}</nav>
    <div className="sidebar-bottom"><div className="sidebar-note"><span>✧</span><p>Wear what you own. Build a mood. Repeat with intention.</p></div><small>closetiq · editorial styling studio</small></div>
  </aside>;
}

function WardrobePage({ garments, loading, onSave, onEdit, onDelete, editing }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const filtered = useMemo(() => garments.filter((item) => `${item.name} ${item.color} ${item.style}`.toLowerCase().includes(query.toLowerCase()) && (category === "all" || item.category === category)), [garments, query, category]);
  const formVisible = showForm || Boolean(editing);
  return <section className="page">
    <PageIntro eyebrow="the collection" title={<>Your wardrobe<span className="heading-dot">.</span></>} description="A considered archive of the pieces already in your life.">
      <button className="button dark" type="button" onClick={() => setShowForm((value) => !value)}>{formVisible ? "Close ×" : "+ Add a piece"}</button>
    </PageIntro>
    <div className="stats-grid"><Stat label="total pieces" value={garments.length} foot="in your closet" /><Stat label="tops" value={garments.filter((x) => x.category === "top").length} foot="ready to style" /><Stat label="bottoms" value={garments.filter((x) => x.category === "bottom").length} foot="easy combinations" /><Stat label="shoes" value={garments.filter((x) => x.category === "shoes").length} foot="the finishing layer" highlight /></div>
    {formVisible && <GarmentForm initial={editing || EMPTY_FORM} editing={Boolean(editing)} onCancel={() => { setShowForm(false); onEdit(null); }} onSave={async (values) => { await onSave(values); setShowForm(false); }} />}
    <div className="toolbar"><label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pieces, colors, styles" aria-label="Search wardrobe" /></label><div className="filter-list" aria-label="Filter by category">{["all", ...CATEGORIES].map((item) => <button type="button" key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
    {loading ? <LoadingState /> : filtered.length ? <div className="garment-grid">{filtered.map((garment) => <GarmentCard key={garment._id} garment={garment} onEdit={() => onEdit(garment)} onDelete={() => onDelete(garment._id)} />)}</div> : <EmptyState title={garments.length ? "No pieces match that filter" : "Your wardrobe is waiting"} text={garments.length ? "Try a different search or category." : "Add your first piece to start building looks from what you own."} action={!garments.length ? () => setShowForm(true) : null} />}
  </section>;
}

function PageIntro({ eyebrow, title, description, children }) { return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{children}</div>; }
function Stat({ label, value, foot, highlight }) { return <div className={`stat-card ${highlight ? "highlight" : ""}`}><span>{label}</span><strong>{String(value).padStart(2, "0")}</strong><small>{foot}</small></div>; }

function GarmentForm({ initial, editing, onCancel, onSave }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const [preview, setPreview] = useState(initial.imageUrl || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  function update(key, value) { setForm((current) => ({ ...current, [key]: value })); }
  function toggleOccasion(value) { update("occasions", form.occasions.includes(value) ? form.occasions.filter((item) => item !== value) : [...form.occasions, value]); }
  function filePreview(event) {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = () => { setPreview(reader.result); update("imageUrl", reader.result); }; reader.readAsDataURL(file);
  }
  async function submit(event) {
    event.preventDefault(); if (!form.name.trim() || !form.color.trim()) { setError("Name and color are required."); return; }
    setSaving(true); setError("");
    try { await onSave({ ...form, name: form.name.trim(), color: form.color.trim() }); } catch (saveError) { setError(saveError.message); } finally { setSaving(false); }
  }
  return <form className="form-panel" onSubmit={submit}><div className="form-title"><div><span className="eyebrow">{editing ? "edit piece" : "new addition"}</span><h2>{editing ? "Refine this piece" : "Add to your collection"}</h2></div><span className="required-note">* required</span></div>
    <div className="form-layout"><div className="image-uploader"><div className="upload-preview" style={preview ? { backgroundImage: `url("${preview}")` } : {}}>{!preview && <><span>＋</span><small>Preview</small></>}</div><label className="upload-button">Upload image<input type="file" accept="image/*" onChange={filePreview} /></label></div>
      <div className="form-grid"><label>Piece name *<input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. espresso knit tee" maxLength={100} /></label><label>Category *<select value={form.category} onChange={(e) => update("category", e.target.value)}>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label><label>Color *<input required list="closet-colors" value={form.color} onChange={(e) => update("color", e.target.value)} placeholder="e.g. mocha" maxLength={40} /><datalist id="closet-colors">{COLORS.map((color) => <option key={color} value={color} />)}</datalist></label><label>Style<select value={form.style} onChange={(e) => update("style", e.target.value)}>{STYLES.map((item) => <option key={item}>{item}</option>)}</select></label><fieldset className="full"><legend>Works for</legend><div className="chips">{OCCASIONS.map((item) => <label key={item} className={form.occasions.includes(item) ? "chip checked" : "chip"}><input type="checkbox" checked={form.occasions.includes(item)} onChange={() => toggleOccasion(item)} />{item}</label>)}</div></fieldset></div></div>
    {error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="button light" onClick={onCancel}>Cancel</button><button className="button dark" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Save to wardrobe ↗"}</button></div>
  </form>;
}

function GarmentCard({ garment, onEdit, onDelete }) { return <article className="garment-card"><div className="garment-image" style={{ backgroundImage: `url("${garment.imageUrl || garmentFallback(garment)}")` }}><div className="card-actions"><button type="button" onClick={onEdit} aria-label={`Edit ${garment.name}`}>Edit</button><button type="button" onClick={onDelete} aria-label={`Delete ${garment.name}`}>Delete</button></div></div><div className="garment-info"><div><h3>{garment.name}</h3><p>{garment.color} · {garment.category}</p></div><span className="color-dot" style={{ background: garment.color }} title={garment.color} /></div></article>; }
function LoadingState() { return <div className="state-card"><div className="spinner" /><h2>Opening your wardrobe…</h2><p>Connecting to your collection.</p></div>; }
function EmptyState({ title, text, action }) { return <div className="state-card"><span className="state-symbol">✧</span><h2>{title}</h2><p>{text}</p>{action && <button type="button" className="button dark" onClick={action}>Add your first piece</button>}</div>; }

function StylePage() {
  const [context, setContext] = useState({ occasion: "casual", style: "minimal", description: "" });
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event) {
    event.preventDefault(); setLoading(true); setMessage(""); setOutfits([]);
    try { const result = await recommendOutfits(context); setOutfits(result.data || []); if (!result.data?.length) setMessage("You need at least one top, one bottom, and one pair of shoes for a complete look."); }
    catch (error) { setMessage(error.message); } finally { setLoading(false); }
  }
  return <section className="page"><PageIntro eyebrow="the daily edit" title={<>Style me<span className="heading-dot">.</span></>} description="A clear, explainable edit built only from pieces in your wardrobe." /><div className="style-layout"><form className="style-form panel" onSubmit={submit}><div className="eyebrow">set the scene</div><h2>What are you dressing for?</h2><label>Occasion<select value={context.occasion} onChange={(e) => setContext({ ...context, occasion: e.target.value })}>{OCCASIONS.map((item) => <option key={item}>{item}</option>)}</select></label><label>Style / mood<select value={context.style} onChange={(e) => setContext({ ...context, style: e.target.value })}>{STYLES.map((item) => <option key={item}>{item}</option>)}</select></label><label>Anything else? <span className="optional">optional</span><textarea value={context.description} onChange={(e) => setContext({ ...context, description: e.target.value })} placeholder="A relaxed coffee run, but still pulled together…" rows="4" /></label><button className="button dark full-button" disabled={loading}>{loading ? "Composing…" : "Compose my looks ↗"}</button></form><div className="outfit-results">{loading ? <LoadingState /> : outfits.length ? outfits.map((outfit) => <OutfitCard key={`${outfit.rank}-${outfit.title}`} outfit={outfit} />) : <div className="result-intro"><span>✦</span><h2>Your edit, in three pieces.</h2><p>Tell us the occasion and mood. ClosetIQ will score the combinations you own across occasion, style, color harmony and freshness.</p>{message && <p className="inline-message">{message}</p>}</div>}</div></div></section>;
}

function OutfitCard({ outfit }) { return <article className="outfit-card"><div className="outfit-header"><div><span className="eyebrow">look {String(outfit.rank).padStart(2, "0")}</span><h2>{outfit.title}</h2></div><strong>{outfit.score}<small>/100</small></strong></div><div className="outfit-items">{outfit.items.map((item) => <div className="outfit-item" key={item._id || item.name}><div className="outfit-image" style={{ backgroundImage: `url("${item.imageUrl || garmentFallback(item)}")` }} /><span>{item.name}</span></div>)}</div><div className="reason-list">{outfit.reasons?.map((reason) => <span key={reason}>✓ {reason}</span>)}</div></article>; }

function RecreatePage({ garments }) {
  const [image, setImage] = useState("");
  const [attributes, setAttributes] = useState({ categories: ["top", "bottom", "shoes"], colors: [] });
  const [matches, setMatches] = useState(null);
  function upload(event) { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setImage(reader.result); reader.readAsDataURL(file); }
  function toggle(key, value) { setAttributes((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] })); }
  function match() { setMatches(findClosestMatches(garments, attributes)); }
  return <section className="page"><PageIntro eyebrow="the reference desk" title={<>Recreate this look<span className="heading-dot">.</span></>} description="Bring a saved look. We’ll compare it honestly to the pieces you own." /><div className="recreate-layout"><div className="inspiration-panel panel"><div className={`inspiration-preview ${image ? "has-image" : ""}`} style={image ? { backgroundImage: `url("${image}")` } : {}}>{!image && <><span className="upload-icon">＋</span><h2>Drop in an inspiration</h2><p>Upload a screenshot or local image to keep it beside your notes.</p></>}</div><label className="button light upload-cta">Choose image<input type="file" accept="image/*" onChange={upload} /></label><p className="honesty"><strong>Note:</strong> ClosetIQ does not use computer vision. You confirm the visible categories and colors below.</p></div><div className="attribute-panel panel"><span className="eyebrow">your read of the look</span><h2>Confirm the ingredients</h2><fieldset><legend>Categories</legend><div className="chips">{CATEGORIES.map((item) => <label key={item} className={attributes.categories.includes(item) ? "chip checked" : "chip"}><input type="checkbox" checked={attributes.categories.includes(item)} onChange={() => toggle("categories", item)} />{item}</label>)}</div></fieldset><fieldset><legend>Colors you see</legend><div className="chips">{COLORS.map((item) => <label key={item} className={attributes.colors.includes(item) ? "chip checked" : "chip"}><input type="checkbox" checked={attributes.colors.includes(item)} onChange={() => toggle("colors", item)} />{item}</label>)}</div></fieldset><button type="button" className="button dark full-button" onClick={match}>Find my closest pieces ↗</button></div></div>{matches && <MatchResults result={matches} />}</section>;
}

function MatchResults({ result }) { return <div className="matches"><div className="matches-heading"><div><span className="eyebrow">the closest edit</span><h2>A combination from your closet</h2></div><span>{result.missing.length ? `${result.missing.length} category gaps` : "complete look"}</span></div>{result.missing.length > 0 && <p className="missing-note">You don’t currently have: {result.missing.join(", ")}. Here’s the closest owned version.</p>}<div className="match-grid">{result.matches.map(({ garment, score }) => <div className="match-item" key={garment._id}><div className="match-image" style={{ backgroundImage: `url("${garment.imageUrl || garmentFallback(garment)}")` }} /><div><strong>{garment.name}</strong><span>{garment.color} · {score}% fit</span></div></div>)}</div></div>; }

export default App;
