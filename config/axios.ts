import axios from "axios";
const api = axios.create({
   baseURL: "https://app-6ae2e91f.deploy.meerasolution.com/api",
   // baseURL: "http://localhost:8000/api",
   headers: {"Content-Type": "application/json"}
});

api.interceptors.request.use((config) => {
   const token = localStorage.getItem("token");
   if(token){
         config.headers.Authorization = `Bearer ${token}`;
   }
   return config;
})

export default api