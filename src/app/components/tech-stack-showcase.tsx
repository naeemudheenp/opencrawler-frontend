import Image from "next/image";

export default function TechStackShowcase() {
  return (
    <div className="relative -bottom-[180px] !mb-20  w-full max-w-2xl mx-auto bg-white  shadow-md rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold  text-black  mr-4">Built On</h2>
          <div className="flex items-center space-x-4">
            <LogoItem
              src="https://assets.vercel.com/image/upload/v1607554385/repositories/vercel/logo.png"
              alt="Vercel Logo"
              name="Vercel"
            />
            <LogoItem
              src="https://wiki.postgresql.org/images/a/a4/PostgreSQL_logo.3colors.svg"
              alt="PostgreSQL Logo"
              name="PostgreSQL"
            />
            <LogoItem
              src="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_dark_background.png"
              alt="Next.js Logo"
              name="Next.js"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LogoItem({
  src,
  alt,
  name,
}: {
  src: string;
  alt: string;
  name: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 relative mb-1">
        <Image src={src} alt={alt} layout="fill" objectFit="contain" />
      </div>
      <span className="text-xs font-medium  text-black">{name}</span>
    </div>
  );
}
