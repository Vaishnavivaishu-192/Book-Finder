import React, { useState, useEffect, useRef } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [numFound, setNumFound] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const id = setTimeout(() => {
      if (query.trim()) {
        setPage(1);
        fetchBooks(query, 1);
      } else {
        setResults([]);
        setNumFound(0);
      }
    }, 450);
    return () => clearTimeout(id);
  }, [query]);

  async function fetchBooks(q, pageNumber = 1) {
    setLoading(true);
    setError(null);
    try {
      const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(
        q
      )}&page=${pageNumber}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network error: " + res.status);
      const data = await res.json();
      setNumFound(data.numFound || 0);
      setResults(data.docs || []);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setPage(1);
    fetchBooks(query, 1);
  }

  function handleNextPrev(delta) {
    const next = page + delta;
    if (next < 1) return;
    setPage(next);
    fetchBooks(query, next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function coverUrl(doc) {
    if (doc && doc.cover_i)
      return `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
    return "https://via.placeholder.com/150x220?text=No+Cover";
  }

  return (
    <div style={{ maxWidth: 980, margin: "28px auto", padding: 18 }}>
      <header>
        <h1>🔎 Book Finder</h1>
        <p style={{ color: "#666" }}>Search books using the Book Finder</p>
      </header>

      <main>
        <form
          onSubmit={handleSearch}
          style={{ display: "flex", gap: 8, marginBottom: 12 }}
        >
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by book title..."
            aria-label="Search books by title"
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ddd",
            }}
          />
          <button
            type="submit"
            style={{ padding: "10px 14px", borderRadius: 8 }}
          >
            Search
          </button>
        </form>

        <div>
          {loading && <div style={{ color: "#666" }}>Loading…</div>}
          {error && <div style={{ color: "#b00020" }}>{error}</div>}
          {!loading && !error && numFound > 0 && (
            <div style={{ color: "#666" }}>
              Found {numFound} results — page {page}
            </div>
          )}
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
            gap: 12,
            marginTop: 12,
          }}
        >
          {results.map((doc) => (
            <article
              key={doc.key}
              style={{
                background: "#fff",
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(10,10,20,0.04)",
              }}
            >
              <a
                href={`https://openlibrary.org${doc.key}`}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={coverUrl(doc)}
                  alt={`${doc.title} cover`}
                  style={{ width: "100%", height: 300, objectFit: "cover" }}
                />
              </a>
              <div style={{ padding: 10 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>{doc.title}</h3>
                {doc.author_name && (
                  <p style={{ color: "#666" }}>
                    by {doc.author_name.join(", ")}
                  </p>
                )}
                {doc.first_publish_year && (
                  <p style={{ color: "#666" }}>
                    First published: {doc.first_publish_year}
                  </p>
                )}
                <a
                  href={`https://openlibrary.org${doc.key}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#2563eb" }}
                >
                  Open on Open Library →
                </a>
              </div>
            </article>
          ))}
        </section>

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginTop: 18,
          }}
        >
          <button
            onClick={() => handleNextPrev(-1)}
            disabled={page === 1 || loading}
          >
            Prev
          </button>
          <button
            onClick={() => handleNextPrev(1)}
            disabled={loading || results.length === 0}
          >
            Next
          </button>
        </div>

        {!loading && !error && results.length === 0 && query.trim() && (
          <div style={{ color: "#666", marginTop: 12 }}>
            No results found for "{query}"
          </div>
        )}
      </main>
    </div>
  );
}
