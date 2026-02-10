import axios from "axios";
import { getToken } from "@/utils";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const service = axios.create({
  timeout: 15000,
});

service.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      // Assuming standard Bearer token or custom header.
      // The original code in uploadFile used formData.append('token', getToken())
      // But for get/post it likely used headers or query params.
      // Without seeing the original get/post implementation, I'll add it to headers.
      config.headers["token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

service.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const get = (url, params) => service.get(url, { params });
export const post = (url, data, config) => service.post(url, data, config);

const TEST_TOKEN = "";
const TEST_PROJECT_ID = "";

// Helper to get token (param > localStorage > test constant)
const resolveToken = (token) => token || getToken() || TEST_TOKEN;
const resolveProjectId = (projectId) => projectId || TEST_PROJECT_ID;

// 验证token是否有效
// 结果示例{ok: true}
export async function validateToken(token) {
  try {
    const response = await get("/api/tokenvalidate", {
      token: resolveToken(token),
    });
    return response;
  } catch (error) {
    console.error("Token validation failed:", error);
    throw error;
  }
}

// 结果示例
// {
//     "ok": true,
//     "message": "success",
//     "data": {
//         "hero": {
//             "id": "N-KUsUZgmt9J7JUcTITZd",
//             "name": "",
//             "text": "",
//             "tagline": "",
//             "features": []
//         }
//     }
// }
export async function queryProject({ projectId, token }) {
  try {
    const response = await get("/api/project/query", {
      projectId: resolveProjectId(projectId),
      token: resolveToken(token),
    });
    console.log("🚀 ~ queryProject ~ response:", response);
    return response;
  } catch (error) {
    console.error("Project query failed:", error);
    throw error;
  }
}

export async function queryMenu({ projectId, token }) {
  try {
    const response = await get("/api/menu/list", {
      projectId: resolveProjectId(projectId),
      token: resolveToken(token),
    });
    return response.data || [];
  } catch (error) {
    console.error("Menu query failed:", error);
    throw error;
  }
}

// {
//     "ok": true,
//     "message": "success",
//     "data": [
//         {
//             "id": "yE9UNqhD5P6cYLaC5vpfK",
//             "link": "YANGSHI",
//             "name": "样式",
//             "sliders": [
//                 {
//                     "name": "介绍",
//                     "group": false,
//                     "link": "introduce"
//                 }
//             ]
//         },
//         {
//             "id": "MxLPcWk-XmT17d0oaJOUj",
//             "link": "CHAJIAN",
//             "name": "插件",
//             "sliders": [
//                 {
//                     "name": "介绍",
//                     "group": false,
//                     "link": "introduce"
//                 }
//             ]
//         },
//         {
//             "id": "rC3O170r9we3z59seaarI",
//             "link": "BOKE",
//             "name": "博客",
//             "sliders": [
//                 {
//                     "name": "关于怎么写好博客的文章",
//                     "group": false,
//                     "link": "introduce",
//                     "isActive": false
//                 },
//             ]
//         },
//         {
//             "id": "daz0679cL3xtdvP6e32Sq",
//             "link": "KAIFAJIHUA",
//             "name": "开发计划",
//             "sliders": [
//                 {
//                     "name": "介绍",
//                     "group": false,
//                     "link": "introduce"
//                 }
//             ]
//         },
//     ]
// }
export async function querySlider({ projectId, token, name, link }) {
  try {
    const response = await get("/api/slider/all", {
      projectId: resolveProjectId(projectId),
      token: resolveToken(token),
      name,
      link,
    });
    console.log("🚀 ~ querySlider ~ response:", response);
    return response.data || [];
  } catch (error) {
    console.error("Slider query failed:", error);
    throw error;
  }
}

// [
//     {
//         "name": "mdpress介绍",
//         "group": false,
//         "link": "introduce",
//         "isActive": false
//     },
//     {
//         "name": "999",
//         "group": true,
//         "link": "12313",
//         "isActive": false,
//         "children": [
//             {
//                 "name": "123456",
//                 "group": false,
//                 "link": "123456",
//                 "isActive": false
//             },
//             {
//                 "name": "789",
//                 "group": false,
//                 "link": "789",
//                 "isActive": false
//             }
//         ]
//     },
// ]
export async function querySliderList({ projectId, token, name, link }) {
  try {
    const response = await get("/api/slider/list", {
      projectId: resolveProjectId(projectId),
      token: resolveToken(token),
      name,
      link,
    });
    console.log("🚀 ~ querySlider ~ response:", response);
    return response.data || [];
  } catch (error) {
    console.error("Slider query failed:", error);
    throw error;
  }
}

export async function sortMenu({ projectId, token, data }) {
  try {
    const response = await post(
      "/api/menu/sort",
      {
        projectId: resolveProjectId(projectId),
        data,
      },
      {
        params: { token: resolveToken(token) },
      },
    );
    return response;
  } catch (error) {
    console.error("Menu sort failed:", error);
    throw error;
  }
}

export async function saveMenu({ projectId, token, name, link }) {
  try {
    const response = await post(
      "/api/menu/save",
      {
        projectId: resolveProjectId(projectId),
        name,
        link,
      },
      {
        params: { token: resolveToken(token) },
      },
    );
    return response;
  } catch (error) {
    console.error("Menu save failed:", error);
    throw error;
  }
}

export async function saveSlider({ projectId, token, link, data }) {
  try {
    const response = await post(
      "/api/slider/save",
      {
        projectId: resolveProjectId(projectId),
        link,
        data,
      },
      {
        params: { token: resolveToken(token) },
      },
    );
    return response;
  } catch (error) {
    console.error("Slider save failed:", error);
    throw error;
  }
}

// {
//     "ok": true,
//     "message": "success",
//     "data": "<iframe src=\"https://markdown.com.cn/cheat-sheet.html#%E6%80%BB%E8%A7%88\"></iframe>\r\n\r\n\r\n123"
// }
export async function queryDoc({ projectId, token, link, item, name }) {
  try {
    const response = await get("/api/slider/item/list", {
      projectId: resolveProjectId(projectId),
      token: resolveToken(token),
      link,
      item,
      name,
    });
    return response.data || "";
  } catch (error) {
    console.error("Doc query failed:", error);
    throw error;
  }
}

// {
//     "ok": true,
//     "message": "success"
// }
export async function saveDoc({ projectId, token, link, item, data }) {
  try {
    const response = await post(
      "/api/slider/item/save",
      {
        projectId: resolveProjectId(projectId),
        link,
        item,
        data,
      },
      {
        params: { token: resolveToken(token) },
      },
    );
    return response;
  } catch (error) {
    console.error("Doc save failed:", error);
    throw error;
  }
}

// Project APIs
// {
//     "ok": true,
//     "message": "success",
//     "data": [
//         {
//             "id": "1X3fCwkSwCBUcWFFlJvEc",
//             "name": "test"
//         }
//     ]
// }
export async function queryProjectList({ token }) {
  try {
    const response = await get("/api/project/list", {
      token: resolveToken(token),
    });
    return response.data || [];
  } catch (error) {
    console.error("Project list query failed:", error);
    throw error;
  }
}

// {
//     "ok": true,
//     "message": "success",
//     "data": [
//         {
//             "id": "N-KUsUZgmt9J7JUcTITZd",
//             "name": "gishai"
//         }
//     ]
// }
export async function queryCollaborateProjects({ token }) {
  try {
    const response = await get("/api/project/collaborate", {
      token: resolveToken(token),
    });
    console.log("🚀 ~ queryCollaborateProjects ~ response:", response);
    return response.data || [];
  } catch (error) {
    console.error("Collaborate projects query failed:", error);
    throw error;
  }
}

export async function saveProject({ name, token }) {
  try {
    const response = await post(
      "/api/project/save",
      {
        name,
      },
      {
        params: { token: resolveToken(token) },
      },
    );
    return response;
  } catch (error) {
    console.error("Project save failed:", error);
    throw error;
  }
}

export async function updateProject({ id, name, token }) {
  try {
    const response = await post(
      "/api/project/update",
      {
        id,
        name,
      },
      {
        params: { token: resolveToken(token) },
      },
    );
    return response;
  } catch (error) {
    console.error("Project update failed:", error);
    throw error;
  }
}

// {
//     "ok": true,
//     "message": "success"
// }
export async function buildProject({ projectId, token }) {
  try {
    // Try local build endpoint first (dev environment)
    if (import.meta.env.DEV) {
      try {
        const response = await get("/api/local-build", {
          projectId: resolveProjectId(projectId),
        });
        if (response && response.success) {
          return response;
        }
      } catch (e) {
        console.warn("Local build failed, falling back to remote build", e);
      }
    }

    const response = await get("/api/project/build", {
      projectId: resolveProjectId(projectId),
      token: resolveToken(token),
    });
    return response;
  } catch (error) {
    console.error("Project build failed:", error);
    throw error;
  }
}

export async function queryProjectProfile({ projectId, token }) {
  try {
    const response = await post(
      "/api/project/profile",
      {
        projectId: resolveProjectId(projectId),
        query: true,
      },
      {
        params: { token: resolveToken(token) },
      },
    );
    return response;
  } catch (error) {
    console.error("Project profile query failed:", error);
    throw error;
  }
}

export async function saveProjectProfile({ projectId, profileData, token }) {
  try {
    const response = await post(
      "/api/project/profile",
      {
        projectId: resolveProjectId(projectId),
        ...profileData,
      },
      {
        params: { token: resolveToken(token) },
      },
    );
    return response;
  } catch (error) {
    console.error("Project profile save failed:", error);
    throw error;
  }
}

export async function searchUser({ keywords, token }) {
  try {
    const response = await get("/api/userinfo/search", {
      keywords,
      token: resolveToken(token),
    });
    return response.data || [];
  } catch (error) {
    console.error("User search failed:", error);
    throw error;
  }
}

export async function queryProjectLinkUsers({ projectId, token }) {
  try {
    const response = await get("/api/project_link/users", {
      projectId: resolveProjectId(projectId),
      token: resolveToken(token),
    });
    return response.data || [];
  } catch (error) {
    console.error("Project link users query failed:", error);
    throw error;
  }
}

export async function saveProjectLinkUser({ projectId, uid, email, token }) {
  try {
    const response = await post(
      "/api/project_link/save",
      {
        projectId: resolveProjectId(projectId),
        uid,
        email,
      },
      {
        params: { token: resolveToken(token) },
      },
    );
    return response;
  } catch (error) {
    console.error("Project link user save failed:", error);
    throw error;
  }
}

export async function deleteProjectLinkUser({ projectId, uid, token }) {
  try {
    const response = await get("/api/project_link/delete", {
      projectId: resolveProjectId(projectId),
      uid,
      token: resolveToken(token),
    });
    return response;
  } catch (error) {
    console.error("Project link user delete failed:", error);
    throw error;
  }
}

// User Info APIs
export async function queryUserInfo({ token } = {}) {
  try {
    const response = await get("/api/userinfo/query", {
      token: resolveToken(token),
    });
    return response.data || {};
  } catch (error) {
    console.error("User info query failed:", error);
    throw error;
  }
}

export async function updateUserInfoName({ name, token }) {
  try {
    const response = await post(
      "/api/userinfo/updatename",
      {
        name,
      },
      {
        params: { token: resolveToken(token) },
      },
    );
    return response;
  } catch (error) {
    console.error("Update user name failed:", error);
    throw error;
  }
}

export async function refreshUserToken({ token } = {}) {
  try {
    const response = await post(
      "/api/userinfo/refreshtoken",
      {},
      {
        params: { token: resolveToken(token) },
      },
    );
    return response;
  } catch (error) {
    console.error("Refresh token failed:", error);
    throw error;
  }
}

// Login/Register APIs
export async function sendVerifyCode({ email }) {
  try {
    const response = await get("/api/user/vercode", {
      email,
    });
    return response;
  } catch (error) {
    console.error("Send verify code failed:", error);
    throw error;
  }
}

export async function registerUser({ email, password, code }) {
  try {
    const response = await post("/api/user/register", {
      email,
      password,
      code,
    });
    return response;
  } catch (error) {
    console.error("Register failed:", error);
    throw error;
  }
}

export async function loginUser({ email, password }) {
  try {
    const response = await post("/api/user/login", {
      email,
      password,
    });
    return response || {};
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}
/**
 *
 * @param {*} data
 * @returns
 * @example
 * const data = new FormData();
 * data.append("token", getToken());
 * data.append("avatar", file);
 * 结果示例
 * {
 *   "ok": true,
 *   "message": "successfully",
 *   "fileName": "files/2026-02-04/GxvlEebLMgKu3sfImYR3i.png"
 *   }
 */
export async function uploadImageFile(data) {
  try {
    const response = await post("/api/file/upload", data);
    return response || {};
  } catch (error) {
    console.error("Upload image failed:", error);
    throw error;
  }
}
