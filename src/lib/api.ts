import axios from "axios";

// Create an axios instance with default configuration
// You can replace the baseURL with your actual API URL when ready
const api = axios.create({
  baseURL: "https://dev.dedi.global", // Replace with your API URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  signup: (userData: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => api.post("/auth/signup", userData),

  logout: () => api.post("/auth/logout"),

  getCurrentUser: () => api.get("/auth/me"),
};

// Export the api instance for other requests
export default api;

// Get the API base URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_ENDPOINT || "https://dev.dedi.global";

// Configure default fetch options to include credentials
const defaultFetchOptions = {
  credentials: "include" as RequestCredentials,
  headers: {
    "Content-Type": "application/json",
  },
};

export interface ApiResponse<T> {
  message: string;
  data: T;
}

// Registration API call - simplified to only accept email
export async function registerUser(
  email: string
): Promise<ApiResponse<string>> {
  try {
    const response = await fetch(`${API_BASE_URL}/dedi/register`, {
      method: "POST",
      ...defaultFetchOptions,
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    // Check if the HTTP status indicates success (200-299)
    if (response.ok) {
      // For successful responses, ensure we have a success message
      if (!result.message) {
        result.message = "Registration successful";
      }
      return result;
    } else {
      // For non-success HTTP status codes, throw an error with the response message
      const errorMessage =
        result.message ||
        result.error ||
        `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error; // Re-throw existing errors
    }
    throw new Error("Network error occurred while registering");
  }
}

// Get current user info (for checking authentication status)
export async function getCurrentUser(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/dedi/auth/me`, {
      method: "GET",
      ...defaultFetchOptions,
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Not authenticated");
    }
  } catch (error) {
    throw error;
  }
}

// Get namespaces by profile (using cookie authentication)
export async function getNamespacesByProfile(): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/dedi/get-namespace-by-profile`,
      {
        method: "GET",
        ...defaultFetchOptions,
      }
    );

    if (response.ok) {
      return await response.json();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch namespaces");
    }
  } catch (error) {
    throw error;
  }
}

// Create namespace (using cookie authentication)
export async function createNamespace(namespaceData: {
  name: string;
  description: string;
  meta: any;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/dedi/create-namespace`, {
      method: "POST",
      ...defaultFetchOptions,
      body: JSON.stringify(namespaceData),
    });

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      const errorMessage =
        result.message || result.error || "Failed to create namespace";
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error occurred while creating namespace");
  }
}

// Update namespace (using cookie authentication)
export async function updateNamespace(
  namespaceId: string,
  namespaceData: {
    name: string;
    description: string;
    meta: any;
  }
): Promise<unknown> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/dedi/${namespaceId}/update-namespace`,
      {
        method: "POST",
        ...defaultFetchOptions,
        body: JSON.stringify(namespaceData),
      }
    );

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      const errorMessage =
        result.message || result.error || "Failed to update namespace";
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error occurred while updating namespace");
  }
}

// Logout function to clear authentication
export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/dedi/logout`, {
      method: "POST",
      ...defaultFetchOptions,
    });
  } catch (error) {
    // Even if logout fails on server, we'll clear client state
    console.error("Logout error:", error);
  }
}
