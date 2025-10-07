import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptors para manejo de errores
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Manejar autenticación si es necesario
          console.error('Unauthorized access');
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos genéricos
  async get<T>(url: string, config?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.get<ApiResponse<T>>(url, config);
  }

  async post<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.post<ApiResponse<T>>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.put<ApiResponse<T>>(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.patch<ApiResponse<T>>(url, data, config);
  }

  async delete<T>(url: string, config?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.delete<ApiResponse<T>>(url, config);
  }
}

// Exportar instancia singleton
export const apiClient = new ApiClient();
