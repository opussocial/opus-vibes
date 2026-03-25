import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Database, Calendar, Tag, Share2, MoreHorizontal, ChevronRight } from "lucide-react";
import { ElementDetail, User } from "../../types";
import { themeUtils } from "./utils";

export const ElementPage = ({ currentUser, onLogout }: { currentUser: User | null, onLogout: () => void }) => {
  const { slug } = useParams<{ slug: string }>();
  const [element, setElement] = useState<ElementDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!slug) return;
      setLoading(true);
      const data = await themeUtils.getElementBySlug(slug);
      setElement(data);
      setLoading(false);
    };
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <style>{`
          .spinner-border {
            display: inline-block;
            width: 2rem;
            height: 2rem;
            vertical-align: -0.125em;
            border: 0.25em solid currentColor;
            border-right-color: transparent;
            border-radius: 50%;
            animation: 0.75s linear infinite spinner-border;
          }
          @keyframes spinner-border {
            to { transform: rotate(360deg); }
          }
          .text-primary { color: #0d6efd !important; }
          .visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0; }
        `}</style>
      </div>
    );
  }

  if (!element) {
    return (
      <div className="container py-5 text-center">
        <h1 className="display-4">404 - Not Found</h1>
        <p className="lead">The element you are looking for does not exist.</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
        <style>{`
          .display-4 { font-size: 3.5rem; font-weight: 300; line-height: 1.2; }
          .lead { font-size: 1.25rem; font-weight: 300; }
          .btn { display: inline-block; font-weight: 400; line-height: 1.5; color: #212529; text-align: center; text-decoration: none; vertical-align: middle; cursor: pointer; user-select: none; background-color: transparent; border: 1px solid transparent; padding: 0.375rem 0.75rem; font-size: 1rem; border-radius: 0.25rem; transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; }
          .btn-primary { color: #fff; background-color: #0d6efd; border-color: #0d6efd; }
          .btn-primary:hover { background-color: #0b5ed7; border-color: #0a58ca; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Bootstrap Navbar */}
      <nav className="navbar navbar-dark bg-dark shadow-sm py-2">
        <div className="container">
          <Link to="/" className="navbar-brand flex items-center gap-2 text-white text-xl font-medium">
            <Database size={24} className="text-primary" />
            Bootstrap Catalog
          </Link>
        </div>
        <style>{`
          .navbar { position: relative; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; padding-top: 0.5rem; padding-bottom: 0.5rem; }
          .bg-dark { background-color: #212529 !important; }
          .navbar-brand { padding-top: 0.3125rem; padding-bottom: 0.3125rem; margin-right: 1rem; font-size: 1.25rem; text-decoration: none; white-space: nowrap; }
          .text-primary { color: #0d6efd !important; }
        `}</style>
      </nav>

      <div className="container py-5">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb flex list-none p-0 text-sm">
            <li className="breadcrumb-item"><Link to="/" className="text-primary hover:underline">Home</Link></li>
            <li className="breadcrumb-item px-2 text-secondary">/</li>
            <li className="breadcrumb-item active text-secondary" aria-current="page">{element.name}</li>
          </ol>
          <style>{`
            .text-secondary { color: #6c757d !important; }
          `}</style>
        </nav>

        <div className="row flex flex-col md:flex-row gap-8">
          <div className="col-md-8 flex-1">
            <h1 className="display-5 mb-3">{element.name}</h1>
            <p className="lead text-secondary mb-4">
              Detailed view for the {element.type_name.toLowerCase()} element.
            </p>
            
            <div className="card mb-4 shadow-sm border border-zinc-200 rounded">
              <div className="card-header bg-light border-b border-zinc-200 p-3 font-medium">
                Properties
              </div>
              <div className="card-body p-4">
                <div className="row grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {element.properties.map(prop => (
                    <div key={prop.id} className="mb-3">
                      <label className="form-label text-xs font-bold text-secondary uppercase block mb-1">{prop.key}</label>
                      <div className="form-control-plaintext text-lg">{prop.value || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {element.children.length > 0 && (
              <div className="list-group shadow-sm border border-zinc-200 rounded overflow-hidden">
                <div className="list-group-item bg-light border-b border-zinc-200 p-3 font-medium">
                  Sub-elements
                </div>
                {element.children.map(child => (
                  <Link 
                    key={child.id} 
                    to={`/e/${child.slug}`}
                    className="list-group-item list-group-item-action p-3 border-b border-zinc-100 flex items-center justify-between hover:bg-light transition-colors text-decoration-none text-dark"
                  >
                    <div>
                      <h6 className="mb-0 font-medium">{child.name}</h6>
                      <small className="text-secondary">{child.type_name}</small>
                    </div>
                    <ChevronRight size={18} className="text-secondary" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="col-md-4 w-full md:w-80">
            <div className="card shadow-sm border border-zinc-200 rounded mb-4">
              <div className="card-body p-4">
                <h5 className="card-title mb-3">Information</h5>
                <ul className="list-unstyled text-sm space-y-2">
                  <li className="flex justify-between border-b border-zinc-100 pb-2">
                    <span className="text-secondary">Type:</span>
                    <span className="font-medium">{element.type_name}</span>
                  </li>
                  <li className="flex justify-between border-b border-zinc-100 pb-2">
                    <span className="text-secondary">Created:</span>
                    <span className="font-medium">{new Date(element.created_at).toLocaleDateString()}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-secondary">ID:</span>
                    <span className="font-mono text-xs">{element.id}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="d-grid gap-2 flex flex-col gap-2">
              <button className="btn btn-primary w-full">Export Data</button>
              <button className="btn btn-outline-secondary w-full border border-secondary text-secondary hover:bg-secondary hover:text-white transition-all">Print View</button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .container { width: 100%; padding-right: 0.75rem; padding-left: 0.75rem; margin-right: auto; margin-left: auto; }
        @media (min-width: 576px) { .container { max-width: 540px; } }
        @media (min-width: 768px) { .container { max-width: 720px; } }
        @media (min-width: 992px) { .container { max-width: 960px; } }
        @media (min-width: 1200px) { .container { max-width: 1140px; } }
        .display-5 { font-size: 3rem; font-weight: 300; line-height: 1.2; }
        .card { position: relative; display: flex; flex-direction: column; min-width: 0; word-wrap: break-word; background-color: #fff; background-clip: border-box; }
        .bg-light { background-color: #f8f9fa !important; }
        .text-dark { color: #212529 !important; }
        .text-decoration-none { text-decoration: none !important; }
        .list-group-item-action { width: 100%; color: #495057; text-align: inherit; }
        .list-group-item-action:hover { z-index: 1; color: #495057; text-decoration: none; background-color: #f8f9fa; }
      `}</style>
    </div>
  );
};
