import Image from "next/image";

import { directionOptions } from "@/constants";

import { Button } from "../ui/button";

type Props = {
  handleElemDirection: (value: string) => void;
};

const Direction = ({ handleElemDirection }: Props) => (
  <section className='flex flex-col gap-3 border-b border-primary-grey-200 py-3'>
    <h3 className='px-5 text-[10px] uppercase'>Direction</h3>

    <div className='flex border-primary-grey-200 px-5'>
      {directionOptions.map(({ value, icon, label }) => (
        <Button
          key={value}
          className='group hover:bg-primary-green'
          size='icon'
          onClick={() => handleElemDirection(value)}
        >
          <Image
            src={icon}
            alt={label}
            width={14}
            height={14}
            className='group-hover:invert'
          />
        </Button>
      ))}
    </div>
  </section>
);

export default Direction;
