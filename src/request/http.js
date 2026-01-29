import axios from 'axios';
import { getToken } from '@/utils';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJVcmNNb0hKdnVsU09oaXI4ejctcyIsImlhdCI6MTc2OTA4MDA1OCwiZXhwIjoxNzcxNjcyMDU4fQ.vKgrQbI5mr9GSp41F6V2l5I6_4WCgBMfkXfOd7ZDyAw";
const TEST_PROJECT_ID = "N-KUsUZgmt9J7JUcTITZd";

// Helper to get token (param > localStorage > test constant)
const resolveToken = (token) => token || getToken() || TEST_TOKEN;
const resolveProjectId = (projectId) => projectId || TEST_PROJECT_ID;

// 验证token是否有效
export async function validateToken(token) {
    try {
        const response = await axios.get('/glicon/tokenvalidate', {
            params: { token: resolveToken(token) }
        });
        return response.data;
    } catch (error) {
        console.error('Token validation failed:', error);
        throw error;
    }
}

export async function queryProject({ projectId, token }) {
    try {
        const response = await axios.get('/glicon/project/query', {
            params: { 
                projectId: resolveProjectId(projectId), 
                token: resolveToken(token) 
            }
        });
        console.log("🚀 ~ queryProject ~ response:", response)
        return response.data;
    } catch (error) {
        console.error('Project query failed:', error);
        throw error;
    }
}


export async function queryMenu({ projectId, token }) {
    try {
        const response = await axios.get('/glicon/menu/list', {
            params: { 
                projectId: resolveProjectId(projectId), 
                token: resolveToken(token) 
            }
        });
        return response.data.data || [];
    } catch (error) {
        console.error('Menu query failed:', error);
        throw error;
    }
}

export async function querySlider({ projectId, token, name, link }) {
    try {
        const response = await axios.get('/glicon/slider/all', {
            params: { 
                projectId: resolveProjectId(projectId), 
                token: resolveToken(token),
                name,
                link 
            }
        });
        console.log("🚀 ~ querySlider ~ response:", response)
        return response.data.data || [];
    } catch (error) {
        console.error('Slider query failed:', error);
        throw error;
    }
}
export async function querySliderList({ projectId, token, name, link }) {
    try {
        const response = await axios.get('/glicon/slider/list', {
            params: { 
                projectId: resolveProjectId(projectId), 
                token: resolveToken(token),
                name,
                link 
            }
        });
        console.log("🚀 ~ querySlider ~ response:", response)
        return response.data.data || [];
    } catch (error) {
        console.error('Slider query failed:', error);
        throw error;
    }
}

export async function sortMenu({ projectId, token, data }) {
    try {
        const response = await axios.post('/glicon/menu/sort', {
            projectId: resolveProjectId(projectId),
            data
        }, {
            params: { token: resolveToken(token) } // Usually token is in header or query for post? Original code didn't show.
            // Assuming query param based on other get requests, or maybe body?
            // The original utils/index.js didn't show how token was passed for POST (except upload).
            // But let's assume query param 'token' works or header.
            // Safe bet: add it to params AND header if possible, but axios structure: url, data, config.
        });
        return response.data;
    } catch (error) {
        console.error('Menu sort failed:', error);
        throw error;
    }
}

export async function saveMenu({ projectId, token, name, link }) {
    try {
        const response = await axios.post('/glicon/menu/save', {
            projectId: resolveProjectId(projectId),
            name,
            link
        }, {
            params: { token: resolveToken(token) }
        });
        return response.data;
    } catch (error) {
        console.error('Menu save failed:', error);
        throw error;
    }
}

export async function saveSlider({ projectId, token, link, data }) {
    try {
        const response = await axios.post('/glicon/slider/save', {
            projectId: resolveProjectId(projectId),
            link,
            data
        }, {
            params: { token: resolveToken(token) }
        });
        return response.data;
    } catch (error) {
        console.error('Slider save failed:', error);
        throw error;
    }
}

export async function queryDoc({ projectId, token, link, item, name }) {
    try {
        const response = await axios.get('/glicon/slider/item/list', {
            params: { 
                projectId: resolveProjectId(projectId), 
                token: resolveToken(token),
                link,
                item,
                name
            }
        });
        return response.data.data || "";
    } catch (error) {
        console.error('Doc query failed:', error);
        throw error;
    }
}

export async function saveDoc({ projectId, token, link, item, data }) {
    try {
        const response = await axios.post('/glicon/slider/item/save', {
            projectId: resolveProjectId(projectId),
            link,
            item,
            data
        }, {
            params: { token: resolveToken(token) }
        });
        return response.data;
    } catch (error) {
        console.error('Doc save failed:', error);
        throw error;
    }
}
