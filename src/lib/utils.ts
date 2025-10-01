import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to convert MongoDB ObjectId to string for display
export function getObjectIdString(objId: { $oid: string } | string): string {
  if (typeof objId === 'string') {
    return objId;
  }
  return objId.$oid;
}

// Utility function to create ObjectId structure for API calls
export function createObjectIdStructure(id: string): { $oid: string } {
  return { $oid: id };
}