import { useState, useEffect } from 'react';
import { getDPPs, exportDPP, exportDPPPdf, deleteDPP, getCurrentUser, publishDPP, unpublishDPP } from '../api';
import { FileDown, Search, Trash2, FileText, Globe, EyeOff, File, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchModeToggle = ({ mode, setMode }) => (
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
      Simple
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
      Advanced
    </button>
  </div>
);

const AdvancedSearch = ({ criteria, setCriteria, onSearch }) => {
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
          <button onClick={() => removeCriteria(index)} style={{ padding: '8px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none' }}>
            <X size={16} />
          </button>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={addCriteria} className="btn-secondary" style={{ backgroundColor: '#e5e7eb', color: '#374151' }}>
          <Plus size={16} /> Add Filter
        </button>
        <button onClick={onSearch} className="btn-primary">
          <Search size={16} /> Advanced Search
        </button>
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
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 });
  const navigate = useNavigate();
  
  const currentUser = getCurrentUser();
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'ADMIN');

  const fetchDPPs = (params) => {
    setLoading(true);
    setError(null);
    getDPPs(params)
      .then(response => {
        let data = [];
        let totalCount = 0;
        
        if (response.data && Array.isArray(response.data.results)) {
            data = response.data.results;
            totalCount = response.data.total_count;
        } else if (Array.isArray(response.data)) {
            data = response.data;
            totalCount = data.length;
        }
        
        setDpps(data);
        
        const publishedCount = data.filter(d => d.is_published).length;
        const draftsCount = data.filter(d => !d.is_published).length;
        
        setStats({
            total: totalCount,
            published: publishedCount,
            drafts: draftsCount
        });
        
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
    fetchDPPs({ mode: 'simple', keywords: '' }); // Initial load
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchMode === 'simple') {
      fetchDPPs({ mode: 'simple', keywords: simpleQuery });
    } else {
      fetchDPPs({ mode: 'advanced', advanced_criteria: advancedCriteria });
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
    } catch (error) {
      console.error("Export JSON error:", error);
      alert("Export JSON failed!");
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
    } catch (error) {
      console.error("Export PDF error:", error);
      alert("Export PDF failed!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this DPP?")) return;
    try {
        await deleteDPP(id);
        alert("DPP deleted successfully");
        fetchDPPs({ mode: 'simple', keywords: simpleQuery }); 
    } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete DPP. You might not be the owner.");
    }
  };

  const handlePublishToggle = async (dpp) => {
      try {
          if (dpp.is_published) {
              await unpublishDPP(dpp.id || dpp.dpps_id);
              alert("DPP Unpublished");
          } else {
              await publishDPP(dpp.id || dpp.dpps_id);
              alert("DPP Published");
          }
          fetchDPPs({ mode: 'simple', keywords: simpleQuery });
      } catch (error) {
          console.error("Publish error:", error);
          alert("Failed to change publish status. You might not be the owner.");
      }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1f2937', marginBottom: '24px' }}>Dashboard</h2>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid #4f46e5' }}>
            <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                <FileText size={24} />
            </div>
            <div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>Total DPPs</p>
                <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', color: '#1f2937' }}>{stats.total}</h3>
            </div>
        </div>
        
        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid #10b981' }}>
            <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: '#d1fae5', color: '#059669' }}>
                <Globe size={24} />
            </div>
            <div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>Published</p>
                <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', color: '#1f2937' }}>{stats.published}</h3>
            </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706' }}>
                <File size={24} />
            </div>
            <div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>Drafts</p>
                <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', color: '#1f2937' }}>{stats.drafts}</h3>
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
                    placeholder="Search by keywords..." 
                    value={simpleQuery}
                    onChange={(e) => setSimpleQuery(e.target.value)}
                    style={{ paddingLeft: '40px', width: '100%' }}
                />
            </div>
            <button type="submit" className="btn-primary">Search</button>
          </form>
        ) : (
          <AdvancedSearch criteria={advancedCriteria} setCriteria={setAdvancedCriteria} onSearch={handleSearch} />
        )}
      </div>

      {/* Content */}
      {loading && (
        <div className="loader-container">
            <div className="modern-spinner"></div>
            <p>Loading your data...</p>
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
                <th style={{ width: '80px' }}>ID</th>
                <th>Title</th>
                <th>Product ID</th>
                <th>Status</th>
                <th style={{ width: '300px', textAlign: 'right' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {dpps.length > 0 ? (
                dpps.map(dpp => (
                    <tr key={dpp.id || dpp.dpps_id}>
                    <td style={{ fontWeight: '600', color: '#6b7280' }}>#{dpp.id || dpp.dpps_id}</td>
                    <td style={{ fontWeight: '500' }}>{dpp.title || dpp.dpps_title || 'N/A'}</td>
                    <td style={{ fontFamily: 'monospace', color: '#4b5563' }}>{dpp.dpp_uuid || dpp.product_identifier || dpp.dpps_product_identifier || 'N/A'}</td>
                    <td>
                        <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontSize: '0.75rem', 
                            fontWeight: '600',
                            backgroundColor: dpp.is_published ? '#d1fae5' : '#f3f4f6',
                            color: dpp.is_published ? '#065f46' : '#4b5563'
                        }}>
                            {dpp.is_published ? 'Published' : 'Draft'}
                        </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => handlePublishToggle(dpp)}
                                style={{ padding: '6px', backgroundColor: 'white', border: '1px solid #d1d5db', color: dpp.is_published ? '#6b7280' : '#10b981' }}
                                title={dpp.is_published ? "Unpublish" : "Publish"}
                            >
                                {dpp.is_published ? <EyeOff size={16} /> : <Globe size={16} />}
                            </button>
                            <button 
                                onClick={() => handleDownload(dpp.id || dpp.dpps_id)} 
                                style={{ padding: '6px 12px', fontSize: '0.85rem', backgroundColor: 'white', border: '1px solid #d1d5db', color: '#374151' }}
                                title="Export JSON"
                            >
                                <FileDown size={14} /> JSON
                            </button>
                            <button 
                                onClick={() => handleDownloadPdf(dpp.id || dpp.dpps_id)} 
                                style={{ padding: '6px 12px', fontSize: '0.85rem', backgroundColor: 'white', border: '1px solid #d1d5db', color: '#374151' }}
                                title="Export PDF"
                            >
                                <FileText size={14} /> PDF
                            </button>
                            {isAdmin && (
                                <button 
                                    onClick={() => handleDelete(dpp.id || dpp.dpps_id)} 
                                    style={{ padding: '6px', backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca' }}
                                    title="Delete"
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
                        No Digital Product Passports found. Try creating one!
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;