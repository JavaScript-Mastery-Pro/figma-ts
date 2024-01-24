"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
  useOthers,
} from "../liveblocks.config";

import CursorChat from "@/components/cursor/CursorChat";

import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import LiveCursors from "@/components/cursor/LiveCursors";
import ReactionSelector from "@/components/reaction/ReactionButton";
import useInterval from "@/hooks/useInterval";
import FlyingReaction from "@/components/reaction/FlyingReaction";
import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";

function Home() {
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence() as any;
  const broadcast = useBroadcastEvent();

  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });

  const setReaction = useCallback((reaction: string) => {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

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

  return (
    <main className="overflow-hidden h-screen">
      <Navbar />

      <section className="flex flex-row h-full">
        <LeftSidebar />

        <div
          className="relative flex flex-1 w-full h-full items-center justify-center"
          id="canvas"
          style={{
            cursor: cursorState.mode === CursorMode.Chat ? "none" : "auto",
          }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <canvas className="w-full h-full bg-primary-grey-100" id="canvas" />

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
        </div>

        <RightSidebar />
      </section>
    </main>
  );
}

export default Home;
