import Image from "next/image";

export default function FloatingMascot() {
  return (
    <div
      className={`fixed z-50 pointer-events-none hide-on-search-mobile
        /* Mobile Positioning */
        bottom-20 -right-6 w-32 
        /* Desktop Positioning */
        lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:-right-10 lg:w-48 xl:w-64`}
    >
      <Image
        src="/padhloo.png"
        alt="Padhloo Mascot"
        width={256}
        height={256}
        className="w-full object-contain drop-shadow-2xl"
      />
    </div>
  );
}
