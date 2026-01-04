import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateDPP from './pages/CreateDPP';
import UserManagement from './pages/UserManagement';
import UserProfile from './pages/UserProfile'; // Import the new page
import UploadAASX from './pages/UploadAASX';
import SparqlQuery from './pages/SparqlQuery';
import Layout from './components/Layout';

// Simple auth guard
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* All protected routes are now children of the Layout route */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create-dpp" element={<CreateDPP />} />
          <Route path="upload-aasx" element={<UploadAASX />} />
          <Route path="sparql" element={<SparqlQuery />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="profile" element={<UserProfile />} /> {/* New Route */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;