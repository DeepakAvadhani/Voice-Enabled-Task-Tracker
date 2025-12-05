import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: new Date().getTime()
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      
      if (error.response.status === 401) {
        console.error('Unauthorized access');
      } else if (error.response.status === 404) {
        console.error('Resource not found');
      } else if (error.response.status === 500) {
        console.error('Server error');
      }
    } else if (error.request) {
      console.error('No response from server');
    } else {
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);


export const taskAPI = {
  getAllTasks: async (params = {}) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  searchTasks: async (query) => {
    const response = await api.get('/tasks/search/query', {
      params: { q: query }
    });
    return response.data;
  },

  filterByStatus: async (status) => {
    const response = await api.get(`/tasks/filter/status/${status}`);
    return response.data;
  },

  filterByPriority: async (priority) => {
    const response = await api.get(`/tasks/filter/priority/${priority}`);
    return response.data;
  },

  getUpcomingTasks: async (days = 7) => {
    const response = await api.get('/tasks/upcoming', {
      params: { days }
    });
    return response.data;
  },

  getOverdueTasks: async () => {
    const response = await api.get('/tasks/overdue');
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/tasks/statistics');
    return response.data;
  },
};


export const voiceAPI = {
  parseText: async (transcript) => {
    const response = await api.post('/tasks/parse', { transcript });
    return response.data;
  },

  transcribeAudio: async (audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await api.post('/tasks/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  transcribeAndParse: async (audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await api.post('/tasks/transcribe-parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;