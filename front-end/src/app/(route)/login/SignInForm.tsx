'use client'
import SubmitButton from "./SubmitButton"
import { dataLogin } from "@/types/types"
import { useEffect, useRef, useState, ChangeEvent } from "react"
import Link from "next/link"
import { errorHandling } from "@/types/types"

import { useRouter, useSearchParams, ReadonlyURLSearchParams } from 'next/navigation'

import { AxiosError } from "axios"
import { UseAppContext } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import LoadingDoted from "@/components/LoadingDoated"
import validateField, { StyleInput } from '@/utils/ParsingFields'
import { toast } from "sonner"
import { useTranslation } from "@/hooks/useTranslation"
import { useLanguage } from "@/context/LanguageContext"
import { IoMdLogIn } from "react-icons/io";
import AxiosInstance from "@/utils/axiosInstance"


const SignIn = () => {

    const searchParams: ReadonlyURLSearchParams | null = useSearchParams();
    const router = useRouter()
    const passwordRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const [isError, setIsError] = useState<string | null>(null)
    const [disabled, setDisabled] = useState<boolean>(false)
    const [email, setEmail] = useState<string>('')
    const [pass, setPassword] = useState<string>('')
    const { language } = useLanguage()

    const { setTwoFa, SetTokens } = UseAppContext()

    const { t } = useTranslation()

    const [loading, setLoading] = useState<boolean>(false)
    const [loadingIntra, setLoadingIntra] = useState<boolean>(false)

    const [errorDisplay, setErrorDisplay] = useState<errorHandling>({
        email: '',
        username: '',
    })

    const HandleAuth = async (e: any) => {
        setLoading(true)
        setDisabled(true)
        e.preventDefault()

        const formData: dataLogin =
        {
            email: email,
            password: pass,
        }
        const validateFields = validateField(formData, "in", language === "en" || language === "fr" ? language : null)

        if (!validateFields.success) {
            const fieldErrors = validateFields.fieldsError;
            let updatedErrors = { ...errorDisplay };

            if (fieldErrors.email && fieldErrors.email.length > 0) {
                if (emailRef.current) {
                    emailRef.current.style.borderColor = '#e11d48';
                    updatedErrors.email = fieldErrors.email
                }
            }
            if (fieldErrors.password && fieldErrors.password.length > 0) {
                if (passwordRef.current) {
                    passwordRef.current.style.borderColor = '#e11d48';
                    updatedErrors.password = fieldErrors.password
                }
            }
            setErrorDisplay(updatedErrors);
            setLoading(false)
            setDisabled(false)
            return
        }

        try {
            const response = await AxiosInstance(`/api/v1/login/`,
            {
                method: "POST",
                data: formData,
                withCredentials: true
            }
            )
            if (response.status === 200) {
                const data = await response.data
                const { twofa } = data

                if (twofa === false) {
                    router.push('/game')
                }

                else {
                    const Tokens =
                    {
                        access: data.access,
                        refresh: data.refresh,
                    }
                    const AuthaValid =
                    {
                        source: '/login',
                        isLogged_in: true,
                        twoFaRequired: true
                    }
                    setTwoFa(AuthaValid)
                    SetTokens(Tokens)
                    router.push("/auth")
                }
            }
        }
        catch (error) {
            const axiosError = error as AxiosError;

            if (axiosError.response && axiosError.response.status === 404) {
                if (language === 'fr') {
                    setIsError('L\'utilisateur n\'existe pas ou une erreur s\'est produite')
                }
                else {
                    setIsError(t('userNotFound'))
                }
            }
            else {
                setIsError(t('erroroccured'))
            }
        }
        finally {
            setLoading(false)
            setEmail('')
            setPassword('')
            setDisabled(false)
            setTimeout(() => {
                setIsError(null)
            }, 3000)
        }
    }

    const HandleOauth = (e: any) => {
        e.preventDefault()
        router.push(`${process.env.NEXT_PUBLIC_REDIRECT_OAUTH === undefined ? '/login' :  process.env.NEXT_PUBLIC_REDIRECT_OAUTH}`)
    }

    const HandleChnage = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget

        if (name === 'email') {
            setEmail(value)
        }
        else if (name === 'pass') {
            setPassword(value)
        }
    }

    const sendCode = async () => {
        const code: string | null = searchParams?.get("code") ?? null;
        if (code !== null) {
            try {
                setLoadingIntra(true)
                const response = await AxiosInstance("/api/v1/oauth/",
                    {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: JSON.stringify({ code })
                    })
                if (response.status === 200) {
                    const data = await response.data
                    if (data.twofa === true) {
                        const Tokens =
                        {
                            access: data.access_token,
                            refresh: data.access_token,
                        }
                        const AuthaValid = {
                            source: '/login',
                            isLogged_in: true,
                            twoFaRequired: true
                        }
                        setTwoFa(AuthaValid)
                        SetTokens(Tokens)
                        setLoadingIntra(false)
                        router.push("/auth")
                    }
                    else {
                        setLoadingIntra(false)
                        router.push("/game")
                    }
                }
                else if (response.status === 400) {
                    setLoadingIntra(false)
                    toast.error(t('userNotFound'))
                }
            }
            catch (e) {
                setLoadingIntra(false)
                toast.error(t('erroroccured'))
            }
        }
    }

    useEffect(() => {
        sendCode()
    }, [])

    return (
        <div className="w-full p-6 sm:p-0 sm:max-w-[32rem] font-extrabold">
            <span className="flex justify-start items-start text-3xl sm:text-5xl font-extrabold matemasie-regular ">PINGY</span>
            <form className="mt-8" method="POST">
                <section className="flex justify-start items-start flex-col">
                    <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">{t('greeting')}</h1>
                    <p className="mb-6 text-xs sm:text-sm text-slate-400">{t('loginPrompt')}</p>
                </section>
                <section className="mb-6">
                    {isError !== null && (
                        <div className="bg-[#fca5a5] p-4 rounded-md text-[#ef4444] px-4 py-3 relative" role="alert">
                            <span className="block text-xs text-center font-extrabold">{isError}</span>
                        </div>
                    )}
                </section>
                <div className="mb-5">
                    <label className="text-xs font-extralight" htmlFor="email">{t('email')}</label>
                    <input onChange={HandleChnage} value={email} ref={emailRef} className={`${StyleInput} border-[1px] border-slate-400`} id="email" name="email" placeholder={t('emailPlaceholder')} />
                    {errorDisplay.email && (
                        <section className="error_username mt-2 rounded-md">
                            <h1 className="text-xs text-[#9f1239]">{errorDisplay.email}</h1>
                        </section>
                    )}
                </div>
                <div className="mb-5">
                    <label className="text-xs font-extralight" htmlFor="password">{t('password')}</label>
                    <input onChange={HandleChnage} value={pass} ref={passwordRef} type="password" className={`${StyleInput} border-[1px] border-slate-400`} id="pass" name="pass" placeholder="********" />
                    {errorDisplay.password && (
                        <section className="error_username mt-2 rounded-md">
                            <h1 className="text-xs text-[#9f1239]">{errorDisplay.password}</h1>
                        </section>
                    )}
                    <section className="text-slate-400 flex justify-end items-end mt-2">
                        <Link href="/reset">
                            <h1 className="text-xs font-semibold underline">{t('forgotPassword')}</h1>
                        </Link>
                    </section>
                </div>
                <section className="flex flex-col space-y-4">
                    <Button onClick={HandleAuth} disabled={disabled || loadingIntra} className=" py-8 bg-gradient-to-r font-extrabold bg-[#6d28d9] flex justify-between items-center w-full h-10 rounded-md text-sm text-white hover:bg-[#6d28d9]">
                        {loading ? <LoadingDoted /> : t('signIn')}
                        <span className="shadow-inner shadow-[#a855f7] p-2 rounded-md">
                            <IoMdLogIn size={16} />
                        </span>
                    </Button>

                    <span className="p-2 flex justify-center text-xs text-gray-600 flex-row items-center gap-6 mb-4">
                        <span className="bg-gray-700 flex-1 h-[1px]" />
                        OR
                        <span className="bg-gray-700 flex-1 h-[1px]" />
                    </span>

                    <Button disabled={loadingIntra} onClick={HandleOauth} type="button" className="mt-8 w-full h-10 text-xs rounded-md">
                        {loadingIntra ? <LoadingDoted /> : t('loginIntra')}
                    </Button>
                </section>
            </form>
            <section>
                <Link href="/signup">
                    <SubmitButton text={t('signUp')} className="underline w-full h-10 text-xs rounded-md bg-transparent text-white mt-8 hover:bg-transparent font-extrabold" />
                </Link>
            </section>
        </div>
    );
}

export default SignIn