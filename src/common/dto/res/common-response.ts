// case success
export interface ApiResponseFormat<T> {
  code: number;
  status: string;
  message: string;
  data: T;
}

// case error
export interface ErrorApiResponse {
  code: number;
  status: string;
  message: string | string[];
  path: string;
  timestamp: string;
}

// ใช้ใน controller
export class ApiResponse<T = any> {
  message: string;
  data: T;
}
