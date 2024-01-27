import React, { memo, useMemo, useRef } from "react";

import Text from "./settings/Text";
import Color from "./settings/Color";
import Export from "./settings/Export";
import Direction from "./settings/Direction";
import Alignment from "./settings/Alignment";
import Dimensions from "./settings/Dimensions";

import { bringElement, modifyShape } from "@/lib/shapes";
import { Attributes } from "@/types/type";

type Props = {
  elementAttributes: Attributes;
  setElementAttributes: React.Dispatch<React.SetStateAction<Attributes>>;
  fabricRef: React.RefObject<fabric.Canvas | null>;
  activeObjectRef: React.RefObject<fabric.Object | null>;
  syncShapeInStorage: (obj: any) => void;
};

function RightSidebar({
  elementAttributes,
  setElementAttributes,
  fabricRef,
  activeObjectRef,
  syncShapeInStorage,
}: Props) {
  const colorInputRef = useRef(null);
  const strokeInputRef = useRef(null);

  // Memoized handleInputChange function
  const handleInputChange = useMemo(
    () => (property: string, value: string) => {
      setElementAttributes((prev) => ({ ...prev, [property]: value }));

      modifyShape(
        fabricRef.current,
        property,
        value,
        activeObjectRef,
        syncShapeInStorage
      );
    },
    []
  );

  const handleElemDirection = useMemo(
    () => (direction: string) => {
      bringElement({
        canvas: fabricRef.current,
        direction,
        activeObjectRef,
        syncShapeInStorage,
      });
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
  }, [elementAttributes]);

  return memoizedContent;
}

export default RightSidebar;
