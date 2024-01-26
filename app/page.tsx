"use client";

import { fabric } from "fabric";
import { v4 as uuid4 } from "uuid";
import { useState, useEffect, useCallback, useRef } from "react";

import {
  useBroadcastEvent,
  useEventListener,
  useMutation,
  useMyPresence,
  useOthers,
  useStorage,
} from "../liveblocks.config";

import CursorChat from "@/components/cursor/CursorChat";

import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";

import { createSpecificShape } from "@/lib/shapes";
import { handleDelete } from "@/lib/key-events";
import useInterval from "@/hooks/useInterval";
import {
  Navbar,
  LeftSidebar,
  FlyingReaction,
  ReactionSelector,
  LiveCursors,
  RightSidebar,
} from "@/components/index";

function Home() {
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence() as any;
  const broadcast = useBroadcastEvent();

  const canvasObjects = useStorage((root) => root.canvasObjects);

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

  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });

  const setReaction = useCallback((reaction: string) => {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  const allShapes = useRef<any>([]);

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

  // Remove reactions that are not visible anymore (every 1 sec)
  useInterval(() => {
    setReactions((reactions) =>
      reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000)
    );
  }, 1000);

  useInterval(() => {
    if (
      cursorState.mode === CursorMode.Reaction &&
      cursorState.isPressed &&
      cursor
    ) {
      setReactions((reactions) =>
        reactions.concat([
          {
            point: { x: cursor.x, y: cursor.y },
            value: cursorState.reaction,
            timestamp: Date.now(),
          },
        ])
      );
      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    }
  }, 100);

  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;
    setReactions((reactions) =>
      reactions.concat([
        {
          point: { x: event.x, y: event.y },
          value: event.value,
          timestamp: Date.now(),
        },
      ])
    );
  });

  useEffect(() => {
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "/") {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      } else if (e.key === "Escape") {
        updateMyPresence({ message: "" });
        setCursorState({ mode: CursorMode.Hidden });
      } else if (e.key === "e") {
        setCursorState({ mode: CursorMode.ReactionSelector });
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "/") {
        e.preventDefault();
      }
    }

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);

  const handlePointerMove = (event: React.PointerEvent) => {
    event.preventDefault();
    if (cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
      // get the cursor position in the canvas
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

      updateMyPresence({
        cursor: {
          x,
          y,
        },
      });
    }
  };

  const handlePointerLeave = () => {
    setCursorState({
      mode: CursorMode.Hidden,
    });
    updateMyPresence({
      cursor: null,
      message: null,
    });
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    // get the cursor position in the canvas
    const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

    updateMyPresence({
      cursor: {
        x,
        y,
      },
    });
    setCursorState((state: CursorState) =>
      cursorState.mode === CursorMode.Reaction
        ? { ...state, isPressed: true }
        : state
    );
  };

  const handlePointerUp = () => {
    setCursorState((state: CursorState) =>
      cursorState.mode === CursorMode.Reaction
        ? { ...state, isPressed: false }
        : state
    );
  };

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

        getShapes();
      }

      if (elem.value === "delete") {
        handleDelete(fabricRef.current, deleteShapeFromStorage);
        setActiveElement({
          name: "Select",
          value: "select",
          icon: "/assets/icons/select.svg",
        });

        getShapes();
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

      if (shapeRef.current?.objectId) {
        syncShapeInStorage(shapeRef.current);
      }
    });

    canvas.on("mouse:up", () => {
      isDrawing.current = false;

      syncShapeInStorage(shapeRef.current);

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

    // listen for object modification
    canvas.on("object:modified", (options) => {
      const target = options.target;

      if (target?.type == "activeSelection") {
        // fix this
      } else {
        syncShapeInStorage(target);
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
    });

    // listen for element selection
    canvas.on("selection:created", (options) => {
      if (!options?.selected) return;

      const selectedElement = options?.selected[0];

      if (selectedElement && options.selected.length === 1) {
        setElementAttributes((prev) => ({
          ...prev,
          width: Math.round(selectedElement?.getScaledWidth() || 0).toString(),
          height: Math.round(
            selectedElement?.getScaledHeight() || 0
          ).toString(),
        }));
      }
    });

    // listen for object scaling
    canvas.on("object:scaling", (options) => {
      const selectedElement = options.target;

      setElementAttributes((prev) => ({
        ...prev,
        width: Math.round(selectedElement?.getScaledWidth() || 0).toString(),
        height: Math.round(selectedElement?.getScaledHeight() || 0).toString(),
      }));
    });

    window.addEventListener("resize", handleResize);

    return () => {
      canvas.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef.current]);

  useEffect(() => {
    fabricRef.current?.clear();

    Array.from(canvasObjects, ([objectId, objectData]) => {
      fabric.util.enlivenObjects([objectData], (enlivenedObjects) => {
        enlivenedObjects.forEach((enlivenedObj) => {
          fabricRef.current?.add(enlivenedObj);
        });
      });

      fabricRef.current?.renderAll();
    });

    getShapes();
  }, [canvasObjects]);

  return (
    <main className="overflow-hidden h-screen">
      <Navbar
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
      />

      <section className="flex flex-row h-full">
        <LeftSidebar allShapes={allShapes} />

        <div
          className="relative flex flex-1 w-full h-full items-center justify-center overflow-scroll"
          style={{
            cursor: cursorState.mode === CursorMode.Chat ? "none" : "auto",
          }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <canvas className="" id="canvas" ref={canvasRef} />

          {reactions.map((reaction) => (
            <FlyingReaction
              key={reaction.timestamp.toString()}
              x={reaction.point.x}
              y={reaction.point.y}
              timestamp={reaction.timestamp}
              value={reaction.value}
            />
          ))}

          {cursor && (
            <CursorChat
              cursor={cursor}
              cursorState={cursorState}
              setCursorState={setCursorState}
              updateMyPresence={updateMyPresence}
            />
          )}

          {cursorState.mode === CursorMode.ReactionSelector && (
            <ReactionSelector
              setReaction={(reaction) => {
                setReaction(reaction);
              }}
            />
          )}

          <LiveCursors others={others} />
          {/* <Comments /> */}
        </div>

        <RightSidebar
          elementAttributes={elementAttributes}
          setElementAttributes={setElementAttributes}
          fabricRef={fabricRef}
          syncShapeInStorage={syncShapeInStorage}
        />
      </section>
    </main>
  );
}

export default Home;
