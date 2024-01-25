import { Button } from "../ui/button";
import { exportToPdf } from "@/lib/utils";

function Export() {
  return (
    <div className="flex flex-col py-3 px-5 gap-3">
      <h3 className="text-[10px] uppercase">Export</h3>
      <Button
        variant="outline"
        className="w-full border border-primary-grey-100 hover:bg-primary-green hover:text-primary-black"
        onClick={exportToPdf}
      >
        Export to PDF
      </Button>
    </div>
  );
}

export default Export;
