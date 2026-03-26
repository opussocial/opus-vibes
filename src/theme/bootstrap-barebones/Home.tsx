import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Database, LogOut } from "lucide-react";
import { User } from "../../types";

export const Home = ({ currentUser, onLogout }: { currentUser: User | null, onLogout: () => void }) => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/definition/types");
        const data = await res.json();
        setStats(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch stats", err);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">Personal CMS</Link>
          <div className="navbar-nav ms-auto">
            <Link className="nav-link" to="/explore">Explore</Link>
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
        <div className="p-5 mb-4 bg-white rounded-3 border shadow-sm">
          <div className="container-fluid py-5 text-center">
            <h1 className="display-4 fw-bold">Multi-Type CMS Demo</h1>
            <p className="fs-4 text-muted">Explore a flexible content management system that handles diverse data types with ease.</p>
            <Link to="/explore" className="btn btn-primary btn-lg px-5">Explore All Content</Link>
          </div>
        </div>

        <h2 className="mb-4">Content Types</h2>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row">
            {stats.map(type => (
              <div key={type.id} className="col-md-3 mb-4">
                <div className="card h-100 border-0 shadow-sm text-center p-3" style={{ borderTop: `4px solid ${type.color || '#6c757d'}` }}>
                  <div className="card-body">
                    <h5 className="card-title">{type.name}</h5>
                    <p className="card-text text-muted small">{type.description}</p>
                    <Link to={`/explore?type=${type.slug}`} className="btn btn-sm btn-link text-decoration-none">View {type.name}s</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <footer className="footer mt-auto py-3 bg-white border-top">
        <div className="container text-center">
          <span className="text-muted">© 2026 Personal CMS Demo</span>
        </div>
      </footer>
    </div>
  );
};
