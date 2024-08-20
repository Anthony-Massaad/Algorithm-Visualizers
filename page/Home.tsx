"use client";

import { FC } from "react";
import Image from "next/image";
import Link from "next/link";

interface LinksStructure {
  name: string;
  picture: string;
  description: string;
  link: string;
}

const links: LinksStructure[] = [
  {
    name: "Path Finding Algorithms",
    picture: "/pathAlgorithm.png",
    description: "Visualize the path finding algorithms of A* and Dijkstra",
    link: "/path",
  },
  {
    name: "Sorting Algorithms",
    picture: "/sortingAlgorithms.png",
    description:
      "Explore various sorting algorithms such as bubble sort, selection sort, and merge sort.",
    link: "/sorting",
  },
];

export const HomePage: FC = () => {
  const LinkCard = ({ name, picture, description, link }: LinksStructure) => {
    return (
      <Link href={link} className="link">
        <Image src={picture} alt={name} width={300} height={200} />
        <div className="content">
          <div className="name">{name}</div>
          <div className="description">{description}</div>
        </div>
      </Link>
    );
  };

  return (
    <div className="home-page-container">
      <h1>Algorithm Visualizations</h1>
      <div className="links">
        {links.map((link) => (
          <LinkCard key={link.name} {...link} />
        ))}
      </div>
    </div>
  );
};
