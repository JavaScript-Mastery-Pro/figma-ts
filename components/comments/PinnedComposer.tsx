"use client";

import Image from "next/image";
import { PointerEventHandler } from "react";
import { Composer, ComposerProps } from "@liveblocks/react-comments";

type Props = {
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  onComposerSubmit: ComposerProps["onComposerSubmit"];
};

function PinnedComposer({
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onComposerSubmit,
  ...props
}: Props) {
  return (
    <div className="absolute flex gap-4" {...props}>
      <div
        className="select-none relative w-9 h-9 shadow rounded-tl-md rounded-tr-full rounded-br-full rounded-bl-full bg-white flex justify-center items-center"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <Image
          src={`https://liveblocks.io/avatars/avatar-${Math.floor(
            Math.random() * 30
          )}.png`}
          alt="someone"
          width={28}
          height={28}
          className="rounded-full"
        />
      </div>
      <div className="shadow bg-white rounded-lg flex flex-col text-sm min-w-96 overflow-hidden p-2">
        <Composer
          onComposerSubmit={onComposerSubmit}
          onClick={(e) => {
            // Don't send up a click event from emoji popout and close the composer
            e.stopPropagation();
          }}
          autoFocus={true}
        />
      </div>
    </div>
  );
}

export default PinnedComposer;
