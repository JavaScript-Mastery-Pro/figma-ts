import CursorSVG from "@/public/assets/CursorSVG";

type Props = {
  color: string;
  x: number;
  y: number;
  message?: string;
};

function Cursor({ color, x, y, message }: Props) {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0"
      style={{
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
    >
      <CursorSVG color={color} />

      {message && (
        <div
          className="absolute top-5 left-2 rounded-3xl px-4 py-2"
          style={{ backgroundColor: color, borderRadius: 20 }}
        >
          <p className="whitespace-nowrap text-sm leading-relaxed text-white">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}

export default Cursor;
