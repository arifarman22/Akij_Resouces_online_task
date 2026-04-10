import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Image
              src="/images/footer_logo.png"
              alt="Akij Resource"
              width={140}
              height={46}
              className="object-contain brightness-0 invert"
            />
          </div>

          {/* Right: Helpline + Email */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <span className="flex items-center gap-2.5 text-base text-slate-300">
              <Image src="/images/call.png" alt="Phone" width={18} height={18} className="brightness-0 invert opacity-70" />
              <span className="text-slate-500 font-medium">Helpline</span>
              <span className="font-semibold">88 011020202505</span>
            </span>
            <span className="flex items-center gap-2.5 text-base text-slate-300">
              <Image src="/images/mail-01.png" alt="Email" width={18} height={18} className="brightness-0 invert opacity-70" />
              support@akijresource.com
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
