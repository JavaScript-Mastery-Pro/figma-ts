"use client";

import React, { useMemo } from "react";

import Avatar from "./Avatar";

import { generateRandomName } from "@/lib/utils";
import { useOthers, useSelf } from "@/liveblocks.config";

const ActiveUsers = () => {
  const others = useOthers();
  const currentUser = useSelf();

  const memoizedUsers = useMemo(() => {
    const hasMoreUsers = others.length > 2;

    return (
      <div className="flex justify-center items-center gap-1">
        {currentUser && (
          <Avatar name="You" otherStyles="border-[3px] border-primary-green" />
        )}

        {others.slice(0, 2).map(({ connectionId }) => (
          <Avatar
            key={connectionId}
            name={generateRandomName()}
            otherStyles="-ml-3"
          />
        ))}

        {hasMoreUsers && (
          <div className="w-9 h-9 rounded-full flex items-center justify-center -ml-3 bg-primary-black z-10">
            +{others.length - 2}
          </div>
        )}
      </div>
    );
  }, [others.length]);

  return memoizedUsers;
};

export default ActiveUsers;
