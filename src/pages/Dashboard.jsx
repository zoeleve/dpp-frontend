import { useState, useEffect } from 'react';
import { getDPPs, getDPPStats, exportDPP, exportDPPPdf, deleteDPP, getCurrentUser, publishDPP, unpublishDPP, getDPPGraph, getMe } from '../services/api'; 
import { FileDown, Search, Trash2, FileText, Globe, EyeOff, File, Plus, X, Network, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ForceGraph2D from 'react-force-graph-2d';
import toast from 'react-hot-toast'; // Import toast

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
    const newCriteria = [...criteria];
    newCriteria[index][field] = value;
    setCriteria(newCriteria);
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

// Graph Modal Component (unchanged)
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
                    setGraphData({
                        nodes: data.nodes,
                        links: data.edges 
                    });
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
                                const fontSize = 12/globalScale;
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

function Dashboard() {
  const [dpps, setDpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchMode, setSearchMode] = useState('simple');
  const [simpleQuery, setSimpleQuery] = useState("");
  const [advancedCriteria, setAdvancedCriteria] = useState([{ field_key: '', field_value: '', comparison_operator: null, match_type: 'partial' }]);
  const [stats, setStats] = useState({ total_dpps: 0, published_dpps: 0, draft_dpps: 0, my_dpps: 0 });
  const [selectedGraphId, setSelectedGraphId] = useState(null); 
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const currentUser = getCurrentUser();
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'ADMIN');

  const fetchStats = () => {
    getDPPStats()
      .then(response => {
        setStats(response.data);
      })
      .catch(err => {
        console.error("Error fetching stats:", err);
      });
  };

  const fetchDPPs = (params) => {
    setLoading(true);
    setError(null);
    
    const queryParams = {
        ...params,
        page: page,
        limit: limit
    };

    getDPPs(queryParams)
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
            if (err.response.data && err.response.data.detail) {
                const detail = err.response.data.detail;
                errorMessage += ` (${typeof detail === 'object' ? JSON.stringify(detail) : detail})`;
            }
        }
        setError(errorMessage);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
    if (searchMode === 'simple') {
        fetchDPPs({ mode: 'simple', keywords: simpleQuery });
    } else {
        fetchDPPs({ mode: 'advanced', advanced_criteria: advancedCriteria });
    }
  }, [page, limit]); 

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); 
    if (searchMode === 'simple') {
      fetchDPPs({ mode: 'simple', keywords: simpleQuery, page: 1, limit });
    } else {
      fetchDPPs({ mode: 'advanced', advanced_criteria: advancedCriteria, page: 1, limit });
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await exportDPP(id);
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dpp_${id}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("JSON Exported Successfully"); // Toast
    } catch (error) {
      console.error("Export JSON error:", error);
      toast.error("Export JSON failed!"); // Toast
    }
  };

  const handleDownloadPdf = async (id) => {
    try {
      const response = await exportDPPPdf(id);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dpp_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("PDF Exported Successfully"); // Toast
    } catch (error) {
      console.error("Export PDF error:", error);
      toast.error("Export PDF failed!"); // Toast
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this DPP?")) return;
    try {
        await deleteDPP(id);
        toast.success("DPP deleted successfully"); // Toast
        fetchStats(); 
        if (searchMode === 'simple') {
            fetchDPPs({ mode: 'simple', keywords: simpleQuery });
        } else {
            fetchDPPs({ mode: 'advanced', advanced_criteria: advancedCriteria });
        }
    } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete DPP. You might not be the owner."); // Toast
    }
  };

  const handlePublishToggle = async (dpp) => {
      try {
          if (dpp.is_published) {
              await unpublishDPP(dpp.id || dpp.dpps_id);
              toast.success("DPP Unpublished"); // Toast
          } else {
              await publishDPP(dpp.id || dpp.dpps_id);
              toast.success("DPP Published"); // Toast
          }
          fetchStats(); 
          if (searchMode === 'simple') {
              fetchDPPs({ mode: 'simple', keywords: simpleQuery });
          } else {
              fetchDPPs({ mode: 'advanced', advanced_criteria: advancedCriteria });
          }
      } catch (error) {
          console.error("Publish error:", error);
          toast.error("Failed to change publish status."); // Toast
      }
  };

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
                    <td style={{ fontWeight: '500' }}>{dpp.title || dpp.dpps_title || 'N/A'}</td>
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
                            {/* Graph View Button */}
                            <button 
                                onClick={() => setSelectedGraphId(dpp.id || dpp.dpps_id)}
                                className="btn-secondary"
                                style={{ padding: '6px', color: 'var(--primary-color)' }}
                                title="View Semantic Graph"
                            >
                                <Network size={16} />
                            </button>

                            {/* Publish/Unpublish - Admin or Owner */}
                            {(isAdmin || dpp.is_owner) && (
                                <button 
                                    onClick={() => handlePublishToggle(dpp)}
                                    className="btn-secondary"
                                    style={{ padding: '6px', color: dpp.is_published ? '#64748b' : '#10b981' }}
                                    title={dpp.is_published ? t('unpublish') : t('publish')}
                                >
                                    {dpp.is_published ? <EyeOff size={16} /> : <Globe size={16} />}
                                </button>
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
                            
                            {/* Delete - Admin or Owner */}
                            {(isAdmin || dpp.is_owner) && (
                                <button 
                                    onClick={() => handleDelete(dpp.id || dpp.dpps_id)} 
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
            
            {/* Pagination Controls */}
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

      {/* Graph Modal */}
      {selectedGraphId && (
          <GraphModal dppId={selectedGraphId} onClose={() => setSelectedGraphId(null)} />
      )}
    </div>
  );
}

export default Dashboard;