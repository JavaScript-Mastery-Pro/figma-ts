import Image from "next/image";

import { Button } from "../ui/button";
import { directionOptions } from "@/constants";

function Direction({
  handleElemDirection,
}: {
  handleElemDirection: (value: string) => void;
}) {
  return (
    <section className="flex flex-col border-b border-primary-grey-200 py-3 gap-3">
      <h3 className="px-5 text-[10px] uppercase">Direction</h3>

      <div className="flex border-primary-grey-200 px-5">
        {directionOptions.map((option) => (
          <Button
            key={option.value}
            className="group hover:bg-primary-green"
            size="icon"
            onClick={() => {
              handleElemDirection(option.value);
            }}
          >
            <Image
              src={option.icon}
              alt={option.label}
              width={14}
              height={14}
              className="group-hover:invert"
            />
          </Button>
        ))}
      </div>
    </section>
  );
}

export default Direction;
