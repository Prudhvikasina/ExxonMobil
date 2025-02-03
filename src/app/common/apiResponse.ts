export class ApiResponse {
  message ?: string;
  errorMessages ?: any[];
  result ?: any[];
  success ?: boolean;
  id ?: number; 
  isException?:boolean;
}
