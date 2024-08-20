"use client";

import { cn } from "@/utils";
import {
  ComponentProps,
  createElement,
  FunctionComponentElement,
  ReactElement,
  ReactNode,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import { FaHome, FaRoute, FaSort } from "react-icons/fa";

import { usePathname } from "next/navigation";
import { map } from "lodash";
import { IconBaseProps } from "react-icons";
import { Container } from "./Container";

interface LinkDataStructure {
  link: string;
  label: string;
  icon: FunctionComponentElement<IconBaseProps>;
}

export const Header = ({
  className,
  ...props
}: ComponentProps<"header">): ReactElement => {
  const path = usePathname();

  const links: LinkDataStructure[] = useMemo((): LinkDataStructure[] => {
    if (path === "/sorting") {
      return [
        { link: "/", label: "Home", icon: createElement(FaHome) },
        {
          link: "/path",
          label: "Path Finding Algorithms",
          icon: createElement(FaRoute),
        },
      ];
    } else if (path === "/path") {
      return [
        { link: "/", label: "Home", icon: createElement(FaHome) },
        {
          link: "/sorting",
          label: "Sorting Algorithms",
          icon: createElement(FaSort),
        },
      ];
    }
    return [
      {
        link: "/sorting",
        label: "Sorting Algorithms",
        icon: createElement(FaSort),
      },
      {
        link: "/path",
        label: "Path Finding Algorithms",
        icon: createElement(FaRoute),
      },
    ];
  }, [path]);

  return (
    <header className={cn("", className)} {...props}>
      <nav>
        <Container>
          {map(links, (link, idx) => (
            <motion.a key={idx} href={link.link} className="header-link">
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </motion.a>
          ))}
        </Container>
      </nav>
    </header>
  );
};
