import axios from 'axios'

export function uuid() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; 
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = "-";
  return s.join("");
}

export const getToken = () => localStorage.getItem('token')
export const removeToken = () => localStorage.removeItem('token')
export const setToken = (token) => localStorage.setItem('token', token)

const service = axios.create({
  timeout: 15000
})

service.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
       // Assuming standard Bearer token or custom header. 
       // The original code in uploadFile used formData.append('token', getToken())
       // But for get/post it likely used headers or query params.
       // Without seeing the original get/post implementation, I'll add it to headers.
       config.headers['token'] = token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    return Promise.reject(error)
  }
)

export const get = (url, params) => service.get(url, { params })
export const post = (url, data) => service.post(url, data)

export const wrapUrl = (url) => url
export const getHost = () => window.location.origin
