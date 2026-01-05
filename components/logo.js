"use client";
import Image from "next/image";

import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/dashboard" className="flex w-full m-3.5">
      <Image src="/logo/trilogi.png" alt="logo-trilogi" height={50} width={50} className="rounded-full " />
      <h1 className="font-bold text-2xl item mt-1 ml-1">Trilogi App</h1>
    </Link>
  );
};
