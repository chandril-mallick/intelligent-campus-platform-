import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const authService = {
    login: async (username, password) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        const response = await api.post('/auth/login/access-token', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
        }
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
    },
};

export const chatService = {
    query: async (query) => {
        const response = await api.post('/documents/query', null, {
            params: { query }
        });
        // Log query for analytics
        try {
            await api.post('/admin/log-query', null, { params: { query } });
        } catch (e) {
            console.warn('Failed to log query:', e);
        }
        return response.data;
    },
    uploadDocument: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        // Log upload for analytics
        try {
            await api.post('/admin/log-upload', null, {
                params: {
                    filename: file.name,
                    chunks: response.data.chunks_created || 0,
                    size_kb: Math.round(file.size / 1024)
                }
            });
        } catch (e) {
            console.warn('Failed to log upload:', e);
        }
        return response.data;
    },
};

export const adminService = {
    getAnalytics: async () => {
        const response = await api.get('/admin/analytics');
        return response.data;
    },
    getKnowledgeBase: async () => {
        const response = await api.get('/admin/knowledge-base');
        return response.data;
    },
    triggerAutoLearning: async (directoryPath) => {
        const response = await api.post('/admin/auto-learn/trigger', {
            directory_path: directoryPath,
            recursive: true
        });
        return response.data;
    },
};

export default api;
