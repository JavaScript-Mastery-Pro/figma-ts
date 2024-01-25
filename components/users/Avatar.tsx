import Image from "next/image";

import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type Props = {
  name: string;
  otherStyles?: string;
};

const Avatar = ({ name, otherStyles }: Props) => {
  return (
    <>
      <Tooltip>
        <TooltipTrigger>
          <div
            className={`relative w-9 h-9 rounded-full ${otherStyles}`}
            data-tooltip={name}
          >
            <Image
              src={`https://liveblocks.io/avatars/avatar-${Math.floor(
                Math.random() * 30
              )}.png`}
              fill
              className="rounded-full"
              alt={name}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent className="px-2.5 py-1.5 border-none bg-primary-grey-200 text-xs">
          {name}
        </TooltipContent>
      </Tooltip>
    </>
  );
};

export default Avatar;
