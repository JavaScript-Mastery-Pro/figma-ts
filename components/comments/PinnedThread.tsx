"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ThreadData } from "@liveblocks/client";
import { Thread } from "@liveblocks/react-comments";
import { ThreadMetadata } from "@/liveblocks.config";

type Props = {
  thread: ThreadData<ThreadMetadata>;
  onFocus: (threadId: string) => void;
};

export function PinnedThread({ thread, onFocus, ...props }: Props) {
  // Open pinned threads that have just been created
  const startMinimized = useMemo(() => {
    return Number(new Date()) - Number(new Date(thread.createdAt)) > 100;
  }, [thread]);

  const [minimized, setMinimized] = useState(startMinimized);

  // memoize the result of this function so that it doesn't change on every render but only when the thread changes
  const memoizedContent = useMemo(() => {
    return (
      <div
        className="absolute flex gap-4 cursor-pointer"
        {...props}
        onClick={() => {
          onFocus(thread.id);
          setMinimized(!minimized);
        }}
      >
        <div
          className="select-none relative w-9 h-9 shadow rounded-tl-md rounded-tr-full rounded-br-full rounded-bl-full bg-white flex justify-center items-center"
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
            <Thread thread={thread} indentCommentContent={false} />
          </div>
        ) : null}
      </div>
    );
  }, [thread.comments.length, minimized]);

  return <>{memoizedContent}</>;
}
