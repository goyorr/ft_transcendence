'use client'

import React, { useEffect, useState } from 'react';
import Link from "next/link"
import LoadingDoted from '@/components/LoadingDoated';
import { useTranslation } from '@/hooks/useTranslation';

const Reset = () => {

    const [email, setEmail] = useState('');
    const [disabled, setDisabled] = useState<boolean>(true)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string>('')
    const { t } = useTranslation()

    const [check, setCheck] = useState<boolean>(false)

    function validateEmail(email: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }


    const getTheLink = async () => {
        try {
            setCheck(true)
            const response = await fetch(`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/v1/request-password-reset/`, {
                method: "POST",
                body: JSON.stringify({
                    email
                }),
                headers:
                {
                    'Content-type': 'application/json'
                }
            })

            if (!response.ok) {
                if (response.status === 404) {
                    setError(t('ErrorEmailReset'));
                } else {
                    setError(t('UnexpectedError'));
                }
                setSuccess(false);
                setDisabled(true);
                setEmail('');
                setCheck(false);
        
                setTimeout(() => {
                    setError('');
                }, 5000);
            }

            else {
                setSuccess(true)
                setCheck(false)
                setTimeout(() => {
                    setSuccess(false)
                    setEmail('')
                }, 5000)
            }
        }
        catch (e) {
            if (e instanceof TypeError) {
                setError(t('NetworkError'));
            } else if (e instanceof SyntaxError) {
                setError(t('ResponseParsingError'));
            } else {
                setError(t('UnexpectedError'));
            }
        
            setSuccess(false);
            setCheck(false);
        
            setTimeout(() => {
                setError('');
            }, 5000);
        }
    };



    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.currentTarget.value)
    }

    useEffect(() => {
        if (validateEmail(email) && email.length > 8) {
            setDisabled(false)
        }
        else {
            setDisabled(true)
        }
    }, [email])

    const handleCancel = () => {
        setEmail('');
    };

    return (
        <div className="w-full   flex justify-center items-center  h-screen">
            <div className="flex flex-col w-full sm:max-w-[32rem] p-6 rounded shadow-lg  ">
                <h1 className="text-2xl font-bold  text-white">{t('getLinksButton')}</h1>

                <p className=" text-sm mb-8 mt-2 text-slate-500">
                    {t('getLinksPrompt')}
                </p>

                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-300 text-xs font-medium mb-2">{t('email')}</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleChange}
                        className="bg-[#0f172a] shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline text-xs"
                        placeholder={t('emailPlaceholder')}
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        disabled={disabled}
                        onClick={getTheLink}
                        className={`bg-gradient-to-r bg-[#6d28d9] p-4 flex justify-center items-center hover:bg-[#7c4dff] text-white font-bold text-xs rounded focus:outline-none focus:shadow-outline`}
                    >
                        {check ? <LoadingDoted /> : `${t('getLinksButton')}`}
                    </button>

                    {success && <h1 className='p-2 text-center text-xs text-[#16a34a] mt-2'>{t('successEmailReset')}</h1>}
                    {error.length > 0 && <h1 className='border-[#fef2f2] p-2 text-center text-xs text-[#f87171] shadow-2xl'>{error}</h1>}

                    <Link
                        href='/login'
                        onClick={handleCancel}
                        className="bg-transparent hover:bg-transparent text-blue-500 font-medium text-xs rounded focus:outline-none focus:shadow-outline mt-2 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20} fill="none">
                            <path d="M11 6H15.5C17.9853 6 20 8.01472 20 10.5C20 12.9853 17.9853 15 15.5 15H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6.99998 12C6.99998 12 4.00001 14.2095 4 15C3.99999 15.7906 7 18 7 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {t('getLinksBack')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Reset;
