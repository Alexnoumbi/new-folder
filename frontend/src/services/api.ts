import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        try {
            const stored = localStorage.getItem('user');
            if (stored) {
                const user = JSON.parse(stored);
                if (user?.email) {
                    const headers: any = config.headers;
                    if (headers && typeof headers.set === 'function') {
                        headers.set('x-user-email', user.email);
                    } else {
                        (config.headers as any) = { ...(config.headers || {}), 'x-user-email': user.email };
                    }
                }
            }
        } catch {}
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

export default api;