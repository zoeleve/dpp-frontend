import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { executeSPARQL } from '../services/api'; // Updated import
import { ArrowLeft, Play, Code, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function SparqlQuery() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [query, setQuery] = useState('SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const templates = [
    { label: "Select All (Limit 10)", value: "SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10" },
    { label: "Get All Manufacturers", value: "PREFIX schema: <http://schema.org/>\nSELECT DISTINCT ?manufacturer WHERE { ?s schema:manufacturer ?manufacturer }" },
    { label: "Count DPPs", value: "PREFIX aas: <https://admin-shell.io/aas/3/0/>\nSELECT (COUNT(?s) AS ?count) WHERE { ?s a aas:AssetAdministrationShell }" },
    { label: "Find Submodels", value: "PREFIX aas: <https://admin-shell.io/aas/3/0/>\nPREFIX dcterms: <http://purl.org/dc/terms/>\nSELECT ?dppTitle ?submodelTitle WHERE {\n  ?dpp a aas:AssetAdministrationShell ;\n       dcterms:title ?dppTitle ;\n       aas:submodel ?sm .\n  ?sm dcterms:title ?submodelTitle\n}" }
  ];

  const handleExecute = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await executeSPARQL(query);
      setResults(response.data);
    } catch (err) {
      console.error("SPARQL Error:", err);
      let msg = "Query execution failed.";
      if (err.response) {
          msg += ` Server responded with: ${err.response.data.detail || err.response.statusText}`;
      } else {
          msg += ` ${err.message}`;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Helper to render results table dynamically
  const renderTable = () => {
    if (!results || !results.results || results.results.length === 0) {
      return <p style={{ color: 'var(--text-secondary)' }}>{t('no_results')}</p>;
    }

    // Assuming results.results is an array of objects (bindings)
    // We need to extract headers from the first object keys
    const headers = Object.keys(results.results[0]);

    return (
      <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ marginTop: 0 }}>
          <thead>
            <tr>
              {headers.map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {results.results.map((row, idx) => (
              <tr key={idx}>
                {headers.map(h => (
                  <td key={h} style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {typeof row[h] === 'object' ? JSON.stringify(row[h]) : row[h]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)', padding: '0 10px' }}>{t('total_count')}: {results.total_count}</p>
      </div>
    );
  };

  return (
    <div className="container">
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', fontSize: '16px', color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={20} /> {t('back_to_dashboard')}
      </button>

      <div className="card">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Code size={32} color="var(--primary-color)" /> {t('sparql_editor')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {t('sparql_desc')}
        </p>
        
        {/* Templates Dropdown */}
        <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={20} color="var(--text-secondary)" />
            <select 
                onChange={(e) => setQuery(e.target.value)} 
                style={{ flex: 1, maxWidth: '400px' }}
                defaultValue=""
            >
                <option value="" disabled>Select a query template...</option>
                {templates.map((tmpl, idx) => (
                    <option key={idx} value={tmpl.value}>{tmpl.label}</option>
                ))}
            </select>
        </div>

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '6px', marginBottom: '20px', whiteSpace: 'pre-wrap', border: '1px solid #fecaca' }}>{error}</div>}

        <form onSubmit={handleExecute} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <textarea 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows="10"
                style={{ 
                    width: '100%', 
                    padding: '15px', 
                    boxSizing: 'border-box', 
                    fontFamily: 'monospace', 
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#1e293b', /* Dark slate for code editor feel */
                    color: '#f8fafc'
                }}
                spellCheck="false"
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="btn-primary"
                    style={{ 
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    <Play size={16} fill="white" /> {loading ? t('loading') : t('run_query')}
                </button>
            </div>
        </form>

        {results && (
            <div style={{ marginTop: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>{t('results')}</h3>
                {renderTable()}
            </div>
        )}
      </div>
    </div>
  );
}

export default SparqlQuery;