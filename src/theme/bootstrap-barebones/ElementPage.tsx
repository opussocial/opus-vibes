import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { User, Element } from "../../types";

export const ElementPage = ({ currentUser, onLogout }: { currentUser: User | null, onLogout: () => void }) => {
  const { slug } = useParams();
  const [element, setElement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElement = async () => {
      try {
        const res = await fetch(`/api/elements/${slug}`);
        const data = await res.json();
        setElement(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch element", err);
        setLoading(false);
      }
    };
    fetchElement();
  }, [slug]);

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
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : element ? (
          <article className="bg-white p-5 rounded-3 shadow-sm border">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <h1 className="display-4 mb-0">{element.name}</h1>
              <span className="badge bg-primary fs-5">{element.type_name}</span>
            </div>

            <div className="row g-4">
              <div className="col-lg-8">
                {element.content?.body && (
                  <div className="mb-5">
                    <h3 className="h5 border-bottom pb-2 mb-3">Content</h3>
                    <div className="fs-5" dangerouslySetInnerHTML={{ __html: element.content.body.replace(/\n/g, '<br/>') }} />
                  </div>
                )}

                {element.file?.url && (
                  <div className="mb-5">
                    <h3 className="h5 border-bottom pb-2 mb-3">Media</h3>
                    {element.file.mime_type?.startsWith('image/') ? (
                      <img src={element.file.url} alt={element.name} className="img-fluid rounded shadow-sm" referrerPolicy="no-referrer" />
                    ) : (
                      <a href={element.file.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary">
                        Download {element.file.filename}
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="col-lg-4">
                <div className="card border-0 bg-light p-4 rounded-3">
                  <h3 className="h5 border-bottom pb-2 mb-3">Properties</h3>
                  
                  {element.place?.address && (
                    <div className="mb-3">
                      <label className="text-muted small fw-bold text-uppercase">Location</label>
                      <p className="mb-0">{element.place.address}</p>
                      {element.place.latitude && (
                        <p className="small text-muted mb-0">{element.place.latitude}, {element.place.longitude}</p>
                      )}
                    </div>
                  )}

                  {element.product_info?.sku && (
                    <div className="mb-3">
                      <label className="text-muted small fw-bold text-uppercase">Product Info</label>
                      <p className="mb-0"><strong>SKU:</strong> {element.product_info.sku}</p>
                      <p className="mb-0"><strong>Price:</strong> {element.product_info.currency} {element.product_info.price}</p>
                      <p className="mb-0"><strong>Stock:</strong> {element.product_info.stock}</p>
                    </div>
                  )}

                  {element.color?.hex && (
                    <div className="mb-3">
                      <label className="text-muted small fw-bold text-uppercase">Color</label>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle me-2" style={{ width: '20px', height: '20px', backgroundColor: element.color.hex, border: '1px solid #ccc' }}></div>
                        <span>{element.color.hex}</span>
                      </div>
                    </div>
                  )}

                  {element.urls_embeds?.url && (
                    <div className="mb-3">
                      <label className="text-muted small fw-bold text-uppercase">External Link</label>
                      <p className="mb-0">
                        <a href={element.urls_embeds.url} target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none">
                          {element.urls_embeds.title || element.urls_embeds.url}
                        </a>
                      </p>
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="text-muted small fw-bold text-uppercase">Metadata</label>
                    <p className="small text-muted mb-0">Slug: {element.slug}</p>
                    <p className="small text-muted mb-0">Created: {new Date(element.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-top">
              <Link to="/explore" className="btn btn-outline-secondary">← Back to Explorer</Link>
            </div>
          </article>
        ) : (
          <div className="alert alert-danger">Element not found.</div>
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
