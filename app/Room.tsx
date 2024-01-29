"use client";

import { LiveMap } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";

import { RoomProvider } from "@/liveblocks.config";
import Loader from "@/components/Loader";

const Room = ({ children }: { children: React.ReactNode }) => (
  <RoomProvider
    id='figma-room'
    initialPresence={{
      cursor: null,
      cursorColor: null,
      editingText: null,
    }}
    initialStorage={{
      canvasObjects: new LiveMap(),
    }}
  >
    <ClientSideSuspense fallback={<Loader />}>
      {() => children}
    </ClientSideSuspense>
  </RoomProvider>
);

export default Room;
