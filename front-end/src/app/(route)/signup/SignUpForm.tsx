'use client'

import SubmitButton from "../login/SubmitButton"
import { dataLogin, errorHandling } from "@/types/types"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import LoadingDoted from "@/components/LoadingDoated"
import validateField, { StyleInput } from '@/utils/ParsingFields'
import AxiosInstance from "@/utils/axiosInstance"
import { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/hooks/useTranslation"
import { useLanguage } from "@/context/LanguageContext"



const SignUp = () => {
  const first_nameRef = useRef<HTMLInputElement | null>(null);
  const last_nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const [errors, setErrors] = useState<string[] | null>(null);

  const router = useRouter()

  const { t } = useTranslation()

  const validatePassword = (password: string) => {
    const validationErrors: string[] = [];
    if (!/[a-z]/.test(password)) {
      validationErrors.push(t('passwordValidation')['lowercase']);
    }
    if (!/[A-Z]/.test(password)) {
      validationErrors.push(t('passwordValidation')['uppercase']);
    }
    if (!/[0-9]/.test(password)) {
      validationErrors.push(t('passwordValidation')['number']);
    }
    if (!/[!@#$%^&*]/.test(password)) {
      validationErrors.push(t('passwordValidation')['specialCharacter']);
    }
    return validationErrors;
  };


  const [errorDisplay, setErrorDisplay] = useState<errorHandling>({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
  })

  const [loading, setLoading] = useState<boolean>(false)
  const [messageError, setMessageError] = useState<string>('')
  const { language } = useLanguage()


  const HandleAuth = async (e: any) => {
    setLoading(true)
    e.preventDefault()

    setErrors([])

    const data: any = new FormData(e.target)
    const formData: dataLogin = {
      email: data.get('email')?.length ? data.get('email') : undefined,
      password: data.get('pass')?.length ? data.get('pass') : undefined,
      first_name: data.get('first_name')?.length ? data.get('first_name') : undefined,
      last_name: data.get('last_name')?.length ? data.get('last_name') : undefined
    };

    if (formData.password === undefined) {
      setErrors((prevArray) => [...(prevArray || []), t('passwordValidation')['length']]);
      if (passwordRef.current) {
        passwordRef.current.style.borderColor = '#e11d48';
      }
    }

    if (formData.password) {

      const validationErrors = validatePassword(formData.password);

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setLoading(false)
        if (passwordRef.current) {
          passwordRef.current.style.borderColor = '#e11d48';
        }
        return
      }
    }

    const validateFields = validateField(formData, "up", language === "en" || language === "fr" ? language : null)

    if (!validateFields.success) {
      const fieldErrors = validateFields.fieldsError;
      let updatedErrors = { ...errorDisplay };

      if (fieldErrors.email && fieldErrors.email.length > 0) {
        if (emailRef.current) {
          emailRef.current.style.borderColor = '#e11d48';
          updatedErrors.email = fieldErrors.email;
        }
      }
      if (fieldErrors.first_name && fieldErrors.first_name.length > 0) {
        if (first_nameRef.current) {
          first_nameRef.current.style.borderColor = '#e11d48';
          updatedErrors.first_name = fieldErrors.first_name
        }
      }
      if (fieldErrors.last_name && fieldErrors.last_name.length > 0) {
        if (last_nameRef.current) {
          last_nameRef.current.style.borderColor = '#e11d48';
          updatedErrors.last_name = fieldErrors.last_name
        }
      }
      setErrorDisplay(updatedErrors);
      setLoading(false)
      return
    }
    if (formData.first_name !== undefined && formData.last_name !== undefined) {
      formData.username = `${formData.first_name[0]}${formData.last_name}`
    }

    const dataSend: dataLogin =
    {
      email: formData.email as string,
      password: formData.password as string,
      username: formData.username as string,
      first_name: formData.first_name as string,
      last_name: formData.last_name as string
    }
    try {
      const response = await AxiosInstance.post(`/api/v1/register`, dataSend,
        {
          headers:
          {
            'Content-type': 'application/json'
          },
        });

      if (response.status === 201) {
        router.push('/login')
      }
    }

    catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response && axiosError.response.status === 409) {
        setMessageError(t('alreadyexist'))
        setLoading(false)
        setTimeout(() => {

          setMessageError('')
          setLoading(false)
        }, 5000)
      }
      else {
        setMessageError(t('erroroccured'))
        setLoading(false)
        setTimeout(() => {

          setMessageError('')
          setLoading(false)
        }, 5000)
      }
    }
  }

  useEffect(() => {
    setTimeout(() => {
      if (emailRef.current !== null && passwordRef.current != null && last_nameRef.current !== null && first_nameRef.current !== null) {
        emailRef.current.style.borderColor = '';
        passwordRef.current.style.borderColor = '';
        first_nameRef.current.style.borderColor = '';
        last_nameRef.current.style.borderColor = '';
      }
      setErrorDisplay({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
      })
    }, 5000)

  }, [errorDisplay])

  return (
    <div className="w-full p-8 sm:p-0 sm:max-w-[32rem] font-extrabold text-xl">
      <span className="text-3xl sm:text-5xl font-extrabold matemasie-regular flex justify-center">PINGY</span>
      <section className="flex justify-center items-center flex-col mt-8">
        <h1 className="sm:text-2xl font-extrabold mb-2 ">{t('createaccount')}</h1>
        <p className="text-xs sm:text-sm text-slate-400">{t('joinus')}</p>
      </section>
      <form onSubmit={HandleAuth} className="mx-auto w-full rounded-md p-4 " method="POST">
        <section className="mb-6">
          {messageError && (
            <div className="bg-[#fca5a5] p-4 rounded-md text-[#ef4444] relative" role="alert">
              <span className="block text-xs text-center">{messageError}</span>
            </div>
          )}
        </section>
        <div className="grid md:grid-cols-12 md:gap-4">
          <div className="mb-4 sm:mb-5 md:col-span-6">
            <label className="text-xs font-light text-slate-300" htmlFor="first_name">{t('firstname')}</label>
            <br />
            <input ref={first_nameRef} className={`border-[0.4px] border-cyan-500 ${StyleInput} w-full`} id="first_name" name="first_name" placeholder={t('firstname')} />
            <section className="error mt-2">
              <h1 className="text-xs text-[#fb7185] font-light">{errorDisplay.first_name}</h1>
            </section>
          </div>
          <div className="mb-4 sm:mb-5 md:col-span-6">
            <label className="text-xs font-light text-slate-300" htmlFor="last_name">{t('lastname')}</label>
            <br />
            <input ref={last_nameRef} className={`border-[0.4px] border-cyan-500 ${StyleInput}`} id="last_name" name="last_name" placeholder={t('lastname')} />
            <section className="error mt-2">
              <h1 className="text-xs text-[#fb7185] font-light">{errorDisplay.last_name}</h1>
            </section>
          </div>
        </div>
        <div className="mb-4 sm:mb-5">
          <label className="text-xs font-light text-slate-300" htmlFor="email">{t('email')}</label>
          <br />
          <input ref={emailRef} className={`border-[0.4px] border-cyan-500 ${StyleInput}`} id="email" name="email" placeholder={t('emailPlaceholder')} />
          <section className="error mt-2">
            <h1 className="text-xs text-[#fb7185] font-light">{errorDisplay.email}</h1>
          </section>
        </div>
        <div className="mb-4 sm:mb-5">
          <label className="text-xs font-light text-slate-300" htmlFor="password">{t('password')}</label>
          <br />
          <input ref={passwordRef} type="password" className={`border-[0.4px] border-cyan-500 ${StyleInput}`} id="pass" name="pass" placeholder="********" />
          <section className="error_password mt-2">
            <h1 className="text-xs text-[#fb7185] font-light">{errorDisplay.password}</h1>
          </section>
        </div>
        <section className="flex flex-col space-y-4">
          <SubmitButton
            text={loading ? <LoadingDoted /> : `${t('signup')}`}
            className={`bg-[#7c3aed]  py-8 font-extrabold flex flex-row justify-center items-center  ${loading ? "bg-[#7c3aed] opacity-50 hover:bg-[#7c3aed] text-white" : "bg-[#6d28d9]"} w-full h-10 rounded-md text-xs sm:text-sm text-white hover:bg-[#6d28d9]`}
          />
        </section>
        <section>
          <Link href="/login">
            <SubmitButton
              text={t('alreadyhavaccout')}
              className="font-extrabold underline w-full  text-xs rounded-md bg-transparent text-white mt-8 tracking-wide hover:bg-transparent border py-6"
            />
          </Link>
        </section>
        <ul className="space-y-2 mt-4">
          {errors != null && errors.map((error, index) => (
            <li
              key={index}
              className="flex items-center space-x-2 text-sm text-red-600 bg-red-100 p-2 rounded-lg"
            >
              <svg
                className="w-5 h-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11.293l3.293 3.293a1 1 0 01-1.414 1.414L10 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 8l-2.293-2.293a1 1 0 011.414-1.414L10 6.586l2.293-2.293a1 1 0 011.414 1.414L11.414 8z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </li>
          ))}
        </ul>
      </form>
    </div>
  );

}

export default SignUp