// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

let authToken = localStorage.getItem("authToken");

const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
};

export const getAuthToken = () => authToken;

export const stateAPI = {
  get: async () => {
    const response = await fetch(`${API_BASE_URL}/state`, { headers: headers() });
    return handleResponse(response);
  },
  save: async (state) => {
    const response = await fetch(`${API_BASE_URL}/state`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(state),
    });
    return handleResponse(response);
  },
};

const headers = () => ({
  "Content-Type": "application/json",
  ...(authToken && { Authorization: `Bearer ${authToken}` }),
});

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "API Error");
  }
  return response.json();
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(response);
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  signup: async (name, email, password, department_id) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ name, email, password, department_id }),
    });
    const data = await handleResponse(response);
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  logout: () => {
    setAuthToken(null);
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, { headers: headers() });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, { headers: headers() });
    return handleResponse(response);
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: headers(),
    });
    return handleResponse(response);
  },

  getDepartments: async () => {
    const response = await fetch(`${API_BASE_URL}/users/departments`, { headers: headers() });
    return handleResponse(response);
  },
};

// Assets API
export const assetsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/assets`, { headers: headers() });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/assets/${id}`, { headers: headers() });
    return handleResponse(response);
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/assets`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
      method: "DELETE",
      headers: headers(),
    });
    return handleResponse(response);
  },

  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/assets/categories/list`, { headers: headers() });
    return handleResponse(response);
  },
};

// Bookings API
export const bookingsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/bookings`, { headers: headers() });
    return handleResponse(response);
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  cancel: async (id) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, {
      method: "PUT",
      headers: headers(),
    });
    return handleResponse(response);
  },
};

// Maintenance API
export const maintenanceAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/maintenance`, { headers: headers() });
    return handleResponse(response);
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/maintenance`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  resolve: async (id) => {
    const response = await fetch(`${API_BASE_URL}/maintenance/${id}/resolve`, {
      method: "PUT",
      headers: headers(),
    });
    return handleResponse(response);
  },
};

// Transfers API
export const transfersAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/transfers`, { headers: headers() });
    return handleResponse(response);
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/transfers`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  approve: async (id) => {
    const response = await fetch(`${API_BASE_URL}/transfers/${id}/approve`, {
      method: "PUT",
      headers: headers(),
    });
    return handleResponse(response);
  },

  reject: async (id) => {
    const response = await fetch(`${API_BASE_URL}/transfers/${id}/reject`, {
      method: "PUT",
      headers: headers(),
    });
    return handleResponse(response);
  },
};

// Audits API
export const auditsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/audits`, { headers: headers() });
    return handleResponse(response);
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/audits`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateItem: async (auditId, assetId, result) => {
    const response = await fetch(`${API_BASE_URL}/audits/${auditId}/items/${assetId}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ result }),
    });
    return handleResponse(response);
  },

  close: async (id) => {
    const response = await fetch(`${API_BASE_URL}/audits/${id}/close`, {
      method: "PUT",
      headers: headers(),
    });
    return handleResponse(response);
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`, { headers: headers() });
    return handleResponse(response);
  },

  markRead: async (id) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "PUT",
      headers: headers(),
    });
    return handleResponse(response);
  },

  getLogs: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/logs`, { headers: headers() });
    return handleResponse(response);
  },
};

