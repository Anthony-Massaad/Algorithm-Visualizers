"use client";

import { Button, Dropdown, Timer } from "@/component";
import { delay, ItemInQueue, PriorityQueue } from "@/utils";
import { motion } from "framer-motion";
import { map } from "lodash";
import { FC, useRef, useState } from "react";

type CellType =
  | "empty"
  | "start"
  | "end"
  | "obstacle"
  | "visited"
  | "to-be-explored"
  | "path";

type SelectedTool = "Start" | "End" | "Obstacle";

type Status = "Running" | "Path Found" | "Setup" | "Path Not Found" | "Stopped";

type Algorithms = "AStar" | "Dijkstra";

const GRID_SIZE = 42;

export const Path: FC = () => {
  const [grid, setGrid] = useState<CellType[][]>(
    Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill("empty"))
  );
  const [selectedTool, setSelectedTool] = useState<SelectedTool>("Start");
  const [status, setStatus] = useState<Status>("Setup");
  const [startNodeIndex, setStartNodeIndex] = useState<[number, number]>([
    -1, -1,
  ]);
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<Algorithms>("AStar");
  const [endNodeIndex, setEndNodeIndex] = useState<[number, number]>([-1, -1]);
  const isRunning = useRef(false);

  const updateCell = async (
    row: number,
    col: number,
    type: CellType
  ): Promise<void> => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((gridRow, rowIndex) =>
        gridRow.map((cell, colIndex) =>
          rowIndex === row && colIndex === col ? type : cell
        )
      );
      return newGrid;
    });
    await delay(25);
  };

  const resetGrid = (): void => {
    if (
      (status === "Path Found" ||
        status === "Path Not Found" ||
        status === "Stopped") &&
      isRunning.current === false
    ) {
      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((gridRow, rowIndex) => {
          return gridRow.map((cell, colIndex) => {
            if (
              cell === "to-be-explored" ||
              cell === "path" ||
              cell === "visited"
            ) {
              return "empty";
            }
            return cell;
          });
        });
        return newGrid;
      });
    }
  };

  const keyGenerator = (point: [number, number]): string =>
    `${point[0]},${point[1]}`;

  const AStarAlgorithm = async (): Promise<void> => {
    if (!isRunning.current) return;
    const heuristic = (point1: number[], point2: number[]): number => {
      return Math.abs(point1[0] - point2[0]) + Math.abs(point1[1] - point2[1]);
    };

    const newGrid = grid.map((row) => [...row]);

    const nodeList = new PriorityQueue<[number, number]>();
    const startNode: ItemInQueue<[number, number]> = {
      priority: 0,
      item: startNodeIndex,
    };

    nodeList.push(startNode);

    // the root path that is most optimal. Holds the key: the current node we are on, and the value, the node it came from
    // the algorithm can determine the exact path it took from the end back to the start node
    // at the end of the algorthm, will move backwards from the current node (string) to where it came from
    const cameFrom: Map<string, [number, number] | null> = new Map();

    // necessary to calculate the shortnest known path cost of each node
    // allows for the algorithm to find the optimal path while exploring the grid
    // known as "g-cost" and represents the distance cost from the starting node to the current node
    const costSoFar: Map<string, number> = new Map();

    cameFrom.set(keyGenerator(startNodeIndex), null);
    costSoFar.set(keyGenerator(startNodeIndex), 0);

    const updateVisitedAndExplored = async (currentNode: [number, number]) => {
      if (!isRunning.current) return;
      if (
        currentNode[0] === startNodeIndex[0] &&
        currentNode[1] === startNodeIndex[1]
      )
        return;
      if (
        currentNode[0] === endNodeIndex[0] &&
        currentNode[1] === endNodeIndex[1]
      )
        return;
      newGrid[currentNode[0]][currentNode[1]] = "visited";
      await updateCell(currentNode[0], currentNode[1], "visited");
    };

    const updateToBeExplored = async (neighbor: [number, number]) => {
      if (
        newGrid[neighbor[0]][neighbor[1]] === "empty" ||
        newGrid[neighbor[0]][neighbor[1]] === "to-be-explored"
      ) {
        newGrid[neighbor[0]][neighbor[1]] = "to-be-explored";
        await updateCell(neighbor[0], neighbor[1], "to-be-explored");
      }
    };

    const reconstructPath = async (currentNode: [number, number]) => {
      if (!isRunning.current) return;
      let path: [number, number][] = [];
      let node: [number, number] | null = currentNode;
      let reachedStart = false;
      while (node) {
        if (
          (node[0] === startNodeIndex[0] && node[1] === startNodeIndex[1]) ||
          (node[0] === endNodeIndex[0] && node[1] === endNodeIndex[1])
        ) {
          if (reachedStart) {
            break;
          }
          reachedStart = true;
        } else {
          path.push(node);
        }
        node = cameFrom.get(keyGenerator(node)) || null;
      }
      path = path.reverse();
      for (const [row, col] of path) {
        newGrid[row][col] = "path";
        await updateCell(row, col, "path");
      }
    };

    // all possible directions from the current node being investigated
    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];

    while (!nodeList.isEmpty()) {
      if (!isRunning.current) return;
      // Get the node with the lowest priority (cost + heuristic)
      const currentNode = nodeList.pop()?.item;
      if (!currentNode) break;

      await updateVisitedAndExplored(currentNode);

      if (
        currentNode[0] === endNodeIndex[0] &&
        currentNode[1] === endNodeIndex[1]
      ) {
        await reconstructPath(currentNode);
        setStatus("Path Found");
        isRunning.current = false;
        return;
      }

      // Explore the neighbors of the current node
      for (const direction of directions) {
        const neighbor: [number, number] = [
          currentNode[0] + direction[0],
          currentNode[1] + direction[1],
        ];

        if (
          neighbor[0] < 0 ||
          neighbor[1] < 0 ||
          neighbor[0] >= GRID_SIZE ||
          neighbor[1] >= GRID_SIZE
        ) {
          continue;
        }

        if (newGrid[neighbor[0]][neighbor[1]] === "obstacle") {
          continue;
        }

        await updateToBeExplored(neighbor);

        const newCost = (costSoFar.get(keyGenerator(currentNode)) || 0) + 1;
        const neighborKey = keyGenerator(neighbor);

        // If this path to the neighbor is cheaper, or the neighbor hasn't been visited yet
        if (
          !costSoFar.has(neighborKey) ||
          newCost < costSoFar.get(neighborKey)!
        ) {
          costSoFar.set(neighborKey, newCost);
          const priority = newCost + heuristic(neighbor, endNodeIndex);
          nodeList.push({ priority, item: neighbor });
          cameFrom.set(neighborKey, currentNode);
        }
      }
    }

    setStatus("Path Not Found");
    isRunning.current = false;
    return;
  };

  const DijkstraAlgorithm = async (): Promise<void> => {
    if (!isRunning.current) return;

    const newGrid = grid.map((row) => [...row]);

    const nodeList = new PriorityQueue<[number, number]>();
    const startNode: ItemInQueue<[number, number]> = {
      priority: 0,
      item: startNodeIndex,
    };

    nodeList.push(startNode);

    // the root path that is most optimal. Holds the key: the current node we are on, and the value, the node it came from
    // the algorithm can determine the exact path it took from the end back to the start node
    // at the end of the algorthm, will move backwards from the current node (string) to where it came from
    const cameFrom: Map<string, [number, number] | null> = new Map();

    // necessary to calculate the shortnest known path cost of each node
    // allows for the algorithm to find the optimal path while exploring the grid
    // known as "g-cost" and represents the distance cost from the starting node to the current node
    const costSoFar: Map<string, number> = new Map();

    cameFrom.set(keyGenerator(startNodeIndex), null);
    costSoFar.set(keyGenerator(startNodeIndex), 0);

    const updateVisitedAndExplored = async (currentNode: [number, number]) => {
      if (!isRunning.current) return;
      if (
        currentNode[0] === startNodeIndex[0] &&
        currentNode[1] === startNodeIndex[1]
      )
        return;
      if (
        currentNode[0] === endNodeIndex[0] &&
        currentNode[1] === endNodeIndex[1]
      )
        return;
      newGrid[currentNode[0]][currentNode[1]] = "visited";
      await updateCell(currentNode[0], currentNode[1], "visited");
    };

    const updateToBeExplored = async (neighbor: [number, number]) => {
      if (
        newGrid[neighbor[0]][neighbor[1]] === "empty" ||
        newGrid[neighbor[0]][neighbor[1]] === "to-be-explored"
      ) {
        newGrid[neighbor[0]][neighbor[1]] = "to-be-explored";
        await updateCell(neighbor[0], neighbor[1], "to-be-explored");
      }
    };

    const reconstructPath = async (currentNode: [number, number]) => {
      if (!isRunning.current) return;
      let path: [number, number][] = [];
      let node: [number, number] | null = currentNode;
      let reachedStart = false;
      while (node) {
        if (
          (node[0] === startNodeIndex[0] && node[1] === startNodeIndex[1]) ||
          (node[0] === endNodeIndex[0] && node[1] === endNodeIndex[1])
        ) {
          if (reachedStart) {
            break;
          }
          reachedStart = true;
        } else {
          path.push(node);
        }
        node = cameFrom.get(keyGenerator(node)) || null;
      }
      path = path.reverse();
      for (const [row, col] of path) {
        newGrid[row][col] = "path";
        await updateCell(row, col, "path");
      }
    };

    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];

    while (!nodeList.isEmpty()) {
      if (!isRunning.current) return;
      const currentNode = nodeList.pop()?.item;
      if (!currentNode) break;

      await updateVisitedAndExplored(currentNode);

      if (
        currentNode[0] === endNodeIndex[0] &&
        currentNode[1] === endNodeIndex[1]
      ) {
        await reconstructPath(currentNode);
        setStatus("Path Found");
        isRunning.current = false;
        return;
      }

      for (const direction of directions) {
        const neighbor: [number, number] = [
          currentNode[0] + direction[0],
          currentNode[1] + direction[1],
        ];

        if (
          neighbor[0] < 0 ||
          neighbor[1] < 0 ||
          neighbor[0] >= GRID_SIZE ||
          neighbor[1] >= GRID_SIZE
        ) {
          continue;
        }

        if (newGrid[neighbor[0]][neighbor[1]] === "obstacle") {
          continue;
        }

        await updateToBeExplored(neighbor);

        const newCost = (costSoFar.get(keyGenerator(currentNode)) || 0) + 1;
        const neighborKey = keyGenerator(neighbor);

        if (
          !costSoFar.has(neighborKey) ||
          newCost < costSoFar.get(neighborKey)!
        ) {
          costSoFar.set(neighborKey, newCost);
          nodeList.push({ priority: newCost, item: neighbor });
          cameFrom.set(neighborKey, currentNode);
        }
      }
    }

    setStatus("Path Not Found");
    isRunning.current = false;
    return;
  };

  const renderCell = (cell: CellType, row: number, col: number) => {
    return (
      <div
        key={`cell-${row}-${col}`}
        className={`cell ${
          grid[row][col] === "start"
            ? "start"
            : grid[row][col] === "end"
            ? "end"
            : grid[row][col] === "obstacle"
            ? "obstacle"
            : grid[row][col] === "visited"
            ? "visited"
            : grid[row][col] === "to-be-explored"
            ? "to-be-explored"
            : grid[row][col] === "path"
            ? "path"
            : ""
        }`}
        onClick={() => {
          if (status === "Running") return;
          setStatus("Setup");
          resetGrid();

          if (selectedTool === "Start") {
            setGrid((prevGrid) => {
              const newGrid = [...prevGrid];
              if (startNodeIndex[0] !== -1 && startNodeIndex[1] !== -1) {
                newGrid[startNodeIndex[0]][startNodeIndex[1]] = "empty";
              }
              newGrid[row][col] = "start";
              return newGrid;
            });
            setStartNodeIndex([row, col]);
          } else if (selectedTool === "End") {
            setGrid((prevGrid) => {
              const newGrid = [...prevGrid];
              if (endNodeIndex[0] !== -1 && endNodeIndex[1] !== -1) {
                newGrid[endNodeIndex[0]][endNodeIndex[1]] = "empty";
              }
              newGrid[row][col] = "end";
              return newGrid;
            });
            setEndNodeIndex([row, col]);
          } else if (selectedTool === "Obstacle") {
            if (grid[row][col] === "empty") {
              setGrid((prevGrid) => {
                const newGrid = [...prevGrid];
                newGrid[row][col] = "obstacle";
                return newGrid;
              });
            } else if (grid[row][col] === "obstacle") {
              setGrid((prevGrid) => {
                const newGrid = [...prevGrid];
                newGrid[row][col] = "empty";
                return newGrid;
              });
            }
          }
        }}
      >
        {grid[row][col] === "path" && (
          <motion.div
            initial={{ width: 0, height: 0 }}
            animate={{ width: "100%", height: "100%" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              backgroundColor: "lightblue",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="path-container">
      <h1>Path Finding Algorithms</h1>
      <Dropdown
        className={isRunning.current ? "disabled" : ""}
        options={[
          { label: "AStar", value: "AStar" },
          { label: "Dijkstra", value: "Dijkstra" },
        ]}
        onSelect={(value) => setSelectedAlgorithm(value as Algorithms)}
        selected={selectedAlgorithm === "AStar" ? "AStar" : "Dijkstra"}
      />
      <p style={{ marginTop: "0.5rem" }}>
        <strong>Purple Cells</strong> indicated visited points and{" "}
        <strong>Green Cells</strong> indicates to be explored
      </p>
      <p>
        <strong>Blue Cell</strong> indicates the start point
      </p>
      <p>
        <strong>Red Cell</strong> indicates the end point
      </p>
      <div className="controls more">
        <Button
          className={
            selectedTool === "Start" || isRunning.current ? "disabled" : ""
          }
          onClick={() => {
            setSelectedTool("Start");
          }}
        >
          Set Start Node
        </Button>
        <Button
          className={
            selectedTool === "End" || isRunning.current ? "disabled" : ""
          }
          onClick={() => {
            setSelectedTool("End");
          }}
        >
          Set End Node
        </Button>
        <Button
          className={
            selectedTool === "Obstacle" || isRunning.current ? "disabled" : ""
          }
          onClick={() => {
            setSelectedTool("Obstacle");
          }}
        >
          Set Obstacles
        </Button>
        <Button
          onClick={() => {
            resetGrid();
            isRunning.current = true;

            if (selectedAlgorithm === "AStar") {
              AStarAlgorithm();
            } else if (selectedAlgorithm === "Dijkstra") {
              DijkstraAlgorithm();
            }

            setStatus("Running");
          }}
          className={
            (startNodeIndex[0] === -1 && startNodeIndex[1] === -1) ||
            (endNodeIndex[0] === -1 && endNodeIndex[1] === -1) ||
            isRunning.current
              ? "disabled"
              : ""
          }
        >
          Run
        </Button>
      </div>
      <div className="controls more">
        <Button
          className={isRunning.current ? "disabled" : ""}
          onClick={() => {
            setStartNodeIndex([-1, -1]);
            setEndNodeIndex([-1, -1]);
            setGrid(
              Array(GRID_SIZE)
                .fill(null)
                .map(() => Array(GRID_SIZE).fill("empty"))
            );
            setSelectedTool("Start");
            setStatus("Setup");
          }}
        >
          Reset
        </Button>
        <Button
          className={!isRunning.current ? "disabled" : ""}
          onClick={() => {
            setStatus("Stopped");
            isRunning.current = false;
          }}
        >
          Stop
        </Button>
      </div>
      <div className="grid">
        <span className="action">
          Action: Set <u>{selectedTool}</u> Node
        </span>
        <span className="status">
          Status: <u>{status}</u>
        </span>
        <Timer
          isRunning={isRunning.current}
          className="timer"
          reset={status === "Setup"}
        />
        {map(grid, (row, rowIndex) =>
          map(row, (cell, colIndex) => renderCell(cell, rowIndex, colIndex))
        )}
      </div>
    </div>
  );
};
