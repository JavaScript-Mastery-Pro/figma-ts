import React, { useMemo, useRef } from "react";

import Text from "./settings/Text";
import Color from "./settings/Color";
import Export from "./settings/Export";
import Groups from "./settings/Groups";
import Alignment from "./settings/Alignment";
import Dimensions from "./settings/Dimensions";

import { useCanvas } from "@/context/CanvasProvider";
import { modifyShape } from "@/lib/shapes";

function RightSidebar() {
  const colorInputRef = useRef(null);
  const strokeInputRef = useRef(null);
  const {
    elementAttributes,
    setElementAttributes,
    fabricRef,
    activeObjectsRef,
  } = useCanvas();

  // Memoized handleInputChange function
  const handleInputChange = useMemo(
    () => (property: string, value: string) => {
      setElementAttributes((prev) => ({ ...prev, [property]: value }));

      modifyShape(fabricRef.current, activeObjectsRef, property, value);
    },
    []
  );

  const memoizedContent = useMemo(() => {
    return (
      <section className="flex flex-col border-t border-primary-grey-200 bg-primary-black text-primary-grey-300 min-w-[227px] sticky right-0 h-full max-sm:hidden select-none">
        <h3 className="border-b border-primary-grey-200 px-5 py-4 text-xs uppercase">
          Design
        </h3>

        <Alignment />

        <Groups />

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
  }, [elementAttributes]);

  return memoizedContent;
}

export default RightSidebar;
