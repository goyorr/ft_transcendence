'use client'
import { ChangeEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'

import { BsQrCodeScan } from "react-icons/bs";


import { UseAppContext } from "@/context/AuthContext"

import { ErrorOtp } from "@/types/types"
import Link from "next/link";
import { AxiosError } from 'axios';
import AxiosInstance from '@/utils/axiosInstance';
import { useTranslation } from '@/hooks/useTranslation';

const NotFound_404 = () => {
    const { t } = useTranslation()
    return <div className="flex flex-col justify-center items-center gap-4">
        <section>
            <h1 className="text-slate-300">{t('pagenotexist')}</h1>
        </section>
        <section className="">
            <Link href="/login">
                <button className="rounded-lg bg-[#7c3aed] text-white hover:bg-[#7c3aed] p-3">
                    {t('backtologin')}
                </button>
            </Link>
        </section>
    </div>
}

interface IErrorResponse {
    message: string;
}

const TwoFa = () => {

    const router = useRouter()
    const { TwoFa, Tokens } = UseAppContext()

    const [Otp, setOtp] = useState<string>('')
    const [disable, setDisable] = useState<boolean>(false)

    const { t } = useTranslation()

    const [ErrorOtp, setErrorOtp] = useState<ErrorOtp | null>(null)

    const SendOtp = async () => {
        try {
            setDisable(true)
            const response = await AxiosInstance.post(`/api/v1/verify`, JSON.stringify({ otp: Otp, source: "/login" }),
                {
                    headers:
                    {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${Tokens.access}`
                    }
                })

            const data = await response.data
            if (data.otp_verified && response.status === 200) {
                setDisable(false)
                router.push("/game")
            }
        }
        catch (error) {
            const axiosError = error as AxiosError;

            if (axiosError.response && axiosError.response.status === 400) {
                const errorData = axiosError.response.data as IErrorResponse;
                setErrorOtp({ message: errorData.message, status: true })
                setDisable(false)
            }
        }
    }

    if (TwoFa.source !== '/login') {
        return <>
            <NotFound_404 />
        </>
    }

    const isNumber = (str: string): boolean => {
        return /\d/.test(str);
    }

    const handleOtp = (e: ChangeEvent<HTMLInputElement>) => {
        const otp = e.currentTarget.value

        if (otp.length === 0) {
            setOtp('')
        }

        if (isNumber(otp[otp.length - 1]) && otp.length <= 6) {
            setOtp(otp)

        }
    }
    useEffect(() => {
        if (Otp.length === 6) {
            SendOtp()
        }
    }, [Otp])

    return (
        <>
            <section className="flex justify-center items-center mb-8"><BsQrCodeScan size={60}></BsQrCodeScan></section>
            <section className="mb-4 flex justify-center items-center flex-col">
                <h1 className="text-lg font-extrabold">{t('verifyauth')}</h1>
                <p className="text-sm text-slate-300">{t('entersixdigit')}</p>
            </section>
            <form action={SendOtp} className="w-full h-full flex justify-center items-center flex-col">
                {ErrorOtp?.status === true && (
                    <div className=" border-red-400 text-[#e11d48] px-4 py-3 rounded relative" role="alert">
                        <span className="block text-xs  text-center">{ErrorOtp.message}</span>
                    </div>)}
                <input value={Otp} onChange={handleOtp} type="text" placeholder='Enter the six digits' className='py-[8px] px-[10px] w-full rounded-md text-xm border-slate-500 border-[0.1px] outline-none bg-transparent' />
                <button disabled={disable} type="submit" className={`w-full mt-4 bg-[#4338ca] hover:bg-[#4338ca] text-white p-3 rounded-md text-sm ${disable ? "opacity-5" : ""}`}>{t('verify')}</button>
            </form>
        </>
    )
}

export default TwoFa