"use client";

import { useState } from "react";
import { NewThread } from "@/components/comments/NewThread";
import { PlusIcon } from "lucide-react";
import { Button } from "../ui/button";
import * as Collapsible from "@radix-ui/react-collapsible";

export function Toolbar({ ...props }) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      {...props}
      data-hide-cursors
    >
      <div className="fixed left-1/2 transform -translate-x-1/2 bottom-10 shadow bg-white p-3 rounded-lg flex items-center z-[10000]">
        <NewThread>
          <Button variant="ghost">
            Something
            <PlusIcon width={12} height={12} />
          </Button>
        </NewThread>
      </div>
    </Collapsible.Root>
  );
}
