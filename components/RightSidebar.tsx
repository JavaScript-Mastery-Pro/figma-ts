import React, { useMemo, useRef } from "react";

import Text from "./settings/Text";
import Color from "./settings/Color";
import Export from "./settings/Export";
import Direction from "./settings/Direction";
import Dimensions from "./settings/Dimensions";

import { RightSidebarProps } from "@/types/type";
import { bringElement, modifyShape } from "@/lib/shapes";

function RightSidebar({
  elementAttributes,
  setElementAttributes,
  fabricRef,
  activeObjectRef,
  syncShapeInStorage,
}: RightSidebarProps) {
  const colorInputRef = useRef(null);
  const strokeInputRef = useRef(null);

  const handleInputChange = (property: string, value: string) => {
    setElementAttributes((prev) => ({ ...prev, [property]: value }));

    modifyShape({
      canvas: fabricRef.current as fabric.Canvas,
      property,
      value,
      activeObjectRef,
      syncShapeInStorage,
    });
  };

  const handleElemDirection = (direction: string) => {
    bringElement({
      canvas: fabricRef.current as fabric.Canvas,
      direction,
      syncShapeInStorage,
    });
  };

  // memoize the content of the right sidebar to avoid re-rendering on every mouse actions
  const memoizedContent = useMemo(() => {
    return (
      <section className="flex flex-col border-t border-primary-grey-200 bg-primary-black text-primary-grey-300 min-w-[227px] sticky right-0 h-full max-sm:hidden select-none">
        <h3 className=" px-5 pt-4 text-xs uppercase">Design</h3>
        <span className="text-xs text-primary-grey-300 mt-3 px-5 border-b border-primary-grey-200 pb-4">
          Make changes to canvas as you like
        </span>

        <Direction handleElemDirection={handleElemDirection} />

        <Dimensions
          width={elementAttributes.width}
          height={elementAttributes.height}
          handleInputChange={handleInputChange}
        />

        <Text
          fontFamily={elementAttributes.fontFamily}
          fontSize={elementAttributes.fontSize}
          fontWeight={elementAttributes.fontWeight}
          handleInputChange={handleInputChange}
        />

        <Color
          inputRef={colorInputRef}
          attribute={elementAttributes.fill}
          placeholder="color"
          attributeType="fill"
          handleInputChange={handleInputChange}
        />

        <Color
          inputRef={strokeInputRef}
          attribute={elementAttributes.stroke}
          placeholder="stroke"
          attributeType="stroke"
          handleInputChange={handleInputChange}
        />

        <Export />
      </section>
    );
  }, [elementAttributes]); // only re-render when elementAttributes changes

  return memoizedContent;
}

export default RightSidebar;
