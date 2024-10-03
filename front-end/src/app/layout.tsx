'use client'

import { Inter } from "next/font/google";
import {  Wrapper } from "@/context/AuthContext";
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner'
import Abstarct from "../../public/images/Absss.jpeg"
import Image from "next/legacy/image";
import { LanguageProvider } from "@/context/LanguageContext"

import "@/app/globals.css";

import SideBar from "@/components/SideBar";
const int = Inter({ subsets: ["latin"] });

const originalConsoleError = console.error;
console.error = (message, ...args) => {
  if (typeof message === 'string' && message.includes('defaultProps will be removed')) {
    return;
  }
  originalConsoleError.apply(console, [message, ...args]);
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) { 


  const pathname = usePathname();

  return (
    <html lang="en" className="dark">
      <LanguageProvider>
        <body className={`${int.className} body`} suppressHydrationWarning={true}>

          <div className=' w-full min-h-screen fixed'>
            <Image
              src={Abstarct}
              alt="Your Image Description"
              layout="fill"
              objectFit="cover"
              className="z-0"
            />
            <div className="absolute inset-0 backdrop-blur-xl bg-[#020617]/30  z-10">
            </div>
          </div>

          <Wrapper>
            <Toaster richColors />
            {pathname !== '/signup' && pathname !== '/'  && pathname !== '/auth' && pathname !== '/login' && pathname !== '/reset' && pathname !== '/game/remote' && pathname !== '/game/local' && pathname !== '/game/multiplayer'&& pathname !== '/game/tournament' && pathname !== '/chat' && (
            // {pathname !== '/signup' && pathname !== '/login' && pathname !== '/reset' && (
              <>
                <div className={`absolute bottom-0   flex flex-row justify-center sm:justify-start sm:items-center  sm:left-0 w-full sm:w-0  `}>
                  <SideBar />
                </div>
              </>
            )}

            <div className="grid grid-cols-12 gap-[4rem]">
              {/* <section className={`absolute w-full col-span-11 ${(pathname === '/signup' || pathname === '/login') ? '2xl:col-span-12' : '2xl:col-span-12'} z-10`}> */}
              <section className={`absolute w-full col-span-11 ${(pathname === '/signup' || pathname === '/login' || pathname === '/game/remote' || pathname === '/game/multiplayer' || pathname !== '/game/tournament') ? '2xl:col-span-12' : '2xl:col-span-12'} z-10`}>
                {children}
              </section>
            </div>
          </Wrapper>
        </body>
      </LanguageProvider>
    </html>
  );
}
