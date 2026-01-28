import axios from 'axios';
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;


const token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJVcmNNb0hKdnVsU09oaXI4ejctcyIsImlhdCI6MTc2OTA4MDA1OCwiZXhwIjoxNzcxNjcyMDU4fQ.vKgrQbI5mr9GSp41F6V2l5I6_4WCgBMfkXfOd7ZDyAw"
const projectId="N-KUsUZgmt9J7JUcTITZd"
// 验证token是否有效
export async function validateToken() {
    try {
        const response = await axios.get('/glicon/tokenvalidate', {
            params: { token }
        });
        return response.data;
    } catch (error) {
        console.error('Token validation failed:', error);
        throw error;
    }
}

export async function queryProject() {
    try {
        const response = await axios.get('/glicon/project/query', {
            params: { projectId, token }
        });
        console.log("🚀 ~ queryProject ~ response:", response)
        return response.data;
    } catch (error) {
        console.error('Project query failed:', error);
        throw error;
    }
}


export async function queryMenu() {
    try {
        const response = await axios.get('/glicon/menu/list', {
            params: { projectId , token }
        });
        console.log("🚀 ~ queryMenu ~ response:", response)
        return response.data;
    } catch (error) {
        console.error('Menu query failed:', error);
        throw error;
    }
}

export async function querySlider({name,link}) {
    try {
        const response = await axios.get('/glicon/slider/all', {
            params: { projectId , token,name,link }
        });
        console.log("🚀 ~ querySlider ~ response:", response)
        return response.data.data || [];
    } catch (error) {
        console.error('Slider query failed:', error);
        throw error;
    }
}
