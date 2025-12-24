import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { executeSPARQL } from '../api';
import { ArrowLeft, Play, Code } from 'lucide-react';

function SparqlQuery() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      return <p>No results found.</p>;
    }

    // Assuming results.results is an array of objects (bindings)
    // We need to extract headers from the first object keys
    const headers = Object.keys(results.results[0]);

    return (
      <div style={{ overflowX: 'auto' }}>
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4' }}>
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
        <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>Total count: {results.total_count}</p>
      </div>
    );
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', fontSize: '16px' }}
      >
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <h1><Code style={{ verticalAlign: 'middle', marginRight: '10px' }} /> SPARQL Query Editor</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Execute raw SPARQL SELECT queries against the semantic store.
      </p>
      
      {error && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '4px', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>{error}</div>}

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
                borderRadius: '4px',
                border: '1px solid #ccc',
                backgroundColor: '#2d2d2d',
                color: '#f8f8f2'
            }}
            spellCheck="false"
        />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
                type="submit" 
                disabled={loading}
                style={{ 
                    padding: '10px 24px', 
                    backgroundColor: loading ? '#6c757d' : '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                <Play size={16} fill="white" /> {loading ? "Executing..." : "Run Query"}
            </button>
        </div>
      </form>

      {results && (
        <div style={{ marginTop: '30px' }}>
            <h3>Results</h3>
            {renderTable()}
        </div>
      )}
    </div>
  );
}

export default SparqlQuery;