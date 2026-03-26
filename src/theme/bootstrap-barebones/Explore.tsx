import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, Element, ElementType } from "../../types";

export const Explore = ({ currentUser, onLogout }: { currentUser: User | null, onLogout: () => void }) => {
  const [elements, setElements] = useState<Element[]>([]);
  const [types, setTypes] = useState<ElementType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [elRes, typeRes] = await Promise.all([
          fetch("/api/elements"),
          fetch("/api/definition/types")
        ]);
        const elData = await elRes.json();
        const typeData = await typeRes.json();
        setElements(elData);
        setTypes(typeData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredElements = selectedType === "all" 
    ? elements 
    : elements.filter(e => e.type_slug === selectedType);

  return (
    <div className="min-h-screen bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">Personal CMS</Link>
          <div className="navbar-nav ms-auto">
            <Link className="nav-link active" to="/explore">Explore</Link>
            {currentUser ? (
              <>
                <Link className="nav-link" to="/admin">Admin</Link>
                <button className="btn btn-link nav-link" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <Link className="nav-link" to="/admin">Login</Link>
            )}
          </div>
        </div>
      </nav>

      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Content Explorer</h1>
          <div className="d-flex align-items-center">
            <label className="me-2 fw-bold">Filter by Type:</label>
            <select 
              className="form-select" 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              {types.map(t => (
                <option key={t.id} value={t.slug}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredElements.length > 0 ? (
          <div className="row">
            {filteredElements.map(el => (
              <div key={el.id} className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm border">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title mb-0">{el.name}</h5>
                      <span className="badge bg-info text-dark">{el.type_name}</span>
                    </div>
                    <p className="card-text text-muted small">
                      Slug: {el.slug}
                    </p>
                    <Link to={`/e/${el.slug}`} className="btn btn-sm btn-outline-primary">View Details</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="alert alert-info">No elements found for this type.</div>
        )}
      </div>
      
      <footer className="footer mt-auto py-3 bg-white border-top">
        <div className="container text-center">
          <span className="text-muted">© 2026 Personal CMS</span>
        </div>
      </footer>
    </div>
  );
};
