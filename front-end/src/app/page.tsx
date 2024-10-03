"use client"
import Image from "next/legacy/image";
import { Crown, MessageCircle, Swords, Timer, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from '@/hooks/useTranslation';

export default function Home() {
  const router = useRouter();
  const {t} = useTranslation()

  // redirect to /login
  const redirectToLogin = () => {
    router.push("/login");
  }
  return (
    <div className="min-h-screen  text-white">
      <header className="relative bg-gradient-to-r overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-25">
          <img
            src="home/knight.jpg"
            alt="Ping Pong Background"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl font-extrabold mb-4 animate-fadeIn">
            {t('welcome')}
          </h1>
          <p className="text-lg mb-8 animate-fadeIn animation-delay-2">
            {t('welcome-subtitle')}
          </p>
          <button
            className="px-6 py-3 bg-white text-blue-500 font-semibold rounded-full hover:bg-gray-100 animate-fadeIn animation-delay-4"
            onClick={redirectToLogin}
          >
            {t('welcome-started')}
          </button>
        </div>
      </header>

      {/* creator */}
      <section className="py-16  ">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8">{t('WebsiteCreators')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="pt-8 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
              <Image
                src="/home/adardour.jpg"
                width={200}
                height={200}
                className="rounded-full"
              />
              <div className="flex flex-col items-center mb-4 gap-2 justify-center pt-8">
                  <h3 className="text-2xl font-semibold mb-2">Achraf Dardour</h3>
                  <h4 className="text-x text-gray-400">{t('achtask')}</h4>
              </div>
            </div>

            <div className="pt-8 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
              <Image
                src="/home/zel-kach.jpg"
                width={200}
                height={200}
                className="rounded-full"
              />
              <div className="flex flex-col items-center mb-4 gap-2 justify-center pt-8">
                <h3 className="text-2xl font-semibold mb-2">Zakaria El Kachradi</h3>
                <h4 className="text-x text-gray-400">{t('zatask')}</h4>
              </div>
            </div>

            <div className="pt-8 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
              <Image
                src="/home/mlektaib.jpg"
                width={200}
                height={200}
                className="rounded-full"
              />
              <div className="flex flex-col items-center mb-4 gap-2 justify-center pt-8">
                <h3 className="text-2xl font-semibold mb-2">Mohsine Lektaibi</h3>
                <h4 className="text-gray-400">{t('mohtask')}</h4>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-16 bg-gradient-to-r shadow-inne shadow-[#5b21b6]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8">{t('features')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
              <div className="flex flex-row items-start mb-4 gap-2">
                <Trophy />
                <h3 className="text-2xl font-semibold mb-2">
                  {t('comptour')}
                </h3>
              </div>
              <p>
                {t('jtc')}
              </p>
            </div>
            <div className="p-8 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
              <div className="flex flex-row items-start mb-4 gap-2">
                <Swords />
                <h3 className="text-2xl font-semibold mb-2">
                  {t('MultiplayerMatches')}
                </h3>
              </div>
              <p>
                {t('challenge')}
              </p>
            </div>
            <div className="p-8 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
              <div className="flex flex-row items-start mb-4 gap-2">
                <Crown />
                <h3 className="text-2xl font-semibold mb-2">
                  {t('GlobalLeaderboards')}
                </h3>
              </div>
              <p>
                {t('climb')}
              </p>
            </div>

            <div className="p-8 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
              <div className="flex flex-row items-start mb-4 gap-2">
                <Timer />
                <h3 className="text-2xl font-semibold mb-2">
                  {t('realtime')}
                </h3>
              </div>
              <p>{t('againstf')}</p>
            </div>

            <div className="p-8 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
              <div className="flex flex-row items-start mb-4 gap-2">
                <MessageCircle />
                <h3 className="text-2xl font-semibold mb-2">{t('realchat')}</h3>
              </div>
              <p>{t('knowyour')}</p>
            </div>

            <div className="p-8 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
              <div className="flex flex-row items-start mb-4 gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-house"
                >
                  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                  <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                <h3 className="text-2xl font-semibold mb-2">
                  {t('localmodes')}
                </h3>
              </div>
              <p>
                {t('roommode')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-4 bg-gray-800 text-center">
        <p>&copy; {t('rights')}</p>
      </footer>
    </div>
  );

}