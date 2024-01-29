import { Label } from "../ui/label";
import { Input } from "../ui/input";

const dimensionsOptions = [
  { label: "W", property: "width" },
  { label: "H", property: "height" },
];

type Props = {
  width: string;
  height: string;
  handleInputChange: (property: string, value: string) => void;
};

const Dimensions = ({ width, height, handleInputChange }: Props) => (
  <section className='flex flex-col border-b border-primary-grey-200'>
    <div className='flex flex-col gap-4 px-6 py-3'>
      {dimensionsOptions.map((item) => (
        <div
          key={item.label}
          className='flex flex-1 items-center gap-3 rounded-sm'
        >
          <Label htmlFor={item.property} className='text-[10px] font-bold'>
            {item.label}
          </Label>
          <Input
            type='number'
            id={item.property}
            placeholder='100'
            min={10}
            max={10}
            value={item.property === "width" ? width : height}
            className='input-ring'
            onChange={(e) => handleInputChange(item.property, e.target.value)}
          />
        </div>
      ))}
    </div>
  </section>
);

export default Dimensions;
