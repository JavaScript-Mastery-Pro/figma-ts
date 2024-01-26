"use client";

import {
  PointerEvent,
  PointerEventHandler,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { ThreadData } from "@liveblocks/client";
import { ThreadMetadata } from "@/liveblocks.config";
import { Thread } from "@liveblocks/react-comments";
import Image from "next/image";

type Props = {
  thread: ThreadData<ThreadMetadata>;
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  onFocus: () => void;
};

export function PinnedThread({
  thread,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onFocus,
  ...props
}: Props) {
  // Open pinned threads that have just been created
  const startMinimized = useMemo(() => {
    return Number(new Date()) - Number(new Date(thread.createdAt)) > 100;
  }, [thread]);

  const [minimized, setMinimized] = useState(startMinimized);
  const dragStart = useRef({ x: 0, y: 0 });

  // Record starting click position
  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      dragStart.current = { x: e.clientX, y: e.clientY };
      onPointerDown(e);
    },
    [onPointerDown]
  );

  // If cursor moved, toggle minimized
  const handlePointerUp = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      onPointerUp(e);
      if (
        e.clientX === dragStart.current.x &&
        e.clientY === dragStart.current.y
      ) {
        setMinimized((min) => !min);
      }
    },
    [onPointerUp]
  );

  // memoize the result of this function so that it doesn't change on every render but only when the thread changes
  const memoizedContent = useMemo(() => {
    return (
      <div
        className="absolute flex gap-4 cursor-pointer z-[10000]"
        {...props}
        onClick={onFocus}
      >
        <div
          className="select-none relative w-9 h-9 shadow rounded-tl-md rounded-tr-full rounded-br-full rounded-bl-full bg-white flex justify-center items-center"
          onPointerDown={handlePointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={handlePointerUp}
          data-draggable={true}
        >
          <Image
            src={`https://liveblocks.io/avatars/avatar-${Math.floor(
              Math.random() * 30
            )}.png`}
            alt="Dummy Name"
            width={28}
            height={28}
            draggable={false}
            className="rounded-full"
          />
        </div>
        {!minimized ? (
          <div className="shadow bg-white rounded-lg flex flex-col text-sm min-w-60 overflow-hidden">
            <Thread
              thread={thread}
              indentCommentContent={false}
              onFocus={onFocus}
            />
          </div>
        ) : null}
      </div>
    );
  }, [
    thread.comments.length,
    minimized,
    handlePointerDown,
    handlePointerUp,
    onFocus,
  ]);

  return <>{memoizedContent}</>;
}
