"use client";

import Image from "next/image";
import { Composer, ComposerProps } from "@liveblocks/react-comments";

type Props = {
  onComposerSubmit: ComposerProps["onComposerSubmit"];
};

const PinnedComposer = ({ onComposerSubmit, ...props }: Props) => (
  <div className='absolute flex gap-4' {...props}>
    <div className='relative flex h-9 w-9 select-none items-center justify-center rounded-bl-full rounded-br-full rounded-tl-md rounded-tr-full bg-white shadow'>
      <Image
        src={`https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`}
        alt='someone'
        width={28}
        height={28}
        className='rounded-full'
      />
    </div>
    <div className='flex min-w-96 flex-col overflow-hidden rounded-lg bg-white p-2 text-sm shadow'>
      <Composer
        onComposerSubmit={onComposerSubmit}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        autoFocus={true}
      />
    </div>
  </div>
);

export default PinnedComposer;
