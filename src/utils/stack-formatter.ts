export interface StackInfo {
  frontend: string;
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

  const parts = [
    `Frontend: ${stack.frontend}`,
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

  return `Technology Stack: ${stack.frontend} + ${stack.backend} + ${stack.database}`;
}