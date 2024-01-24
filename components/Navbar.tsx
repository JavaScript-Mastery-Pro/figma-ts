import Image from "next/image";

function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-primary-black p-5 text-white gap-4 select-none">
      <Image src="/assets/logo.svg" alt="FigPro Logo" width={58} height={20} />
    </nav>
  );
}

export default Navbar;
