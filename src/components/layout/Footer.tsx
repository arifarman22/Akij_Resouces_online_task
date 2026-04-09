import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left: Logo + Powered by */}
          <div className="flex items-center">
            <Image
              src="/images/footer_logo.png"
              alt="Akij Resource"
              width={120}
              height={40}
              className="object-contain brightness-0 invert"
            />
          </div>

          {/* Right: Phone + Email */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <span className="flex items-center gap-2 text-sm text-slate-400">
              <Image src="/images/call.png" alt="Phone" width={16} height={16} className="brightness-0 invert opacity-60" />
              +880 1234 567890
            </span>
            <span className="flex items-center gap-2 text-sm text-slate-400">
              <Image src="/images/mail-01.png" alt="Email" width={16} height={16} className="brightness-0 invert opacity-60" />
              support@akijresource.com
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
