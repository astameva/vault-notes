import { useState, useRef, useEffect, useCallback } from "react";

const COLORS = {
  bg: "#1a1a1f",
  surface: "#222228",
  surfaceHover: "#2a2a32",
  surfaceActive: "#32323c",
  border: "#3a3a44",
  borderLight: "#4a4a56",
  text: "#e8e6e3",
  textMuted: "#9a9790",
  textDim: "#6a6860",
  accent: "#f0c674",
  accentDim: "#c4a35a",
  danger: "#e06c60",
  success: "#a3be8c",
  tagBg: "#2d2d36",
};

const FONTS = {
  display: "'Playfair Display', Georgia, serif",
  body: "'DM Sans', 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

const STORAGE_KEY = "vault-notes-data";

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [
    {
      id: "welcome",
      title: "Welcome to Vault Notes",
      content:
        "Your notes never leave this device. Everything is stored in your browser's local storage — no servers, no cloud, no tracking.\n\nYour notes persist between visits automatically. Use the export button to back them up as a JSON file, and import them on any other device.\n\nTry creating your first note!",
      tags: ["getting-started"],
      pinned: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];
}

function saveNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {}
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDate(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/* ── Icons ── */

function ShieldIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function SearchIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function PlusIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrashIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    </svg>
  );
}

function DownloadIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

function UploadIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  );
}

function TagIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <circle cx="7" cy="7" r="1" />
    </svg>
  );
}

function PinIcon({ size = 14, filled = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 17v5M9 2h6l-1 7h4l-6 8h-4l2-8H6z" />
    </svg>
  );
}

function MenuIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  );
}

function ClearIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

/* ── Main App ── */

export default function App() {
  const [notes, setNotes] = useState(loadNotes);
  const [activeId, setActiveId] = useState(() => {
    const loaded = loadNotes();
    return loaded.length > 0 ? loaded[0].id : null;
  });
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const titleRef = useRef(null);
  const fileInputRef = useRef(null);

  // Persist to localStorage whenever notes change
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Responsive sidebar
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 700px)");
    if (mq.matches) setSidebarOpen(false);
    const handler = (e) => { if (e.matches) setSidebarOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const activeNote = notes.find((n) => n.id === activeId);
  const allTags = [...new Set(notes.flatMap((n) => n.tags))].sort();

  const filteredNotes = notes
    .filter((n) => {
      const q = search.toLowerCase();
      const matchSearch = !search || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some((t) => t.includes(q));
      const matchTag = !filterTag || n.tags.includes(filterTag);
      return matchSearch && matchTag;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt - a.updatedAt;
    });

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function createNote() {
    const note = {
      id: generateId(),
      title: "",
      content: "",
      tags: [],
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [note, ...prev]);
    setActiveId(note.id);
    setSearch("");
    setFilterTag(null);
    setTimeout(() => titleRef.current?.focus(), 50);
    // Close sidebar on mobile
    if (window.innerWidth <= 700) setSidebarOpen(false);
  }

  function updateNote(id, updates) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n)));
  }

  function deleteNote(id) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeId === id) {
      const remaining = notes.filter((n) => n.id !== id);
      setActiveId(remaining.length > 0 ? remaining[0].id : null);
    }
    setConfirmDelete(null);
    showToast("Note deleted");
  }

  function togglePin(id) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  }

  function addTag(noteId) {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && activeNote && !activeNote.tags.includes(tag)) {
      updateNote(noteId, { tags: [...activeNote.tags, tag] });
    }
    setTagInput("");
    setShowTagInput(false);
  }

  function removeTag(noteId, tag) {
    const note = notes.find((n) => n.id === noteId);
    if (note) updateNote(noteId, { tags: note.tags.filter((t) => t !== tag) });
  }

  function exportNotes() {
    const data = JSON.stringify(notes, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vault-notes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Notes exported to file");
  }

  function importNotes(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (Array.isArray(imported) && imported.length > 0) {
          setNotes(imported);
          setActiveId(imported[0]?.id || null);
          showToast(`Imported ${imported.length} notes`);
        } else {
          showToast("No valid notes found in file");
        }
      } catch {
        showToast("Invalid file format");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function clearAllData() {
    if (window.confirm("This will permanently delete all notes. Are you sure?")) {
      localStorage.removeItem(STORAGE_KEY);
      const fresh = loadNotes();
      setNotes(fresh);
      setActiveId(fresh[0]?.id || null);
      showToast("All notes cleared");
    }
  }

  function selectNote(id) {
    setActiveId(id);
    if (window.innerWidth <= 700) setSidebarOpen(false);
  }

  const wordCount = activeNote ? activeNote.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const storageUsed = (() => {
    try {
      const bytes = new Blob([localStorage.getItem(STORAGE_KEY) || ""]).size;
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / 1048576).toFixed(1)} MB`;
    } catch { return "—"; }
  })();

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: FONTS.body, background: COLORS.bg, color: COLORS.text, overflow: "hidden", position: "relative" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 1000,
          background: COLORS.surfaceActive, color: COLORS.text, padding: "10px 24px",
          borderRadius: 8, fontSize: 13, fontWeight: 500, border: `1px solid ${COLORS.border}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "fadeIn 0.3s ease",
        }}>
          {toast}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999,
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setConfirmDelete(null)}>
          <div
            style={{
              background: COLORS.surface, borderRadius: 12, padding: "24px 28px",
              border: `1px solid ${COLORS.border}`, maxWidth: 360, width: "90%",
              boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Delete this note?</p>
            <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  background: COLORS.bg, color: COLORS.textMuted, border: `1px solid ${COLORS.border}`,
                  borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: FONTS.body,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteNote(confirmDelete)}
                style={{
                  background: COLORS.danger, color: "#fff", border: "none",
                  borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: FONTS.body, fontWeight: 500,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && window.innerWidth <= 700 && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 49 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 300 : 0, minWidth: sidebarOpen ? 300 : 0,
        background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`,
        display: "flex", flexDirection: "column", transition: "all 0.25s ease",
        overflow: "hidden", position: window.innerWidth <= 700 ? "fixed" : "relative",
        height: "100%", zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 12px", borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShieldIcon size={22} />
              <span style={{ fontFamily: FONTS.display, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: COLORS.accent }}>
                Vault Notes
              </span>
            </div>
            {window.innerWidth <= 700 && (
              <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", padding: 4 }}>
                <ClearIcon size={18} />
              </button>
            )}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6, background: COLORS.bg,
            borderRadius: 8, padding: "8px 12px", border: `1px solid ${COLORS.border}`,
          }}>
            <SearchIcon size={14} />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              style={{
                background: "none", border: "none", outline: "none", color: COLORS.text,
                fontFamily: FONTS.body, fontSize: 13, width: "100%",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: COLORS.textDim, cursor: "pointer", padding: 0, display: "flex" }}>
                <ClearIcon size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div style={{ padding: "10px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", flexWrap: "wrap", gap: 4 }}>
            {filterTag && (
              <button onClick={() => setFilterTag(null)} style={{
                background: COLORS.danger + "22", color: COLORS.danger, border: "none",
                borderRadius: 4, padding: "2px 8px", fontSize: 11, cursor: "pointer", fontFamily: FONTS.body,
              }}>
                ✕ clear
              </button>
            )}
            {allTags.map((tag) => (
              <button
                key={tag} onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                style={{
                  background: filterTag === tag ? COLORS.accent + "33" : COLORS.tagBg,
                  color: filterTag === tag ? COLORS.accent : COLORS.textMuted,
                  border: filterTag === tag ? `1px solid ${COLORS.accent}44` : "1px solid transparent",
                  borderRadius: 4, padding: "2px 8px", fontSize: 11, cursor: "pointer", fontFamily: FONTS.body,
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* New note */}
        <div style={{ padding: "12px 20px" }}>
          <button
            onClick={createNote}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDim})`,
              color: COLORS.bg, border: "none", borderRadius: 8, padding: "10px 16px",
              fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONTS.body,
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 4px 16px ${COLORS.accent}44`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <PlusIcon size={15} /> New Note
          </button>
        </div>

        {/* Notes list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
          {filteredNotes.length === 0 && (
            <div style={{ padding: 20, textAlign: "center", color: COLORS.textDim, fontSize: 13 }}>
              {search ? "No notes match your search" : "No notes yet"}
            </div>
          )}
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => selectNote(note.id)}
              style={{
                padding: "12px 14px", marginBottom: 4, borderRadius: 8, cursor: "pointer",
                background: activeId === note.id ? COLORS.surfaceActive : "transparent",
                border: `1px solid ${activeId === note.id ? COLORS.borderLight : "transparent"}`,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { if (activeId !== note.id) e.currentTarget.style.background = COLORS.surfaceHover; }}
              onMouseLeave={(e) => { if (activeId !== note.id) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500, color: COLORS.text,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    {note.pinned && <span style={{ color: COLORS.accent, fontSize: 10 }}>📌</span>}
                    {note.title || "Untitled"}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {note.content.slice(0, 60) || "Empty note"}
                  </div>
                </div>
                <span style={{ fontSize: 10, color: COLORS.textDim, whiteSpace: "nowrap", marginTop: 2 }}>
                  {formatDate(note.updatedAt)}
                </span>
              </div>
              {note.tags.length > 0 && (
                <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                  {note.tags.slice(0, 3).map((t) => (
                    <span key={t} style={{ fontSize: 10, color: COLORS.textDim, background: COLORS.tagBg, padding: "1px 6px", borderRadius: 3 }}>#{t}</span>
                  ))}
                  {note.tags.length > 3 && <span style={{ fontSize: 10, color: COLORS.textDim }}>+{note.tags.length - 3}</span>}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 8 }}>
          <button onClick={exportNotes} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: COLORS.bg, color: COLORS.textMuted, border: `1px solid ${COLORS.border}`,
            borderRadius: 6, padding: "8px 10px", fontSize: 11, cursor: "pointer", fontFamily: FONTS.body,
          }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = COLORS.accent)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = COLORS.border)}
          >
            <DownloadIcon /> Export
          </button>
          <button onClick={() => fileInputRef.current?.click()} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: COLORS.bg, color: COLORS.textMuted, border: `1px solid ${COLORS.border}`,
            borderRadius: 6, padding: "8px 10px", fontSize: 11, cursor: "pointer", fontFamily: FONTS.body,
          }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = COLORS.accent)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = COLORS.border)}
          >
            <UploadIcon /> Import
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={importNotes} style={{ display: "none" }} />
        </div>

        {/* Privacy badge */}
        <div style={{ padding: "8px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", color: COLORS.textDim, fontSize: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ShieldIcon size={12} />
            <span>Stored locally · {storageUsed}</span>
          </div>
          <button
            onClick={clearAllData}
            style={{ background: "none", border: "none", color: COLORS.textDim, fontSize: 10, cursor: "pointer", fontFamily: FONTS.body, textDecoration: "underline" }}
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Main editor */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 24px", borderBottom: `1px solid ${COLORS.border}`, minHeight: 52,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", padding: "4px 8px", borderRadius: 4, display: "flex" }}
          >
            <MenuIcon />
          </button>
          <div style={{ fontSize: 11, color: COLORS.textDim, fontFamily: FONTS.mono }}>
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </div>
          {activeNote && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                onClick={() => togglePin(activeNote.id)}
                title={activeNote.pinned ? "Unpin" : "Pin"}
                style={{
                  background: "none", border: "none", color: activeNote.pinned ? COLORS.accent : COLORS.textDim,
                  cursor: "pointer", padding: "6px 8px", borderRadius: 4, display: "flex", alignItems: "center",
                }}
              >
                <PinIcon filled={activeNote.pinned} />
              </button>
              <button
                onClick={() => setConfirmDelete(activeNote.id)}
                title="Delete note"
                style={{
                  background: "none", border: "none", color: COLORS.textDim,
                  cursor: "pointer", padding: "6px 8px", borderRadius: 4, display: "flex", alignItems: "center",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.danger)}
                onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.textDim)}
              >
                <TrashIcon />
              </button>
            </div>
          )}
        </div>

        {/* Editor */}
        {activeNote ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "28px 48px 0" }}>
              <input
                ref={titleRef}
                value={activeNote.title}
                onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                placeholder="Untitled"
                style={{
                  background: "none", border: "none", outline: "none", color: COLORS.text,
                  fontFamily: FONTS.display, fontSize: 28, fontWeight: 700, width: "100%",
                  letterSpacing: "-0.02em", lineHeight: 1.2,
                }}
              />
              {/* Tags */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                {activeNote.tags.map((tag) => (
                  <span key={tag} style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: COLORS.tagBg, color: COLORS.textMuted, padding: "3px 10px",
                    borderRadius: 4, fontSize: 12, fontFamily: FONTS.body,
                  }}>
                    <TagIcon size={10} />
                    {tag}
                    <span
                      onClick={() => removeTag(activeNote.id, tag)}
                      style={{ cursor: "pointer", marginLeft: 2, color: COLORS.textDim, fontSize: 10 }}
                    >✕</span>
                  </span>
                ))}
                {showTagInput ? (
                  <input
                    autoFocus value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addTag(activeNote.id); if (e.key === "Escape") { setShowTagInput(false); setTagInput(""); } }}
                    onBlur={() => { if (tagInput.trim()) addTag(activeNote.id); else setShowTagInput(false); }}
                    placeholder="tag name"
                    style={{
                      background: COLORS.tagBg, border: `1px solid ${COLORS.borderLight}`, borderRadius: 4,
                      padding: "3px 8px", fontSize: 12, color: COLORS.text, outline: "none",
                      fontFamily: FONTS.body, width: 90,
                    }}
                  />
                ) : (
                  <button
                    onClick={() => setShowTagInput(true)}
                    style={{
                      background: "none", border: `1px dashed ${COLORS.border}`, borderRadius: 4,
                      color: COLORS.textDim, padding: "3px 8px", fontSize: 11, cursor: "pointer",
                      fontFamily: FONTS.body, display: "flex", alignItems: "center", gap: 4,
                    }}
                  >
                    <PlusIcon size={10} /> tag
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={activeNote.content}
              onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
              placeholder="Start writing..."
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: COLORS.text, fontFamily: FONTS.body, fontSize: 15,
                lineHeight: 1.75, padding: "20px 48px 40px", resize: "none",
                letterSpacing: "0.01em",
              }}
            />

            {/* Status bar */}
            <div style={{
              padding: "8px 48px", borderTop: `1px solid ${COLORS.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              color: COLORS.textDim, fontSize: 11, fontFamily: FONTS.mono,
            }}>
              <span>{wordCount} {wordCount === 1 ? "word" : "words"} · {activeNote.content.length} chars</span>
              <span>{formatDate(activeNote.updatedAt)}</span>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: COLORS.textDim }}>
            <ShieldIcon size={48} />
            <p style={{ fontFamily: FONTS.display, fontSize: 20, marginTop: 16, color: COLORS.textMuted }}>No note selected</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Create a new note or select one from the sidebar</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
        ::placeholder { color: ${COLORS.textDim}; }
        textarea::placeholder { color: ${COLORS.textDim}; }
        @media (max-width: 700px) {
          textarea, .editor-title { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>
    </div>
  );
}
