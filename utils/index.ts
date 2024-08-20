import clsx, { ClassValue } from "clsx";
export * from "./priorityQueue";

export const cn = (...args: ClassValue[]): string => {
  return clsx(...args);
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
