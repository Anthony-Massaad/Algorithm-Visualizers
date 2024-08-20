import { cn } from "@/utils";
import { ComponentProps, ReactElement } from "react";

export const Container = ({
  className,
  children,
  ...props
}: ComponentProps<"div">): ReactElement => {
  return (
    <div className={cn("container", className)} {...props}>
      {children}
    </div>
  );
};
