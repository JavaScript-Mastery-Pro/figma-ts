"use client";

import { fabric } from "fabric";
import React, {
  useContext,
  createContext,
  useRef,
  useEffect,
  useState,
} from "react";

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
  selectedShapeRef: React.RefObject<string | null>;
  activeElement: {
    name: string;
    value: string;
    icon: string;
  } | null;
  handleActiveElement: (elem: any) => void;
  elementAttributes: {
    width: string;
    height: string;
    fontSize: string;
    fontFamily: string;
    fontWeight: string;
    fill: string;
    stroke: string;
  };
  setElementAttributes: React.Dispatch<
    React.SetStateAction<{
      width: string;
      height: string;
      fontSize: string;
      fontFamily: string;
      fontWeight: string;
      fill: string;
      stroke: string;
    }>
  >;
  activeObjectsRef: React.RefObject<any[]>;
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
  const selectedShapeRef = useRef<string | null>(null);
  const activeObjectsRef = useRef<any>([]);

  const [activeElement, setActiveElement] = useState<{
    name: string;
    value: string;
    icon: string;
  } | null>({
    name: "",
    value: "",
    icon: "",
  });

  const [elementAttributes, setElementAttributes] = useState({
    width: "",
    height: "",
    fontSize: "",
    fontFamily: "",
    fontWeight: "",
    fill: "#aabbcc",
    stroke: "#aabbcc",
  });

  const handleActiveElement = (elem: any) => {
    setActiveElement(elem);

    if (elem.value !== "image" && elem.value !== "comments") {
      selectedShapeRef.current = elem.value;

      if (elem.value === "delete") {
        setActiveElement(null);
      }
    } else {
      selectedShapeRef.current = "";
    }
  };

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
      // @ts-ignore
      objectId: shape?.objectId,
    }));

    allShapes.current = shapesData;
  };

  useEffect(() => {
    const canvas = initializeFabric();

    canvas.on("mouse:down", (options) => {
      const pointer = canvas.getPointer(options.e);
      const target = canvas.findTarget(options.e, false);

      if (selectedShapeRef.current === "freeform") {
        isDrawing.current = true;
        canvas.isDrawingMode = true;
        return;
      }

      canvas.isDrawingMode = false;

      if (
        target &&
        (target.type === selectedShapeRef.current ||
          target.type === "activeSelection")
      ) {
        isDrawing.current = false;
        canvas.setActiveObject(target);
        target.setCoords();
      } else {
        isDrawing.current = true;

        shapeRef.current = createSpecificShape(
          selectedShapeRef.current,
          pointer
        );

        if (shapeRef.current) {
          canvas.add(shapeRef.current);
        }
      }
    });

    canvas.on("mouse:move", (options) => {
      if (!isDrawing.current) return;
      if (selectedShapeRef.current === "freeform") return;

      canvas.isDrawingMode = false;
      const pointer = canvas.getPointer(options.e);

      switch (selectedShapeRef?.current) {
        case "rectangle":
          shapeRef.current?.set({
            width: pointer.x - (shapeRef.current?.left || 0),
            height: pointer.y - (shapeRef.current?.top || 0),
          });
          break;

        case "circle":
          shapeRef.current.set({
            radius: Math.abs(pointer.x - (shapeRef.current?.left || 0)) / 2,
          });
          break;

        case "triangle":
          shapeRef.current?.set({
            width: pointer.x - (shapeRef.current?.left || 0),
            height: pointer.y - (shapeRef.current?.top || 0),
          });
          break;

        case "line":
          shapeRef.current?.set({
            x2: pointer.x,
            y2: pointer.y,
          });
          break;

        default:
          break;
      }

      canvas.renderAll();
    });

    canvas.on("mouse:up", () => {
      isDrawing.current = false;

      shapeRef.current = null;

      if (selectedShapeRef.current !== "freeform") {
        // canvas.isDrawingMode = false;
        selectedShapeRef.current = null;
      }

      getShapes();

      if (!canvas.isDrawingMode) {
        setTimeout(() => {
          setActiveElement({
            name: "Select",
            value: "select",
            icon: "/assets/icons/select.svg",
          });
        }, 700);
      }
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

      // restrict the element from going outside of the canvas at the top
      // if (target && target.top) {
      //   target.top = Math.max(0, target.top);
      // }

      // increase the height of the canvas if the element is dragged to the bottom
      // if (target && target.top) {
      //   if (target.top + target.height > canvas.height) {
      //     canvas.setHeight(target.top + target.height);
      //   }
      // }

      // increase the width of the canvas if the element is dragged to the right
      // if (target && target.left) {
      //   if (target.left + target.width > canvas.width) {
      //     canvas.setWidth(target.left + target.width);
      //   }
      // }
    });

    // listen for element selection
    canvas.on("selection:created", (options) => {
      activeObjectsRef.current = canvas.getActiveObjects();

      // check if the selected element is a single element
      if (activeObjectsRef.current.length === 1) {
        const activeElement = activeObjectsRef.current[0];

        // set the element attributes
        setElementAttributes(() => ({
          width: Math.round(activeElement?.getScaledWidth() || 0).toString(),
          height: Math.round(activeElement?.getScaledHeight() || 0).toString(),
          fontSize: activeElement?.fontSize || "",
          fontFamily: activeElement?.fontFamily || "",
          fontWeight: activeElement?.fontWeight || "",
          fill: activeElement?.fill || "",
          stroke: activeElement?.stroke || "",
        }));
      }
    });

    // listen for object scaling
    canvas.on("object:scaling", (options) => {
      const activeElement = options.target;

      setElementAttributes((prev) => ({
        ...prev,
        width: Math.round(activeElement?.getScaledWidth() || 0).toString(),
        height: Math.round(activeElement?.getScaledHeight() || 0).toString(),
      }));
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
        selectedShapeRef,
        activeElement,
        activeObjectsRef,
        handleActiveElement,
        elementAttributes,
        setElementAttributes,
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
