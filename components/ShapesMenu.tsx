"use client";

import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

type elem = {
  name: string;
  icon: string;
  value: string;
};

type Props = {
  item: {
    name: string;
    icon: string;
    value: Array<elem>;
  };
  activeElement: any;
  handleActiveElement: any;
};

function ShapesMenu({ item, activeElement, handleActiveElement }: Props) {
  const isDropdownElem = item.value.some(
    (elem) => elem.value === activeElement.value
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="no-ring">
          <Button
            className="relative w-5 h-5 object-contain"
            onClick={() => handleActiveElement(item)}
          >
            <Image
              src={isDropdownElem ? activeElement.icon : item.icon}
              alt={item.name}
              fill
              className={isDropdownElem ? "invert" : ""}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="mt-5 flex flex-col gap-y-1 border-none bg-primary-black py-4 text-white">
          {item.value.map((elem) => (
            <Button
              key={elem.name}
              onClick={() => {
                handleActiveElement(elem);
              }}
              className={`flex h-fit rounded-none justify-between gap-10 focus:border-none px-5 py-3 ${
                activeElement.value === elem.value
                  ? "bg-primary-green"
                  : "hover:bg-primary-grey-200"
              }`}
            >
              <div className="group flex items-center gap-2">
                <Image
                  src={elem.icon}
                  alt={elem.name}
                  width={20}
                  height={20}
                  className={activeElement.value === elem.value ? "invert" : ""}
                />
                <p
                  className={`text-sm  ${
                    activeElement.value === elem.value
                      ? "text-primary-black"
                      : "text-white"
                  }`}
                >
                  {elem.name}
                </p>
              </div>
              <p className="capitalize">{elem.value[0]}</p>
            </Button>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        type="file"
        className="hidden"
        // ref={imageInputRef}
        accept="image/*"
        onChange={() => {}}
      />
    </>
  );
}

export default ShapesMenu;
