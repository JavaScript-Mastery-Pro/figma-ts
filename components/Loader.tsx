import Image from "next/image";

function Loader() {
  return (
    <div className="flex justify-center items-center h-screen w-screen gap-2 flex-col">
      <Image
        src="/assets/loader.gif"
        alt="loader"
        width={100}
        height={100}
        className="object-contain"
      />
      <p className="text-sm text-primary-grey-300 font-bold">Loading...</p>
    </div>
  );
}

export default Loader;
