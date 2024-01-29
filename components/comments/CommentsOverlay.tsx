"use client";

import {
  ThreadMetadata,
  useEditThreadMetadata,
  useThreads,
  useUser,
} from "@/liveblocks.config";
import { useCallback, useRef } from "react";
import { ThreadData } from "@liveblocks/client";

import { PinnedThread } from "./PinnedThread";
import { useMaxZIndex } from "@/lib/useMaxZIndex";

type OverlayThreadProps = {
  thread: ThreadData<ThreadMetadata>;
  maxZIndex: number;
};

export function CommentsOverlay() {
  /**
   * We're using the useThreads hook to get the list of threads
   * in the room.
   *
   * useThreads: https://liveblocks.io/docs/api-reference/liveblocks-react#useThreads
   */
  const { threads } = useThreads();

  // get the max z-index of a thread
  const maxZIndex = useMaxZIndex();

  return (
    <div>
      {threads
        .filter((thread) => !thread.metadata.resolved)
        .map((thread) => (
          <OverlayThread
            key={thread.id}
            thread={thread}
            maxZIndex={maxZIndex}
          />
        ))}
    </div>
  );
}

function OverlayThread({ thread, maxZIndex }: OverlayThreadProps) {
  /**
   * We're using the useEditThreadMetadata hook to edit the metadata
   * of a thread.
   *
   * useEditThreadMetadata: https://liveblocks.io/docs/api-reference/liveblocks-react#useEditThreadMetadata
   */
  const editThreadMetadata = useEditThreadMetadata();

  /**
   * We're using the useUser hook to get the user of the thread.
   *
   * useUser: https://liveblocks.io/docs/api-reference/liveblocks-react#useUser
   */
  const { isLoading } = useUser(thread.comments[0].userId);

  // We're using a ref to get the thread element to position it
  const threadRef = useRef<HTMLDivElement>(null);

  // If other thread(s) above, increase z-index on last element updated
  const handleIncreaseZIndex = useCallback(() => {
    if (maxZIndex === thread.metadata.zIndex) {
      return;
    }

    // Update the z-index of the thread in the room
    editThreadMetadata({
      threadId: thread.id,
      metadata: {
        zIndex: maxZIndex + 1,
      },
    });
  }, [thread, editThreadMetadata, maxZIndex]);

  if (isLoading) {
    return null;
  }

  return (
    <div
      ref={threadRef}
      id={`thread-${thread.id}`}
      className="flex gap-5 absolute top-0 left-0"
      style={{
        /**
         * Disclaimer: this is a hack to position the thread at the right
         * place. I found it by trial and error. Without subtracting 220px
         * and 60px, the thread is not positioned correctly on the canvas.
         *
         * One guess is that 220px and 60px are the width and height of
         * the comment composer so we need to subtract them to position
         * the thread correctly.
         */
        transform: `translate(${thread.metadata.cursorX - 220}px, ${
          thread.metadata.cursorY - 60
        }px)`,
      }}
    >
      {/* render the thread */}
      <PinnedThread thread={thread} onFocus={handleIncreaseZIndex} />
    </div>
  );
}
