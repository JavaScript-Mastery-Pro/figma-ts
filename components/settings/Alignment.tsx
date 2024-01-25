import Image from "next/image";

import { Button } from "../ui/button";
import { alignmentOptions } from "@/constants";

function Alignment() {
  return (
    <div className="flex border-b border-primary-grey-200 px-5 py-4">
      {alignmentOptions.map((option) => (
        <Button
          key={option.value}
          className="group hover:bg-primary-green"
          size="icon"
          // onClick={() => {
          //   setSelectedElementAttributes({
          //     ...selectedElementAttributes,
          //     alignment: option.value,
          //   });
          // }}
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
  );
}

export default Alignment;
