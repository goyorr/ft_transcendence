'use client'

import React, { useEffect, useState } from 'react'
import { getCookie } from "cookies-next";
import { TypeBlockList } from "@/types/types"
import AxiosInstance from '@/utils/axiosInstance';
import { useTranslation } from '@/hooks/useTranslation';
import { UseAppContext } from "@/context/AuthContext"
import { toast } from 'sonner';

const ListBlocks = () => {
  const {t} = useTranslation();
  const access = getCookie("access")
  const [blockList, setBlockList] = useState<TypeBlockList[]>([])
  const { setShowBlocks } = UseAppContext()

  const unblock = async (e: React.MouseEvent<HTMLButtonElement>, blocked_id: string) => {
    e.preventDefault()
    try {
      const response = await AxiosInstance("api/v1/unblock", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${access}`,
          'Content-Type': 'application/json'
        },
        data:{
          blocked_id
        }
      })
      if (response.statusText === 'OK')
      {
        setBlockList(blockList.filter(((b:any) => b.blocked_id !== blocked_id)))
      }
      
    }
    catch(e)
    {
      toast.error(t('erroroccurred'))
    }
  }
  const getBlockList = async () => {
    try{
      const response = await AxiosInstance("api/v1/block", {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${access}`,
        },
      })
  
      const data = await response.data
      setBlockList(data.blockList)
    }
    catch(e)
    {
      toast.error(t('erroroccurred'))
    }
  }
  useEffect(() => {
    getBlockList()
  }, [])
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 dark:text-white p-8 rounded-lg max-w-md w-full">
      <div className='flex flex-row'>
        <h2 className="text-xl font-semibold text-slate-700 dark:text-white mb-2 -my-5">{t('blockedusers')}</h2>
        <button type="button" className="ms-auto -mx-6 -my-6 bg-white justify-center items-center flex-shrink-0 text-gray-700 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Close" onMouseDown={(event) => { event.stopPropagation(); setShowBlocks(false);}}>
          <span className="sr-only">{t('close')}</span>
          <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
          </svg>
        </button>
      </div>
        {blockList.map((block, index) => (
          <div
            key={index}
            className="mb-4 border border-slate-200 dark:border-slate-600 py-4 px-6 rounded-lg flex items-center justify-between shadow-sm"
          >
            <section>
              <h1 className="font-semibold text-base text-slate-700 dark:text-slate-300">
                {block.blocked_user_details.first_name}{" "}
                {block.blocked_user_details.last_name}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                @{block.blocked_user_details.username}
              </p>
            </section>
            <button
              onClick={(e) => unblock(e, block.blocked_id)}
              className="text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center gap-2 px-4 py-2 rounded-lg transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                className="text-slate-600 dark:text-slate-400"
              >
                <path
                  d="M16.5312 16.36V14.9523C16.5312 13.8741 17.4127 13 18.5 13C18.9887 13 19.4359 13.1766 19.7801 13.469M17.8437 22H19.1563C20.1777 22 20.6884 22 21.0749 21.7951C21.3802 21.6333 21.6302 21.3854 21.7934 21.0827C22 20.6993 22 20.1929 22 19.18C22 18.1671 22 17.6607 21.7934 17.2773C21.6302 16.9746 21.3802 16.7267 21.0749 16.5649C20.6884 16.36 20.1777 16.36 19.1563 16.36H17.8437C16.8223 16.36 16.3116 16.36 15.9251 16.5649C15.6198 16.7267 15.3698 16.9746 15.2066 17.2773C15 17.6607 15 18.1671 15 19.18C15 20.1929 15 20.6993 15.2066 21.0827C15.3698 21.3854 15.6198 21.6333 15.9251 21.7951C16.3116 22 16.8223 22 17.8437 22Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M12.5 22H6.59087C5.04549 22 3.81631 21.248 2.71266 20.1966C0.453365 18.0441 4.1628 16.324 5.57757 15.4816C7.97679 14.053 10.8425 13.6575 13.5 14.2952"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              {t('unblock')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ListBlocks
