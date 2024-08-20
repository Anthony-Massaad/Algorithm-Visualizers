"use client";

import { Button, Dropdown, Timer } from "@/component";
import { delay } from "@/utils";
import { motion } from "framer-motion";
import { includes, isEmpty, map } from "lodash";
import { FC, useEffect, useRef, useState } from "react";

type AlgorithmTypes = "selection" | "bubble" | "merge";

type SortingStatus = "Randomized" | "Sorting..." | "Sorted" | "Stopped";

export const Sorting: FC = () => {
  const [array, setArray] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [swapIndex, setSwapIndex] = useState(-1);
  const [comparingIndex, setComparingIndex] = useState(-1);
  const [sortedIndex, setSortedIndex] = useState<number[]>([]);
  const [algorithm, setAlgorithm] = useState<AlgorithmTypes>("selection");
  const [sortingStatus, setSortingStatus] =
    useState<SortingStatus>("Randomized");
  const isSortingActive = useRef(false);

  const generateRandomArray = (length: number) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 50) + 1);
  };

  useEffect(() => {
    setArray(generateRandomArray(50));
  }, []);

  useEffect(() => {
    if (!isEmpty(array) && isActive) {
      setSortingStatus("Sorting...");
      isSortingActive.current = true;
      if (algorithm === "selection") {
        selectionSort();
      } else if (algorithm === "bubble") {
        bubbleSort();
      } else if (algorithm === "merge") {
        mergeSort();
      }
    } else {
      isSortingActive.current = false;
    }
  }, [isActive]);

  const finishedAlgorithm = async () => {
    setSortingStatus("Sorted");
    for (let i = 0; i < array.length; i++) {
      if (!isSortingActive.current) return;
      setSortedIndex((prev) => [...prev, i]);
      await delay(100);
    }
    setIsActive(false);
  };

  const selectionSort = async () => {
    let arr = [...array];
    for (let i = 0; i < arr.length; i++) {
      if (!isSortingActive.current) return;
      let minIndex = i;
      setCurrentIndex(i);
      for (let j = i + 1; j < arr.length; j++) {
        if (!isSortingActive.current) return;
        setComparingIndex(j);
        if (arr[j] < arr[minIndex]) {
          minIndex = j;
        }
        await delay(100);
      }
      if (minIndex !== i) {
        setSwapIndex(minIndex);
        await swap(arr, i, minIndex);
      }
      setSwapIndex(-1);
      setComparingIndex(-1);
      await delay(100);
    }
    setCurrentIndex(-1);
    finishedAlgorithm();
  };

  const bubbleSort = async () => {
    let arr = [...array];
    for (let i = 0; i < arr.length; i++) {
      if (!isSortingActive.current) return;
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (!isSortingActive.current) return;
        setCurrentIndex(j);
        setComparingIndex(j + 1);
        if (arr[j] > arr[j + 1]) {
          setSwapIndex(j + 1);
          await swap(arr, j, j + 1);
        }
        await delay(100);
      }
      setSwapIndex(-1);
      setComparingIndex(-1);
      await delay(100);
    }
    setCurrentIndex(-1);
    finishedAlgorithm();
  };

  const mergeSort = async () => {
    if (!isSortingActive.current) return;
    const arr = [...array];
    await mergeSortHelper(arr, 0, arr.length - 1);
    if (isSortingActive.current) {
      setSwapIndex(-1);
      setComparingIndex(-1);
      setCurrentIndex(-1);
      finishedAlgorithm();
    }
  };

  const mergeSortHelper = async (
    arr: number[],
    left: number,
    right: number
  ) => {
    if (left >= right) return;
    if (!isSortingActive.current) return;
    const mid = Math.floor((left + right) / 2);
    await mergeSortHelper(arr, left, mid);
    await mergeSortHelper(arr, mid + 1, right);
    await merge(arr, left, mid, right);
  };

  const merge = async (
    arr: number[],
    left: number,
    mid: number,
    right: number
  ) => {
    const tempArr = [...arr];
    let i = left;
    let j = mid + 1;
    let k = left;

    while (i <= mid && j <= right) {
      if (!isSortingActive.current) return;
      setComparingIndex(i);
      await delay(100);
      setComparingIndex(j);
      await delay(100);

      if (tempArr[i] <= tempArr[j]) {
        arr[k++] = tempArr[i++];
      } else {
        arr[k++] = tempArr[j++];
      }
      setArray([...arr]);
      setCurrentIndex(k);
      await delay(100);
    }

    while (i <= mid) {
      if (!isSortingActive.current) return;
      arr[k++] = tempArr[i++];
      setArray([...arr]);
      setCurrentIndex(k);
      await delay(100);
    }

    while (j <= right) {
      if (!isSortingActive.current) return;
      arr[k++] = tempArr[j++];
      setArray([...arr]);
      setCurrentIndex(k);
      await delay(100);
    }
  };

  const swap = async (arr: number[], i: number, j: number) => {
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setArray([...arr]);
  };

  return (
    <>
      <h1>Sorting Algorithms</h1>
      <div className="controls">
        <Dropdown
          className={
            isActive ||
            sortingStatus === "Stopped" ||
            sortingStatus === "Sorted"
              ? "disabled"
              : ""
          }
          options={[
            { label: "Selection Sort", value: "selection" },
            { label: "Bubble Sort", value: "bubble" },
            { label: "Merge Sort", value: "merge" },
          ]}
          onSelect={(value) => setAlgorithm(value as AlgorithmTypes)}
          selected={
            algorithm === "selection"
              ? "Selection Sort"
              : algorithm === "bubble"
              ? "Bubble Sort"
              : "Merge Sort"
          }
        />
        <Button
          className={
            isActive ||
            sortingStatus === "Stopped" ||
            sortingStatus === "Sorted"
              ? "disabled"
              : ""
          }
          onClick={() => {
            setIsActive(true);
          }}
        >
          Sort
        </Button>
        <Button
          className={isActive ? "disabled" : ""}
          onClick={() => {
            setArray(generateRandomArray(50));
            setSortingStatus("Randomized");
            setSortedIndex([]);
            setCurrentIndex(-1);
            setSwapIndex(-1);
            setComparingIndex(-1);
          }}
        >
          Randomize
        </Button>
        <Button
          className={!isActive ? "disabled" : ""}
          onClick={() => {
            setSortingStatus("Stopped");
            setIsActive(false);
          }}
        >
          Stop
        </Button>
      </div>
      <p style={{ marginTop: "0.5rem" }}>
        <strong>Red Color</strong> indicates current value
      </p>
      <p>
        <strong>Green Color</strong> indicates comparing value
      </p>
      <div className="array-container">
        <span className="sorting-status">{sortingStatus}</span>
        <Timer
          isRunning={isActive}
          className="timer"
          reset={sortingStatus === "Randomized"}
        />
        {map(array, (value, index) => (
          <motion.div
            key={index}
            className={`array-bar ${
              index === currentIndex
                ? "current"
                : index === swapIndex
                ? "swap"
                : comparingIndex === index
                ? "comparing"
                : includes(sortedIndex, index)
                ? "sorted"
                : ""
            }`}
            style={{ height: `${value * 7}px`, zIndex: 5 }}
          >
            <span className="value">{value}</span>
            {includes(sortedIndex, index) && (
              <motion.div
                className="circle"
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
          </motion.div>
        ))}
      </div>
    </>
  );
};
