const axios = require('axios');
const { BASE_URL, PROJECT_ID, TOKEN } = require('./config');

async function fetchApi(endpoint, params = {}) {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params: { ...params, projectId: PROJECT_ID },
      headers: { token: TOKEN },
      timeout: 30000
    });
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error.message);
    return null;
  }
}

async function fetchProject() {
  const project = await fetchApi('/project/query');
  return project || { name: 'My Project' };
}

async function fetchMenus() {
  const menus = await fetchApi('/menu/list');
  return menus || [];
}

async function fetchSliders(menuLink) {
  const sliders = await fetchApi('/slider/list', { link: menuLink });
  return sliders || [];
}

async function fetchDoc(menuLink, itemLink, itemName) {
  const doc = await fetchApi('/slider/item/list', { link: menuLink, item: itemLink, name: itemName });
  return doc || '';
}

module.exports = {
  fetchApi,
  fetchProject,
  fetchMenus,
  fetchSliders,
  fetchDoc
};
