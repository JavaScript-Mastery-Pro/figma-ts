"use client";

import { createSpecificShape } from "@/lib/shapes";
import { fabric } from "fabric";
import React, { useContext, createContext, useRef, useEffect } from "react";

interface CanvasContextType {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  fabricRef: React.RefObject<null>;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  const isDrawing = useRef(false);
  const shapeRef = useRef(null);
  const selectedShapeType = "triangle";

  // create a new fabric canvas instance that should take the width and height of the canvas element
  const initializeFabric = () => {
    const canvasElement = document.getElementById("canvas");

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasElement.clientWidth,
      height: canvasElement.clientHeight,
    });

    fabricRef.current = canvas;

    return canvas;
  };

  const handleResize = () => {
    const canvasElement = document.getElementById("canvas");

    const canvas = fabricRef.current;
    canvas.setWidth(canvasElement.clientWidth);
    canvas.setHeight(canvasElement.clientHeight);
    canvas.renderAll();
  };

  useEffect(() => {
    const canvas = initializeFabric();

    canvas.on("mouse:down", (options) => {
      const pointer = canvas.getPointer(options.e);
      const target = canvas.findTarget(options.e, false);

      if (selectedShapeType === "freeform") {
        // Handle freeform drawing separately
        isDrawing.current = true;
        canvas.isDrawingMode = true;
        return;
      }

      if (
        target &&
        (target.type === selectedShapeType || target.type === "activeSelection")
      ) {
        // Clicked on an existing rectangle, initiate move instead of creating a new one
        isDrawing.current = false;
        canvas.setActiveObject(target);
        target.setCoords();
      } else {
        // Clicked on an empty space, start drawing a new rectangle
        isDrawing.current = true;

        shapeRef.current = createSpecificShape(selectedShapeType, pointer);
        console.log(shapeRef.current);

        canvas.add(shapeRef.current);
      }
    });

    canvas.on("mouse:move", (options) => {
      if (!isDrawing.current) return;
      if (selectedShapeType === "freeform") {
        // Handle freeform drawing separately
        return;
      }

      const pointer = canvas.getPointer(options.e);

      shapeRef.current?.set({
        width: pointer.x - shapeRef.current?.left,
        height: pointer.y - shapeRef.current?.top,
      });

      canvas.renderAll();
    });

    canvas.on("mouse:up", () => {
      isDrawing.current = false;
    });

    window.addEventListener("resize", handleResize);

    return () => {
      canvas.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef]);

  return (
    <CanvasContext.Provider
      value={{
        canvasRef,
        fabricRef,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export function useCanvas() {
  const context = useContext(CanvasContext);

  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }

  return context;
}
