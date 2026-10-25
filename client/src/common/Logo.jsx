import Image from "next/image";
import Link from "next/link";

// logo.png has dark text, so invert it on dark backgrounds
function Logo({ className = "dark:brightness-0 dark:invert" }) {
  return (
    <Link href="/" className="flex items-center" dir="ltr">
      <Image
        src="/logo.png"
        alt="NEXAIVON"
        width={1536}
        height={310}
        priority
        className={`h-10 w-auto ${className}`}
      />
    </Link>
  );
}
export default Logo;
