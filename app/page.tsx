"use client";

import { fabric } from "fabric";
import { useState, useEffect, useRef } from "react";
import { useMutation, useRedo, useStorage, useUndo } from "@/liveblocks.config";

import {
  handleCanvasMouseDown,
  handleCanvasMouseUp,
  handleCanvasObjectModified,
  handleCanvasObjectMoving,
  handleCanvasObjectScaling,
  handleCanvasSelectionCreated,
  handleCanvasZoom,
  handleCanvaseMouseMove,
  handleResize,
  initializeFabric,
  renderCanvas,
} from "@/lib/canvas";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import { Navbar, LeftSidebar, RightSidebar, Live } from "@/components/index";

import { ActiveElement, Attributes } from "@/types/type";
import { handleImageUpload } from "@/lib/shapes";

function Home() {
  const undo = useUndo();
  const redo = useRedo();
  const canvasObjects = useStorage((root) => root.canvasObjects);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  const isDrawing = useRef(false);
  const shapeRef = useRef<any>(null);
  const selectedShapeRef = useRef<string | null>(null);
  const activeObjectRef = useRef<any>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: "",
    value: "",
    icon: "",
  });

  const [elementAttributes, setElementAttributes] = useState<Attributes>({
    width: "",
    height: "",
    fontSize: "",
    fontFamily: "",
    fontWeight: "",
    fill: "#aabbcc",
    stroke: "#aabbcc",
  });

  const deleteShapeFromStorage = useMutation(({ storage }, shapeId) => {
    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.delete(shapeId);
  }, []);

  const deleteAllShapes = useMutation(({ storage }) => {
    const canvasObjects = storage.get("canvasObjects");

    if (!canvasObjects || canvasObjects.size === 0) return true;

    for (const [key, value] of canvasObjects.entries()) {
      canvasObjects.delete(key);
    }

    return canvasObjects.size === 0;
  }, []);

  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;
    const { objectId } = object;

    const shapeData = object.toJSON();
    shapeData.objectId = objectId;

    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.set(objectId, shapeData);
  }, []);

  const handleActiveElement = (elem: any) => {
    setActiveElement(elem);

    if (elem.value !== "image" && elem.value !== "comments") {
      selectedShapeRef.current = elem.value;

      if (elem.value === "reset") {
        deleteAllShapes();
        fabricRef.current?.clear();
        setActiveElement({
          name: "Select",
          value: "select",
          icon: "/assets/icons/select.svg",
        });
      }

      if (elem.value === "delete") {
        handleDelete(fabricRef.current, deleteShapeFromStorage);
        setActiveElement({
          name: "Select",
          value: "select",
          icon: "/assets/icons/select.svg",
        });
      }
    } else {
      selectedShapeRef.current = "";
    }

    if (elem.value === "image") {
      imageInputRef.current?.click();
    }
  };

  useEffect(() => {
    const canvas = initializeFabric({
      canvasRef,
      fabricRef,
    });

    canvas.on("mouse:down", (options) => {
      handleCanvasMouseDown({
        options,
        canvas,
        selectedShapeRef,
        isDrawing,
        shapeRef,
      });
    });

    canvas.on("mouse:move", (options) => {
      handleCanvaseMouseMove({
        options,
        canvas,
        isDrawing,
        selectedShapeRef,
        shapeRef,
        syncShapeInStorage,
      });
    });

    canvas.on("mouse:up", () => {
      handleCanvasMouseUp({
        canvas,
        isDrawing,
        shapeRef,
        activeObjectRef,
        selectedShapeRef,
        syncShapeInStorage,
        setActiveElement,
      });
    });

    canvas.on("object:modified", (options) => {
      handleCanvasObjectModified({
        options,
        syncShapeInStorage,
      });
    });

    canvas?.on("object:moving", (options) => {
      handleCanvasObjectMoving({
        options,
      });
    });

    canvas.on("selection:created", (options) => {
      handleCanvasSelectionCreated({
        options,
        setElementAttributes,
      });
    });

    canvas.on("object:scaling", (options) => {
      handleCanvasObjectScaling({
        options,
        setElementAttributes,
      });
    });

    canvas.on("mouse:wheel", (options) => {
      handleCanvasZoom({
        options,
        canvas,
      });
    });

    window.addEventListener("resize", () => {
      handleResize({
        fabricRef,
      });
    });

    window.addEventListener("keydown", (e) =>
      handleKeyDown(
        e,
        fabricRef.current,
        undo,
        redo,
        syncShapeInStorage,
        deleteShapeFromStorage
      )
    );

    return () => {
      canvas.dispose();

      window.removeEventListener("resize", () => {
        handleResize({
          fabricRef,
        });
      });

      window.removeEventListener("keydown", (e) =>
        handleKeyDown(
          e,
          fabricRef.current,
          undo,
          redo,
          syncShapeInStorage,
          deleteShapeFromStorage
        )
      );
    };
  }, [canvasRef]);

  useEffect(() => {
    renderCanvas({
      fabricRef,
      canvasObjects,
      activeObjectRef,
    });
  }, [canvasObjects]);

  return (
    <main className="overflow-hidden h-screen">
      <Navbar
        imageInputRef={imageInputRef}
        activeElement={activeElement}
        handleImageUpload={(e: any) => {
          handleImageUpload({
            file: e.target.files[0],
            canvas: fabricRef as any,
            syncShapeInStorage,
          });
        }}
        handleActiveElement={handleActiveElement}
      />

      <section className="flex flex-row h-full">
        <LeftSidebar allShapes={Array.from(canvasObjects)} />

        <Live canvasRef={canvasRef} />

        <RightSidebar
          elementAttributes={elementAttributes}
          setElementAttributes={setElementAttributes}
          fabricRef={fabricRef}
          activeObjectRef={activeObjectRef}
          syncShapeInStorage={syncShapeInStorage}
        />
      </section>
    </main>
  );
}

export default Home;
