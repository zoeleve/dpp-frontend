import api from './services/api';

// Helper to get current user info from token
export const getCurrentUser = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

// Helper to fetch full user details (including subrole) from backend
export const getMe = () => api.get('/auth/me'); 

// Helper to fetch user by ID
export const getUserById = (userId) => api.get(`/users/${userId}`);

// Search endpoint - now supports simple and advanced modes
export const getDPPs = (searchParams) => {
    const { mode, keywords, advanced_criteria, page = 1, limit = 10 } = searchParams;

    if (mode === 'advanced' && advanced_criteria && advanced_criteria.length > 0) {
        const payload = {
            search_mode: "advanced",
            advanced_criteria: advanced_criteria,
            limit: limit,
            offset: (page - 1) * limit,
        };
        return api.post('/dpp/json/search', payload);
    } 
    
    // For simple mode
    // If keywords are provided, use them.
    // If NOT provided (initial load), we want to list ALL.
    // We try sending a space " " to bypass Pydantic validation but result in empty terms list in backend logic,
    // which should return all records.
    const query = (keywords && keywords.trim() !== "") ? keywords : " ";
    
    const payload = {
        search_mode: "simple",
        keywords: query,
        limit: limit,
        offset: (page - 1) * limit,
    };
    return api.post('/dpp/json/search', payload);
};

export const createDPP = (dppData) => api.post('/dpp/json/', dppData);
export const deleteDPP = (dpp_id) => api.delete(`/dpp/json/${dpp_id}`); 
export const updateDPP = (dpp_id, dppData) => api.put(`/dpp/json/${dpp_id}`, dppData); 
export const publishDPP = (dpp_id) => api.put(`/dpp/json/${dpp_id}/publish`); 
export const unpublishDPP = (dpp_id) => api.put(`/dpp/json/${dpp_id}/unpublish`);

export const exportDPP = (dpp_id) => api.get(`/dpp/export/${dpp_id}`, { responseType: 'blob' });
export const exportDPPPdf = (dpp_id) => api.get(`/dpp/export/${dpp_id}/pdf`, { responseType: 'blob' });

// Upload AASX endpoint
export const uploadAASX = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/dpp/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
};

// SPARQL endpoint
export const executeSPARQL = (query, limit = 100, offset = 0) => {
    return api.post('/dpp/sparql/query', {
        query: query,
        limit: limit,
        offset: offset
    });
};

// User management
export const getUsers = () => api.get('/users/all'); 
export const createUser = (userData) => {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
        if (userData[key] !== null && userData[key] !== undefined) {
            let value = userData[key];
            if (key === 'subrole' && value === '') return;
            if (key === 'role' || key === 'subrole') {
                if (typeof value === 'string') value = value.toLowerCase();
            }
            formData.append(key, value);
        }
    });
    return api.post('/users/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
export const deleteUser = (userId) => api.delete(`/users/${userId}`);
export const updateUser = (userId, userData) => api.put(`/users/${userId}`, userData); 
export const updatePassword = (userId, newPassword) => api.put(`/users/${userId}/password`, { new_password: newPassword });

export default api;