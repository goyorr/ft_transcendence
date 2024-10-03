
'use client'

import { getCookie } from "cookies-next";

import NavBar from "@/components/NavBar"
import Header from "./Header"

import Loading from "./loading"
import { UseAppContext } from "@/context/AuthContext"

import { useEffect, useState } from 'react'
import Link from "next/link";
import AxiosInstance from "@/utils/axiosInstance";
import FriendList from "./FriendList";
import Online from "./Online";
import { useTranslation } from "@/hooks/useTranslation";
import {IGamesData} from "@/types/types"
import { toast } from "sonner";

const Layout = ({ children, params, }: { children: React.ReactNode, params: { id: string, } }) => {

  const { id } = params;
  const [profile, setProfile] = useState<any>(null);
  const [is_Loading, setIsLoading] = useState<boolean>(true)
  const [notfound, setNotFound] = useState<boolean>(false)
  const access = getCookie("access")
  const { userLoggedIn, setFriends, friends,setGamesData } = UseAppContext();

  const [isBlocker, setisBlocker] = useState<boolean>(false)
  const [isBlocked, setisBlocked] = useState<boolean>(false)

  const { t } = useTranslation()

  const getBlockUser = async () => {
    try {
      const response = await AxiosInstance(`/api/v1/SingleBlock/${id}`,
        {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${access}`,
            'Content-Type': 'application/json'
          },
        }
      )


      if (response.statusText === 'OK') {
        const data = await response.data
        setisBlocker(data.isBlocker)
        setisBlocked(data.isBlocked)
      }
    } catch (e) {
      toast.error(t('unexpectederror'))
    }
  }

  const getDataProfile = async () => {
    try {
      const response = await AxiosInstance(`/api/v1/profile/${id}`, {
        headers: {
          'Authorization': `Bearer ${access}`,
        }
      });

      if (response.statusText !== 'OK') {
        if (response.status === 404) {
          setNotFound(true)
        }
        throw new Error('Network response was not ok');
      }

      if (response.statusText === 'OK') {
        const data = await response.data;
        const dataGames:IGamesData = {
          loses: data.user.lose,
          wins: data.user.win,
          totlgames: data.user.total_game,
          tournaments:data.user.tournaments_won
        }
        setGamesData(dataGames)
        setFriends(data.user.friends)
        setProfile(data)
        setIsLoading(false)
      }

    } catch (error) {
      setNotFound(true)
    }
  };

  useEffect(() => {
    getDataProfile();
  }, [])

  useEffect(() => {
    getBlockUser()
  }, [])

  if (notfound) {
    return (
      <div className="flex justify-center items-center h-screen ">
        <div className="p-6 max-w-lg mx-auto  rounded-lg flex flex-col gap-4 items-center space-y-4">
          <h1 className="text-[6rem] font-extrabold mb-8">
            404
          </h1>
          <h2 className="text-3xl font-semibold text-white">{t('oops')}</h2>
          <p className="text-gray-600 text-center">{t('dontexists')}</p>
          <Link href={`/profile/${userLoggedIn}`} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            {t('goback')}
          </Link>
        </div>
      </div>
    )
  }


  return (
    <>
      {is_Loading ? (<Loading />) : (<div className="flex flex-col relative">
        <NavBar></NavBar>
        <div className="w-full  h-full flex flex-col max-w-[148rem] justify-center items-center container mx-auto">
        <div className="flex flex-col-reverse  w-full sm:w-[90%] md:w-full lg:w-full h-full lg:grid grid-cols-12">
          <div className="col-span-4 2xl:col-span-2  p-4  mt-4">
            <FriendList setFriends={setFriends} friends={friends} params={params} />
          </div>
          <div className="col-span-8 2xl:col-span-8  p-4">
            <Header {...profile.user} same_user={profile.same_user} isBlocker={isBlocker} isBlocked={isBlocked} />
            {isBlocker === false && isBlocked === false &&
              <section className="mt-4">
                {children}
              </section>
            }
          </div>
          <div className="col-span-3 md:col-span-2  2xl:block 2xl:p-4 2xl:mt-4">
            <Online />
          </div>
        </div>
        </div>
      </div>)}
    </>
  )
}

export default Layout