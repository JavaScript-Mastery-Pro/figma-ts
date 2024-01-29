import { CursorMode, CursorState } from "@/types/type";
import CursorSVG from "@/public/assets/CursorSVG";

type Props = {
  cursor: { x: number; y: number };
  cursorState: CursorState;
  setCursorState: (cursorState: CursorState) => void;
  updateMyPresence: (
    presence: Partial<{
      cursor: { x: number; y: number };
      cursorColor: string;
      message: string;
    }>
  ) => void;
};

const CursorChat = ({
  cursor,
  cursorState,
  setCursorState,
  updateMyPresence,
}: Props) => (
  <div
    className='absolute left-0 top-0'
    style={{
      transform: `translateX(${cursor.x}px) translateY(${cursor.y}px)`,
    }}
  >
    {cursorState.mode === CursorMode.Chat && (
      <>
        <CursorSVG color='#000' />

        <div
          className='absolute left-2 top-5 bg-blue-500 px-4 py-2 text-sm leading-relaxed text-white'
          onKeyUp={(e) => e.stopPropagation()}
          style={{
            borderRadius: 20,
          }}
        >
          {cursorState.previousMessage && (
            <div>{cursorState.previousMessage}</div>
          )}
          <input
            className='z-10 w-60 border-none	bg-transparent text-white placeholder-blue-300 outline-none'
            autoFocus={true}
            onChange={(e) => {
              updateMyPresence({ message: e.target.value });
              setCursorState({
                mode: CursorMode.Chat,
                previousMessage: null,
                message: e.target.value,
              });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setCursorState({
                  mode: CursorMode.Chat,
                  previousMessage: cursorState.message,
                  message: "",
                });
              } else if (e.key === "Escape") {
                setCursorState({
                  mode: CursorMode.Hidden,
                });
              }
            }}
            placeholder={cursorState.previousMessage ? "" : "Say something…"}
            value={cursorState.message}
            maxLength={50}
          />
        </div>
      </>
    )}
  </div>
);

export default CursorChat;
