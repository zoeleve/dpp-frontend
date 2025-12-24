import api from './services/api';

// The user confirmed that GET /dpp/json/1 works via curl and returns the JSON.
// The user is still seeing "Server responded with status: 404" in the UI.
// This implies that the UI is NOT hitting /dpp/json/1 correctly, OR it is hitting it and getting 404?
// But curl works.
// Maybe the UI is still trying to hit /dpp/json/search?
// I updated getDPPs to use /dpp/json/1.

// Let's make sure we are using the exact path that works in curl.
// curl -X 'GET' 'http://127.0.0.1:8000/dpp/json/1'
// In vite config: proxy /dpp -> http://127.0.0.1:8000
// So frontend request to /dpp/json/1 -> http://127.0.0.1:8000/dpp/json/1.
// This should work.

// Why 404?
// Maybe the browser is caching the old version of the file?
// Or maybe the `BASE_URL` in `services/api.js` was messing things up?
// I just forced `BASE_URL` to empty string.

// Let's also add a console log in `getDPPs` to verify what is being called.

export const getDPPs = () => {
    console.log("Fetching DPPs from /dpp/json/1");
    return api.get('/dpp/json/1');
};

export const exportDPP = (dpp_id) => api.get(`/dpp/export/${dpp_id}`, { responseType: 'blob' });
export const exportDPPPdf = (dpp_id) => api.get(`/dpp/export/${dpp_id}/pdf`, { responseType: 'blob' });

export default api;