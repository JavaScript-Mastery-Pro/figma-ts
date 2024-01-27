import Image from "next/image";

import { Button } from "../ui/button";
import { directionOptions } from "@/constants";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

function Direction({ handleElemDirection }: any) {
  return (
    <section className="flex flex-col border-b border-primary-grey-200 py-3 gap-3">
      <h3 className="px-5 text-[10px] uppercase">Direction</h3>

      <div className="flex border-primary-grey-200 px-5">
        {directionOptions.map((option) => (
          <Tooltip key={option.value}>
            <TooltipTrigger>
              <Button
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
            </TooltipTrigger>
            <TooltipContent className="px-2.5 py-1.5 border-none bg-primary-grey-200 text-xs">
              {option.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </section>
  );
}

export default Direction;
