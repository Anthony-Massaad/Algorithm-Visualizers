"use client";

import { cn } from "@/utils";
import { ComponentProps, ReactElement } from "react";

export const Button = ({
  className,
  children,
  ...props
}: ComponentProps<"button">): ReactElement => {
  return (
    <button className={cn("btn", className)} {...props}>
      {children}
    </button>
  );
};
