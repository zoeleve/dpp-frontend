import { useState, useEffect, useCallback } from 'react';
import { getDPPs, getDPPStats, exportDPP, exportDPPPdf, deleteDPP, getCurrentUser, publishDPP, unpublishDPP, getDPPGraph, getDPP } from '../services/api';
import { FileDown, Search, Trash2, FileText, Globe, EyeOff, File, Plus, X, Network, ChevronLeft, ChevronRight, Edit, Info, FileText as FileIcon, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ForceGraph2D from 'react-force-graph-2d';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || '';

const SearchModeToggle = ({ mode, setMode }) => {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', backgroundColor: '#e5e7eb', borderRadius: '8px', padding: '4px' }}>
      <button
        onClick={() => setMode('simple')}
        style={{
          flex: 1,
          padding: '8px 12px',
          backgroundColor: mode === 'simple' ? 'white' : 'transparent',
          color: mode === 'simple' ? '#1f2937' : '#6b7280',
          border: 'none',
          borderRadius: '6px',
          fontWeight: '600',
          boxShadow: mode === 'simple' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
        }}
      >
        {t('simple')}
      </button>
      <button
        onClick={() => setMode('advanced')}
        style={{
          flex: 1,
          padding: '8px 12px',
          backgroundColor: mode === 'advanced' ? 'white' : 'transparent',
          color: mode === 'advanced' ? '#1f2937' : '#6b7280',
          border: 'none',
          borderRadius: '6px',
          fontWeight: '600',
          boxShadow: mode === 'advanced' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
        }}
      >
        {t('advanced')}
      </button>
    </div>
  );
};

const AdvancedSearch = ({ criteria, setCriteria, onSearch }) => {
  const { t } = useTranslation();

  const addCriteria = () => {
    setCriteria([...criteria, { field_key: '', field_value: '', comparison_operator: null, match_type: 'partial' }]);
  };

  const updateCriteria = (index, field, value) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    setCriteria(updated);
  };

  const removeCriteria = (index) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {criteria.map((c, index) => (
        <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Field Key (e.g. manufacturer)"
            value={c.field_key}
            onChange={(e) => updateCriteria(index, 'field_key', e.target.value)}
          />
          <select
            value={c.comparison_operator || ''}
            onChange={(e) => updateCriteria(index, 'comparison_operator', e.target.value || null)}
          >
            <option value="">Contains (Text)</option>
            <option value="eq">Equals (=)</option>
            <option value="gt">Greater Than (&gt;)</option>
            <option value="lt">Less Than (&lt;)</option>
          </select>
          <input
            type="text"
            placeholder="Value"
            value={c.field_value}
            onChange={(e) => updateCriteria(index, 'field_value', e.target.value)}
          />
          <button onClick={() => removeCriteria(index)} className="btn-danger" style={{ padding: '8px' }}>
            <X size={16} />
          </button>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={addCriteria} className="btn-secondary">
          <Plus size={16} /> Add Filter
        </button>
        <button onClick={onSearch} className="btn-primary">
          <Search size={16} /> {t('advanced_search')}
        </button>
      </div>
    </div>
  );
};

const GraphModal = ({ dppId, onClose }) => {
    const [graphData, setGraphData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getDPPGraph(dppId)
            .then(response => {
                const data = response.data;
                if (!data || !data.nodes || data.nodes.length === 0) {
                    setError("No semantic graph data available for this DPP.");
                } else {
                    setGraphData({ nodes: data.nodes, links: data.edges });
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Graph fetch error:", err);
                setError("Failed to load semantic graph.");
                setLoading(false);
            });
    }, [dppId]);

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '90%', height: '90%', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Semantic Graph View (DPP #{dppId})</h3>
                    <button onClick={onClose} className="btn-secondary" style={{ padding: '6px' }}><X size={20} /></button>
                </div>
                <div style={{ flex: 1, position: 'relative', backgroundColor: '#f8fafc' }}>
                    {loading && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Graph...</div>}
                    {error && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexDirection: 'column', gap: '10px' }}>
                        <Network size={48} color="#cbd5e1" />
                        <p>{error}</p>
                    </div>}
                    {!loading && !error && graphData && (
                        <ForceGraph2D
                            graphData={graphData}
                            nodeLabel="label"
                            nodeAutoColorBy="type"
                            linkDirectionalArrowLength={3.5}
                            linkDirectionalArrowRelPos={1}
                            width={window.innerWidth * 0.9}
                            height={window.innerHeight * 0.9 - 60}
                            nodeRelSize={6}
                            linkWidth={2}
                            backgroundColor="#f8fafc"
                            nodeCanvasObject={(node, ctx, globalScale) => {
                                const label = node.label;
                                const fontSize = 12 / globalScale;
                                ctx.font = `${fontSize}px Sans-Serif`;
                                const textWidth = ctx.measureText(label).width;
                                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);
                                ctx.beginPath();
                                ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
                                ctx.fillStyle = node.color;
                                ctx.fill();
                                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                                ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + 8, ...bckgDimensions);
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'top';
                                ctx.fillStyle = '#000';
                                ctx.fillText(label, node.x, node.y + 8 + fontSize * 0.1);
                            }}
                            nodeCanvasObjectMode={() => 'replace'}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const ValueRenderer = ({ value }) => {
    if (value === null || value === undefined) return <span style={{ color: '#94a3b8' }}>-</span>;

    if (typeof value === 'object') {
        return (
            <div style={{ paddingLeft: '10px', borderLeft: '2px solid #e2e8f0', marginTop: '4px' }}>
                {Object.entries(value).map(([k, v]) => (
                    <div key={k} style={{ marginBottom: '4px' }}>
                        <span style={{ fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>{k}: </span>
                        <ValueRenderer value={v} />
                    </div>
                ))}
            </div>
        );
    }

    const strVal = String(value);

    if (strVal.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        const fileName = strVal.split('/').pop();
        const fullUrl = strVal.startsWith('http') ? strVal : `${API_URL}${strVal}`;
        return (
            <div style={{ marginTop: '4px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#3b82f6', backgroundColor: '#eff6ff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <ImageIcon size={14} /> {fileName}
                </span>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden', maxWidth: '200px' }}>
                    <img
                        src={fullUrl}
                        alt={fileName}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>
            </div>
        );
    }

    if (strVal.match(/\.(pdf)$/i)) {
        const fileName = strVal.split('/').pop();
        const fullUrl = strVal.startsWith('http') ? strVal : `${API_URL}${strVal}`;
        return (
            <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ef4444', backgroundColor: '#fef2f2', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', textDecoration: 'none', border: '1px solid #fecaca' }}
            >
                <FileIcon size={14} /> {fileName} (Open)
            </a>
        );
    }

    return <span style={{ color: '#0f172a', wordBreak: 'break-word' }}>{strVal}</span>;
};

const DetailModal = ({ dppId, onClose }) => {
    const [dpp, setDpp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getDPP(dppId)
            .then(response => {
                setDpp(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch DPP error:", err);
                setError("Failed to load DPP details.");
                setLoading(false);
            });
    }, [dppId]);

    if (!dppId) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', zIndex: 2500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '90%', maxWidth: '1200px', maxHeight: '90vh', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>Product Details</h2>
                    <button onClick={onClose} className="btn-secondary" style={{ padding: '6px' }}><X size={20} /></button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {loading && <div className="loader-container"><div className="modern-spinner"></div></div>}
                    {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

                    {dpp && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Title</label>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>{dpp.title}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Product ID</label>
                                    <p style={{ margin: '4px 0 0 0', fontFamily: 'monospace', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                                        {dpp.dpp_uuid || dpp.product_id}
                                    </p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Status</label>
                                    <div style={{ marginTop: '4px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600',
                                            backgroundColor: dpp.is_published ? '#ecfdf5' : '#f1f5f9',
                                            color: dpp.is_published ? '#065f46' : '#475569'
                                        }}>
                                            {dpp.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Manufacturer</label>
                                    <p style={{ margin: '4px 0 0 0', fontWeight: '500' }}>{dpp.manufacturer || '-'}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Model Number</label>
                                    <p style={{ margin: '4px 0 0 0', fontWeight: '500' }}>{dpp.model_number || '-'}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Serial Number</label>
                                    <p style={{ margin: '4px 0 0 0', fontWeight: '500' }}>{dpp.serial_number || '-'}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Production Date</label>
                                    <p style={{ margin: '4px 0 0 0', fontWeight: '500' }}>{dpp.production_date || '-'}</p>
                                </div>
                            </div>

                            {dpp.description && (
                                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                                    <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Description</label>
                                    <p style={{ margin: '8px 0 0 0', color: '#334155', lineHeight: '1.5' }}>{dpp.description}</p>
                                </div>
                            )}

                            {dpp.submodels && dpp.submodels.length > 0 && (
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>
                                        AAS Submodels
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {dpp.submodels.map((sm, idx) => (
                                            <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                                                <div style={{ backgroundColor: '#f1f5f9', padding: '12px 16px', fontWeight: '600', color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>{sm.idShort || `Submodel #${idx + 1}`}</span>
                                                    {sm.semanticId && <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '400' }}>{sm.semanticId}</span>}
                                                </div>
                                                <div style={{ padding: '16px' }}>
                                                    {sm.submodelElements && Object.keys(sm.submodelElements).length > 0 ? (
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 20px' }}>
                                                            {Object.entries(sm.submodelElements).map(([key, val]) => (
                                                                <div key={key} style={{ display: 'contents' }}>
                                                                    <span style={{ color: '#64748b', fontWeight: '500' }}>{key}:</span>
                                                                    <ValueRenderer value={val} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p style={{ margin: 0, color: '#94a3b8', fontStyle: 'italic' }}>No elements</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} className="btn-primary">Close</button>
                </div>
            </div>
        </div>
    );
};

const downloadBlob = (data, filename, mimeType) => {
    const url = window.URL.createObjectURL(new Blob([data], { type: mimeType }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

function Dashboard() {
  const [dpps, setDpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchMode, setSearchMode] = useState('simple');
  const [simpleQuery, setSimpleQuery] = useState('');
  const [advancedCriteria, setAdvancedCriteria] = useState([{ field_key: '', field_value: '', comparison_operator: null, match_type: 'partial' }]);
  const [stats, setStats] = useState({ total_dpps: 0, published_dpps: 0, draft_dpps: 0, my_dpps: 0 });
  const [selectedGraphId, setSelectedGraphId] = useState(null);
  const [selectedDetailId, setSelectedDetailId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dppToDelete, setDppToDelete] = useState(null);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const currentUser = getCurrentUser();
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'ADMIN');

  const fetchStats = useCallback(() => {
    getDPPStats()
      .then(response => setStats(response.data))
      .catch(err => console.error("Error fetching stats:", err));
  }, []);

  const fetchDPPs = useCallback((params) => {
    setLoading(true);
    setError(null);
    getDPPs(params)
      .then(response => {
        let data = [];
        let total = 0;
        if (response.data && Array.isArray(response.data.results)) {
            data = response.data.results;
            total = response.data.total_count;
        } else if (Array.isArray(response.data)) {
            data = response.data;
            total = data.length;
        }
        setDpps(data);
        setTotalCount(total);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching DPPs:", err);
        let errorMessage = "Failed to connect to backend.";
        if (err.response) {
            errorMessage += ` Server responded with status: ${err.response.status}`;
            if (err.response.data?.detail) {
                const detail = err.response.data.detail;
                errorMessage += ` (${typeof detail === 'object' ? JSON.stringify(detail) : detail})`;
            }
        }
        setError(errorMessage);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchStats();
    if (searchMode === 'simple') {
        fetchDPPs({ mode: 'simple', keywords: simpleQuery, page, limit });
    } else {
        fetchDPPs({ mode: 'advanced', advanced_criteria: advancedCriteria, page, limit });
    }
  }, [page, limit, fetchDPPs, fetchStats]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();
    setPage(1);
    if (searchMode === 'simple') {
      fetchDPPs({ mode: 'simple', keywords: simpleQuery, page: 1, limit });
    } else {
      fetchDPPs({ mode: 'advanced', advanced_criteria: advancedCriteria, page: 1, limit });
    }
  }, [searchMode, simpleQuery, advancedCriteria, limit, fetchDPPs]);

  const handleDownload = useCallback(async (id) => {
    try {
      const response = await exportDPP(id);
      downloadBlob(response.data, `dpp_${id}.json`, 'application/json');
      toast.success("JSON Exported Successfully");
    } catch (err) {
      console.error("Export JSON error:", err);
      toast.error("Export JSON failed!");
    }
  }, []);

  const handleDownloadPdf = useCallback(async (id) => {
    try {
      const response = await exportDPPPdf(id);
      downloadBlob(response.data, `dpp_${id}.pdf`, 'application/pdf');
      toast.success("PDF Exported Successfully");
    } catch (err) {
      console.error("Export PDF error:", err);
      toast.error("Export PDF failed!");
    }
  }, []);

  const confirmDelete = useCallback((id) => {
    setDppToDelete(id);
    setDeleteModalOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!dppToDelete) return;
    try {
        await deleteDPP(dppToDelete);
        toast.success("DPP deleted successfully");
        fetchStats();
        if (searchMode === 'simple') {
            fetchDPPs({ mode: 'simple', keywords: simpleQuery, page, limit });
        } else {
            fetchDPPs({ mode: 'advanced', advanced_criteria: advancedCriteria, page, limit });
        }
    } catch (err) {
        console.error("Delete error:", err);
        toast.error("Failed to delete DPP. You might not be the owner.");
    } finally {
        setDeleteModalOpen(false);
        setDppToDelete(null);
    }
  }, [dppToDelete, searchMode, simpleQuery, advancedCriteria, page, limit, fetchStats, fetchDPPs]);

  const handlePublishToggle = useCallback(async (dpp) => {
    try {
        if (dpp.is_published) {
            await unpublishDPP(dpp.id || dpp.dpps_id);
            toast.success("DPP Unpublished");
        } else {
            await publishDPP(dpp.id || dpp.dpps_id);
            toast.success("DPP Published");
        }
        fetchStats();
        if (searchMode === 'simple') {
            fetchDPPs({ mode: 'simple', keywords: simpleQuery, page, limit });
        } else {
            fetchDPPs({ mode: 'advanced', advanced_criteria: advancedCriteria, page, limit });
        }
    } catch (err) {
        console.error("Publish error:", err);
        toast.error("Failed to change publish status.");
    }
  }, [searchMode, simpleQuery, advancedCriteria, page, limit, fetchStats, fetchDPPs]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1f2937', marginBottom: '24px' }}>{t('dashboard')}</h2>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid #004494' }}>
            <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: '#e6f0fa', color: '#004494' }}>
                <FileText size={24} />
            </div>
            <div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>{t('total_dpps')}</p>
                <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', color: '#1f2937' }}>{stats.total_dpps}</h3>
            </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid #10b981' }}>
            <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669' }}>
                <Globe size={24} />
            </div>
            <div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>{t('published')}</p>
                <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', color: '#1f2937' }}>{stats.published_dpps}</h3>
            </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: '#fffbeb', color: '#d97706' }}>
                <File size={24} />
            </div>
            <div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>{t('drafts')}</p>
                <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', color: '#1f2937' }}>{stats.draft_dpps}</h3>
            </div>
        </div>
      </div>

      {/* Search Card */}
      <div className="card" style={{ marginBottom: '30px', padding: '24px' }}>
        <div style={{ maxWidth: '240px', marginBottom: '20px' }}>
          <SearchModeToggle mode={searchMode} setMode={setSearchMode} />
        </div>

        {searchMode === 'simple' ? (
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '15px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
                <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    value={simpleQuery}
                    onChange={(e) => setSimpleQuery(e.target.value)}
                    style={{ paddingLeft: '40px', width: '100%' }}
                />
            </div>
            <button type="submit" className="btn-primary">{t('search')}</button>
          </form>
        ) : (
          <AdvancedSearch criteria={advancedCriteria} setCriteria={setAdvancedCriteria} onSearch={handleSearch} />
        )}
      </div>

      {/* Content */}
      {loading && (
        <div className="loader-container">
            <div className="modern-spinner"></div>
            <p>{t('loading')}</p>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fecaca' }}>
            {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ marginTop: 0 }}>
            <thead>
                <tr>
                <th style={{ width: '80px' }}>{t('id')}</th>
                <th>{t('title')}</th>
                <th>{t('product_id')}</th>
                <th>{t('status')}</th>
                <th style={{ width: '300px', textAlign: 'right' }}>{t('actions')}</th>
                </tr>
            </thead>
            <tbody>
                {dpps.length > 0 ? (
                dpps.map(dpp => (
                    <tr key={dpp.id || dpp.dpps_id}>
                    <td style={{ fontWeight: '600', color: '#6b7280' }}>#{dpp.id || dpp.dpps_id}</td>
                    <td
                        style={{ fontWeight: '500', color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => setSelectedDetailId(dpp.id || dpp.dpps_id)}
                    >
                        {dpp.title || dpp.dpps_title || 'N/A'}
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#4b5563' }}>{dpp.dpp_uuid || dpp.product_id || dpp.product_identifier || dpp.dpps_product_identifier || 'N/A'}</td>
                    <td>
                        <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: dpp.is_published ? '#ecfdf5' : '#f1f5f9',
                            color: dpp.is_published ? '#065f46' : '#475569'
                        }}>
                            {dpp.is_published ? t('published') : t('drafts')}
                        </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setSelectedGraphId(dpp.id || dpp.dpps_id)}
                                className="btn-secondary"
                                style={{ padding: '6px', color: 'var(--primary-color)' }}
                                title="View Semantic Graph"
                            >
                                <Network size={16} />
                            </button>

                            {(isAdmin || dpp.is_owner) && (
                                <>
                                    <button
                                        onClick={() => handlePublishToggle(dpp)}
                                        className="btn-secondary"
                                        style={{ padding: '6px', color: dpp.is_published ? '#64748b' : '#10b981' }}
                                        title={dpp.is_published ? t('unpublish') : t('publish')}
                                    >
                                        {dpp.is_published ? <EyeOff size={16} /> : <Globe size={16} />}
                                    </button>

                                    <button
                                        onClick={() => navigate(`/edit-dpp/${dpp.id || dpp.dpps_id}`)}
                                        className="btn-secondary"
                                        style={{ padding: '6px', color: 'var(--primary-color)' }}
                                        title="Edit DPP"
                                    >
                                        <Edit size={16} />
                                    </button>
                                </>
                            )}

                            <button
                                onClick={() => handleDownload(dpp.id || dpp.dpps_id)}
                                className="btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                                title="Export JSON"
                            >
                                <FileDown size={14} /> {t('export_json')}
                            </button>
                            <button
                                onClick={() => handleDownloadPdf(dpp.id || dpp.dpps_id)}
                                className="btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                                title="Export PDF"
                            >
                                <FileText size={14} /> {t('export_pdf')}
                            </button>

                            {(isAdmin || dpp.is_owner) && (
                                <button
                                    onClick={() => confirmDelete(dpp.id || dpp.dpps_id)}
                                    className="btn-danger"
                                    style={{ padding: '6px' }}
                                    title={t('delete')}
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                        {t('no_results')}
                    </td>
                </tr>
                )}
            </tbody>
            </table>

            {totalCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} entries
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="btn-secondary"
                            style={{ padding: '8px', opacity: page === 1 ? 0.5 : 1 }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="btn-secondary"
                            style={{ padding: '8px', opacity: page === totalPages ? 0.5 : 1 }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
      )}

      {selectedGraphId && (
          <GraphModal dppId={selectedGraphId} onClose={() => setSelectedGraphId(null)} />
      )}

      {selectedDetailId && (
          <DetailModal dppId={selectedDetailId} onClose={() => setSelectedDetailId(null)} />
      )}

      <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete DPP"
          message="Are you sure you want to delete this Digital Product Passport? This action cannot be undone."
      />
    </div>
  );
}

export default Dashboard;