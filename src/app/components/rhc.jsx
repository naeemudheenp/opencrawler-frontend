import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Copy } from "lucide-react";

export default function RhcModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="font-normal  hover:underline-offset-2 hover:underline hover:text-black transition-all hover:cursor-pointer text-gray-500  text-sm -mt-3  tracking-normal">
          Automate sitemap validation post-deployment with our &nbsp;
          <span className=" bg-gradient-to-r font-semibold from-red-500 to-purple-500 bg-clip-text text-transparent">
            Release Health Check Api [RHC]
          </span>
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[685px] bg-white">
        <DialogHeader>
          <DialogTitle>
            <span className=" text-center bg-gradient-to-r font-semibold from-red-500 to-purple-500 bg-clip-text text-transparent">
              Release Health Check Api
            </span>
          </DialogTitle>
          <DialogDescription>
            You can use this API after deployment to verify whether all pages in
            the sitemap are valid or broken.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 py-4 bg-gray-200/20 rounded-md p-1  justify-between items-center">
          <div className=" flex gap-2 justify-center items-center">
            <span className=" text-green-600">GET</span>
            <span className=" ">
              {process.env.NEXT_PUBLIC_FRONTEND}
              /api/rhc?url=https://www.yourdomain.com/sitemap.xml
            </span>
          </div>
          <span
            onClick={() => {
              navigator.clipboard
                .writeText(` ${process.env.NEXT_PUBLIC_FRONTEND}
              /api/rhc?url=`);
            }}
            className=" hover:scale-105 cursor-pointer"
          >
            <Copy height={16} width={16} />
          </span>
        </div>
        <div className="">
          Response
          <div className=" mt-3 gap-1">
            <span className=" text-green-200 bg-green-600 px-2 py-1 rounded-md  text-sm">
              200
            </span>
            <span className=" text-md"> : All pages are valid.</span>
          </div>
          <div className=" mt-1 gap-1">
            <span className=" text-red-200 bg-red-600 px-2 py-1 rounded-md  text-sm">
              422
            </span>
            <span className=" text-md">
              {" "}
              :Some pages are broken.Will also include broken links in response.
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
