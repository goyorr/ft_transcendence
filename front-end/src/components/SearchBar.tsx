'use client'

import React, { useState } from 'react'
import { Input } from './ui/input'
import { CiSearch } from 'react-icons/ci'
import { getCookie } from 'cookies-next';
import Link from 'next/link';
import Avatar from './avatar';
import { useTranslation } from '@/hooks/useTranslation';
import AxiosInstance from '@/utils/axiosInstance';

interface IUser {
  id:string,
  username:string,
  image?:string,
  first_name:string,
  last_name:string,
}

const User:React.FC<IUser> = (user) =>
{
    return (
      <>
      <Link className='rounded-lg flex flex-row justify-between items-center cursor-pointer ' href={`/profile/${user.id}`}>
          <section className="flex flex-col">
            <h1 className='text-sm'>{user.first_name && user.first_name[0].toUpperCase()}{user.first_name && user.first_name.slice(1)} {user.last_name && user.last_name[0].toUpperCase()}{user.last_name && user.last_name.slice(1)}</h1>
            <h1 className='text-sm text-slate-500 text-[8px]'>@{user.username}</h1>

          </section>
          <Avatar width='w-[40px]' height='h-[40px]'  src={`${user.image != null ? `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}${user.image}` : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`}`}  alt="user"></Avatar>
      </Link>
      </>
    )
}

const SearchBar = () => {

  const [users,setusers] = useState<IUser[]>([])
  const {t} = useTranslation()

  const handleSearching = async (query:string) =>
  {

    const data = new URLSearchParams()

    if (query)
    {
      data.append("q",query)
      const access = getCookie('access')
      const response = await AxiosInstance(`api/v1/searchUsers?${query.toLowerCase()}`,{
        method:"GET",
        headers:{
          'Authorization':`Bearer ${access}`
        },
        params:{
          q:query
        }
      })
    
      const users = await response.data

      setusers(users.users)
    }
    else
    {
      setusers([])
    }
  }


  const handleSubmit = (e:React.FormEvent) => {
    e.preventDefault();
  };
  return (
    <div className='flex-col relative    lg:flex z-40'>
                <form action="" onSubmit={handleSubmit}>
                  <section className='search relative -top-[8px]'>
                          <div className="relative ml-6 mt-4">
                              <Input onChange={(e) => handleSearching(e.target.value)} type="search" placeholder={t('findfriends')}  className={`backdrop-blur-xl bg-black/20 shadow-inner shadow-[#3730a3] pl-10  relative sm:w-[30rem] rounded-lg focus:ring-transparent transition ease-in-out delay-[0.5s] focus-visible:ring-offset-0 focus-visible:ring-0 focus:outline-none focus:ring focus:border-[#7c3aed]`} />
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                              <CiSearch className="h-5 w-5 text-gray-400" />
                          </span>
                          </div>
                  </section>
                </form>

                {users && users.length > 0 && (
                  <section className='q ml-[-12rem] w-[34rem] sm:w-[34rem] absolute mt-[4rem]  sm:ml-7 backdrop-blur-xl bg-black/20 shadow-inner shadow-[#3730a3] rounded-lg p-4 sm:min-w-[30rem] max-h-[28rem]  flex flex-col gap-4 overflow-auto'>
                    {users.map(user => (<User key={user.id} {...user}></User>))}
                  </section>
                )}
    </div>
  )
}

export default SearchBar  