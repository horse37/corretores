import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Retorna a URL base da aplicação, considerando o ambiente
 * @returns {string} URL base da aplicação
 */
export function getBaseUrl(): string {
  // Verificar se estamos no navegador
  if (typeof window !== 'undefined') {
    // No cliente, usar a URL base do navegador
    return window.location.origin;
  }
  
  // No servidor, usar a variável de ambiente
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  if (baseUrl) {
    return baseUrl;
  }
  
  // Fallback para localhost
  return 'http://localhost:4000';
}