import Image from "next/image";
import Link from "next/link";
import { NavBar } from "@/components/navbar";
import { checkDbConnection } from "@/lib/db/client";

export default async function Home() {
  const result = await checkDbConnection();
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 md:max-w-lg md:px-0 lg:max-w-xl">
        <NavBar />
        <main className="flex flex-1 flex-col justify-center">
          <h1 className="text-3xl font-semibold leading-none tracking-tighter md:text-4xl md:leading-none lg:text-5xl lg:leading-none">
            Vercel with Neon Postgres
          </h1>
        </main>
      </div>
    </div>
  );
}
