import React, { useState, useEffect } from "react";
import { Element, ElementDetail, ElementType } from "../../types";
import { themeUtils } from "./utils";
import { motion } from "motion/react";
import { Database, ArrowLeft, MapPin, Package, Globe, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ElementRendererProps {
  slug: string;
  isHome?: boolean;
}

export const ElementRenderer = ({ slug, isHome = false }: ElementRendererProps) => {
  const [element, setElement] = useState<ElementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElement = async () => {
      setLoading(true);
      const data = await themeUtils.getElementBySlug(slug);
      setElement(data);
      setLoading(false);
    };
    fetchElement();
  }, [slug]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <style>{`
          .d-flex { display: flex !important; }
          .justify-content-center { justify-content: center !important; }
          .spinner-border { display: inline-block; width: 2rem; height: 2rem; vertical-align: -0.125em; border: 0.25em solid currentColor; border-right-color: transparent; border-radius: 50%; animation: .75s linear infinite spinner-border; }
          @keyframes spinner-border { to { transform: rotate(360deg); } }
          .text-primary { color: #0d6efd !important; }
          .visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0; }
        `}</style>
      </div>
    );
  }

  if (!element) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning text-center p-5 rounded shadow-sm">
          <Database size={48} className="mb-3 opacity-50" />
          <h2 className="h4">Element Not Found</h2>
          <p className="mb-4">The requested element could not be found in our database.</p>
          {!isHome && (
            <button onClick={() => navigate(-1)} className="btn btn-outline-secondary">
              Go Back
            </button>
          )}
        </div>
        <style>{`
          .alert-warning { color: #664d03; background-color: #fff3cd; border: 1px solid #ffecb5; }
          .btn-outline-secondary { color: #6c757d; border-color: #6c757d; }
          .btn-outline-secondary:hover { color: #fff; background-color: #6c757d; border-color: #6c757d; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="mb-4">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-3">
                <li className="breadcrumb-item"><span className="badge bg-primary">{element.type_name}</span></li>
                {element.status && <li className="breadcrumb-item ms-2"><span className="badge bg-secondary">{element.status}</span></li>}
              </ol>
            </nav>
            <h1 className="display-4 font-weight-bold mb-3">{element.name}</h1>
            <p className="text-muted small">
              Published on {new Date(element.created_at).toLocaleDateString()} · Last updated {new Date(element.updated_at).toLocaleDateString()}
            </p>
          </div>

          <hr className="my-5" />

          {/* Body Content */}
          {element.content && (
            <div className="mb-5">
              <div className="lead whitespace-pre-wrap">{element.content.body}</div>
            </div>
          )}

          {/* Image */}
          {element.file && element.file.url && (
            <div className="mb-5">
              <img 
                src={element.file.url} 
                alt={element.file.filename || element.name}
                className="img-fluid rounded shadow"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Product Info Card */}
          {element.product_info && (
            <div className="card mb-4 border-0 shadow-sm bg-light">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase text-muted small mb-2">Product Details</h6>
                    <p className="mb-0">SKU: <span className="font-monospace">{element.product_info.sku}</span></p>
                  </div>
                  <div className="text-end">
                    <h2 className="mb-0 text-primary">{element.product_info.currency} {element.product_info.price}</h2>
                    <span className={`badge ${element.product_info.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                      {element.product_info.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Location Card */}
          {element.place && (
            <div className="card mb-4 border-0 shadow-sm">
              <div className="card-body p-4">
                <h6 className="text-uppercase text-muted small mb-3">Location</h6>
                <div className="d-flex align-items-start gap-3">
                  <MapPin className="text-danger" size={24} />
                  <div>
                    <p className="h5 mb-1">{element.place.address}</p>
                    <p className="text-muted small mb-0">{element.place.latitude}, {element.place.longitude}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Links */}
          {element.urls_embeds && (
            <div className="mt-5">
              <h5 className="mb-3">Related Resources</h5>
              <div className="list-group">
                <a 
                  href={element.urls_embeds.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="list-group-item list-group-item-action p-4"
                >
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1 text-primary">{element.urls_embeds.title || "External Link"}</h6>
                    <Globe size={16} className="text-muted" />
                  </div>
                  <p className="mb-1 text-muted small">{element.urls_embeds.url}</p>
                </a>
              </div>
              {element.urls_embeds.embed_code && (
                <div className="mt-4 rounded border p-2 bg-light shadow-inner" dangerouslySetInnerHTML={{ __html: element.urls_embeds.embed_code }} />
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .img-fluid { max-width: 100%; height: auto; }
        .badge { display: inline-block; padding: 0.35em 0.65em; font-size: 0.75em; font-weight: 700; line-height: 1; color: #fff; text-align: center; white-space: nowrap; vertical-align: baseline; border-radius: 0.25rem; }
        .bg-primary { background-color: #0d6efd !important; }
        .bg-secondary { background-color: #6c757d !important; }
        .bg-success { background-color: #198754 !important; }
        .bg-danger { background-color: #dc3545 !important; }
        .bg-light { background-color: #f8f9fa !important; }
        .h5 { font-size: 1.25rem; font-weight: 500; }
        .h6 { font-size: 1rem; font-weight: 500; }
        .small { font-size: 0.875em; }
        .font-monospace { font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        .list-group-item-action:hover { background-color: #f8f9fa; }
      `}</style>
    </div>
  );
};
