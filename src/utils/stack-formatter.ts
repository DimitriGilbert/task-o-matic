import type { BTSFrontend } from "../types/index.js";

export interface StackInfo {
  frontend: BTSFrontend | BTSFrontend[];
  backend: string;
  database: string;
  orm: string;
  auth: string;
  addons: string[];
}

export function formatStackInfo(stack: StackInfo | null | undefined): string {
  if (!stack) {
    return "Not detected";
  }

  const frontendStr = Array.isArray(stack.frontend)
    ? stack.frontend.join(", ")
    : stack.frontend;

  const parts = [
    `Frontend: ${frontendStr}`,
    `Backend: ${stack.backend}`
  ];
  
  if (stack.database !== 'none') {
    parts.push(`Database: ${stack.database}`);
  }
  
  if (stack.orm !== 'none') {
    parts.push(`ORM: ${stack.orm}`);
  }
  
  parts.push(`Auth: ${stack.auth}`);
  
  if (stack.addons.length > 0) {
    parts.push(`Addons: ${stack.addons.join(", ")}`);
  }
  
  return parts.join(", ");
}

export function formatStackForContext(stack: StackInfo | null | undefined): string {
  if (!stack) {
    return "";
  }

  const frontendStr = Array.isArray(stack.frontend)
    ? stack.frontend.join(" + ")
    : stack.frontend;

  return `Technology Stack: ${frontendStr} + ${stack.backend} + ${stack.database}`;
}