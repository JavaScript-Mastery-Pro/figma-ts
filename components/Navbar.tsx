"use client";

import Image from "next/image";
import { memo, useState } from "react";

import { Button } from "./ui/button";
import ShapesMenu from "./ShapesMenu";
import { navElements } from "@/constants";

import ActiveUsers from "./users/ActiveUsers";
import { useCanvas } from "@/context/CanvasProvider";

function Navbar() {
  const { activeElement, handleActiveElement } = useCanvas();

  return (
    <nav className="flex items-center justify-between bg-primary-black px-5 text-white gap-4 select-none">
      <Image src="/assets/logo.svg" alt="FigPro Logo" width={58} height={20} />

      <ul className="flex flex-row">
        {navElements.map((item: any) => (
          <li
            key={item.name}
            className={`group px-2.5 py-5 flex justify-center items-center
            ${
              activeElement.value === item.value
                ? "bg-primary-green"
                : "hover:bg-primary-grey-200"
            }
            `}
          >
            {Array.isArray(item.value) ? (
              <ShapesMenu
                item={item}
                activeElement={activeElement}
                handleActiveElement={handleActiveElement}
              />
            ) : (
              <Button
                className="relative w-5 h-5 object-contain"
                onClick={() => handleActiveElement(item)}
              >
                <Image
                  src={item.icon}
                  alt={item.name}
                  fill
                  className={activeElement.value === item.value ? "invert" : ""}
                />
              </Button>
            )}
          </li>
        ))}
      </ul>

      <ActiveUsers />
    </nav>
  );
}

export default memo(Navbar);
