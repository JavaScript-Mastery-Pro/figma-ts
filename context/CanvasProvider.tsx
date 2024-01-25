"use client";

import { fabric } from "fabric";
import React, { useContext, createContext, useRef, useEffect } from "react";

import { createSpecificShape } from "@/lib/shapes";
import { Gradient, Pattern } from "fabric/fabric-impl";

type ShapeData = {
  type: string;
  width: number;
  height: number;
  fill: string | Pattern | Gradient;
  left: number;
  top: number;
  objectId: string | undefined;
};

type CanvasContextType = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  fabricRef: React.RefObject<fabric.Canvas | null>;
  allShapes: React.RefObject<ShapeData[]>;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  const allShapes = useRef<ShapeData[]>([]);

  const isDrawing = useRef(false);
  const shapeRef = useRef<any>(null);
  const selectedShapeType = "triangle";

  // create a new fabric canvas instance that should take the width and height of the canvas element
  const initializeFabric = () => {
    const canvasElement = document.getElementById("canvas");

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasElement?.clientWidth,
      height: canvasElement?.clientHeight,
    });

    fabricRef.current = canvas;

    return canvas;
  };

  const handleResize = () => {
    const canvasElement = document.getElementById("canvas");

    const canvas = fabricRef.current;
    canvas?.setWidth(canvasElement?.clientWidth || 0);
    canvas?.setHeight(canvasElement?.clientHeight || 0);
    canvas?.renderAll();
  };

  const getShapes = () => {
    const canvas = fabricRef.current;
    const shapes = canvas?.getObjects() || [];

    const shapesData = shapes.map((shape) => ({
      type: shape.type || "",
      width: shape.width || 0,
      height: shape.height || 0,
      fill: shape.fill || "",
      left: shape.left || 0,
      top: shape.top || 0,
      objectId: shape?.objectId,
    }));

    allShapes.current = shapesData;
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
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });

      canvas.renderAll();
    });

    canvas.on("mouse:up", () => {
      isDrawing.current = false;

      getShapes();
    });

    canvas?.on("object:moving", (options) => {
      const target = options.target as fabric.Object;
      const canvas = target.canvas as fabric.Canvas;

      target.setCoords();

      if (target && target.left) {
        target.left = Math.max(
          0,
          Math.min(target.left, (canvas.width || 0) - (target.width || 0))
        );
      }

      if (target && target.top) {
        target.top = Math.max(
          0,
          Math.min(target.top, (canvas.height || 0) - (target.height || 0))
        );
      }
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
        allShapes,
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
