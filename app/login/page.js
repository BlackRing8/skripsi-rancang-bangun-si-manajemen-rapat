"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    router.push("/dashboard");
    return false;
  }

  return (
    <main className="flex h-full w-full bg-linear-to-br from-white via-indigo-300 to-white justify-center items-center sm:pr-24">
      <div className="flex bg-white shadow-black  shadow-lg rounded-3xl py- ">
        {/* container gambar */}
        <div className=" max-w-sm w-80 hidden md:relative md:flex ">
          <Image src="/assets/login-2.svg" alt="illustrasi" fill className="object-contain pl-12" />
        </div>
        {/* Container form */}
        <div className="max-w-xs md:max-w-sm bg-white  py-8 px-16 rounded-3xl shadow-lg shadow-black md:shadow-none">
          <Image src="/logo/logo-trilogi.jpg" width={100} height={100} alt="logo-universitas-trilogi" className="mx-auto my-2" />
          <p className="text-center">Aplikasi sistem informasi manajemen rapat Universitas Trilogi</p>
          <h1 className="w-full text-center font-bold text-2xl mb-2 mt-2 text-blue-600"> LOGIN HERE </h1>

          <div className="w-full  justify-center flex">
            <button onClick={() => signIn("google", { callbackUrl: "/" })} className="bg-blue-600 text-white px-4 py-4 font-semibold rounded-lg hover:bg-blue-400 transition hover:cursor-pointer">
              Login dengan Google
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
