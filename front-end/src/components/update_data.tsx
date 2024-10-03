'use client'

import React, { useState, useEffect, useRef, ChangeEvent, MouseEvent } from 'react'
import Image from "next/legacy/image"
import OTPInput from "@/components/OtpInput"
import { UseAppContext } from '@/context/AuthContext'
import { DataProps } from '@/types/types'
import { toast } from 'sonner'
import { CheckFields, StyleInput, chekkImage } from '@/utils/ParsingFields'
import AxiosInstance from '@/utils/axiosInstance'
import { getCookie } from 'cookies-next'
import { Avv, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslation } from '@/hooks/useTranslation'
import { useLanguage } from '@/context/LanguageContext'
import { useRouter } from 'next/navigation'

import Image1 from "../../public/images/covers/image1.png"
import { FaUpload } from "react-icons/fa";

interface IProps {
    isOpen:boolean | null,
    onClose: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onConfirm: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const DeleteAccountModal:React.FC<IProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;


    const {t} = useTranslation() 

    return (
        <div
            className="fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif]">
            <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 relative">
                <div className="my-8 ">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-14 fill-red-500 inline" viewBox="0 0 24 24">
                        <path
                            d="M19 7a1 1 0 0 0-1 1v11.191A1.92 1.92 0 0 1 15.99 21H8.01A1.92 1.92 0 0 1 6 19.191V8a1 1 0 0 0-2 0v11.191A3.918 3.918 0 0 0 8.01 23h7.98A3.918 3.918 0 0 0 20 19.191V8a1 1 0 0 0-1-1Zm1-3h-4V2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2ZM10 4V3h4v1Z"
                            data-original="#000000" />
                        <path d="M11 17v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0Zm4 0v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0Z"
                            data-original="#000000" />
                    </svg>
                    <h4 className="text-gray-800 text-lg font-semibold mt-4">{t('sure')}</h4>
                    <p className="text-sm text-gray-600 mt-4">{t('paragraph')}</p>
                </div>

                <div className="flex flex-col space-y-2">
                    <button onClick={onConfirm} type="button"
                        className="px-4 py-4 rounded-lg text-white text-sm tracking-wide bg-red-500 hover:bg-red-600 active:bg-red-500">{t('Delete Account')}</button>
                    <button onClick={onClose} type="button"
                        className="px-4 py-2 rounded-lg text-gray-800 text-sm tracking-wide bg-gray-200 hover:bg-gray-300 active:bg-gray-200">{t('cancel')}</button>
                </div>
            </div>
        </div>
    );
};


const TwoFa: React.FC<any> = ({ enableTwoFA, set2fa }) => {

    const [qrcode, setqrCode] = useState<string | null>(null)
    const [Check, setCheck] = useState<boolean>(false)
    const [error, setIsError] = useState<string>('')

    const { t } = useTranslation()


    const verify = async (pin: string) => {

        try {
            setCheck(true)
            const response = await AxiosInstance("/api/v1/verify", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getCookie('access')}`
                },
                data: {
                    'otp': pin,
                    enabled: !enableTwoFA
                }
            }
            );
            if (response.status === 400 && response.statusText !== "OK") {
                const data = await response.data
                setIsError(data.message)
                setCheck(false)
                setTimeout(() => {
                    setIsError('')
                }, 5000)
            }
            if (response.statusText === 'OK') {
                setCheck(false)
                toast.success(t('error__otp')['success__otp'])
                setTimeout(() => {
                    location.reload();
                }, 2500)
            }
        }

        catch (e) {
            const error = e as any;
            setIsError(t('error__otp')[error.response.data.message]);
            setTimeout(() => {
                setIsError('');
            }, 5000);
            setCheck(false);
        }
    }

    const generateQr = async () => {
        if (!enableTwoFA) {
            try {
                const response = await AxiosInstance("/api/v1/twoFa", {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${getCookie('access')}`,
                        'Content-Type': 'application/json'
                    },
                })
                const data = await response.data
                setqrCode(data.link_qr)
            }
            catch (e) {
                toast.error(t('erroroccurred'))
            }
        }
    }


    useEffect(() => {
        if (!enableTwoFA) {
            generateQr()
        }
    }, [])

    const handleSubmit = (pin: string) => {
        setCheck(true)
        verify(pin)
    }


    const back = () => {
        set2fa(false)
    }


    return <div className='bg-[#030712] shadow-inner shadow-gray-600 p-4  rounded-2xl lg:w-[32%] flex flex-col justify-center  fade-in'>
        <section className='bg-[#4338ca] mb-4 p-2 rounded-lg flex justify-center max-w-[3rem]'>
            <svg className='text-white' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={32} height={32} fill={"none"}>
                <path d="M8.99396 2C6.19709 2.06395 4.56347 2.33111 3.44729 3.44729C2.33111 4.56347 2.06395 6.19709 2 8.99396M15.006 2C17.8029 2.06395 19.4365 2.33111 20.5527 3.44729C21.6689 4.56347 21.9361 6.19709 22 8.99396M15.006 22C17.8029 21.9361 19.4365 21.6689 20.5527 20.5527C21.6689 19.4365 21.9361 17.8029 22 15.006M8.99396 22C6.19709 21.9361 4.56347 21.6689 3.44729 20.5527C2.33111 19.4365 2.06395 17.8029 2 15.006" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16.9998 7H17.0088" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 6V9C13 10.8856 13 11.8284 12.4142 12.4142C11.8284 13 10.8856 13 9 13H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M6.29289 6.29289C6 6.58579 6 7.05719 6 8C6 8.94281 6 9.41421 6.29289 9.70711M6.29289 6.29289C6.58579 6 7.05719 6 8 6C8.94281 6 9.41421 6 9.70711 6.29289M6.29289 6.29289C6.29289 6.29289 6.29289 6.29289 6.29289 6.29289ZM6.29289 9.70711C6.58579 10 7.05719 10 8 10C8.94281 10 9.41421 10 9.70711 9.70711M6.29289 9.70711C6.29289 9.70711 6.29289 9.70711 6.29289 9.70711ZM9.70711 9.70711C10 9.41421 10 8.94281 10 8C10 7.05719 10 6.58579 9.70711 6.29289M9.70711 9.70711C9.70711 9.70711 9.70711 9.70711 9.70711 9.70711ZM9.70711 6.29289C9.70711 6.29289 9.70711 6.29289 9.70711 6.29289Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M17 15C17.4714 15 17.7071 15 17.8536 15.1464C18 15.2929 18 15.5286 18 16V17C18 17.4714 18 17.7071 17.8536 17.8536C17.7071 18 17.4714 18 17 18H15C14.5286 18 14.2929 18 14.1464 17.8536C14 17.7071 14 17.4714 14 17L14 16C14 15.5286 14 15.2929 14.1464 15.1464C14.2929 15 14.5286 15 15 15L17 15Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 18H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M17 10L17 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        </section>
        <h1 className='mb-2  text-xl font-extrabold'>{t('settupTwofacotr')[!enableTwoFA ? "setup" : "disable"]}</h1>
        {!enableTwoFA && (
            <p className="mb-4 text-xs text-gray-600">
                {t('paragraphAuth')}
            </p>
        )}
        {qrcode && !enableTwoFA && (
            <section className='rounded-md  shadow-md p-4 relative flex justify-center bg-[#2563eb]'>
                <Image
                    alt="qr_code"
                    width={200}
                    height={200}
                    className='w-full rounded-lg'
                    src={qrcode}
                />
            </section>
        )}
        <section className='mt-4'>
            <h1 className='text-gray-400 text-sm font-extrabold mb-2'>{t('veifycode')}</h1>
            <OTPInput length={6} onComplete={handleSubmit}></OTPInput>
        </section>
        <section className='btns flex flex-row gap-4 mt-6 w-full'>
            <button onClick={back} className='px-[14px] py-[8px] rounded-md text-sm  border-[0.1px] border-gray-700'>{t('backtosettings')}</button>
            <button disabled={true} className={`bg-[#2563eb] px-[22px] py-[8px] rounded-md hover:bg-[#2563eb] text-white ${Check ? 'opacity-50' : ''}`} type="submit">
                {Check ? (<>
                    <h6 className="mr-4">{t('verifying')} ...</h6>
                </>) : t('verify')}
            </button>
        </section>

        <section className='mt-2'>
            {error.length > 0 && <h1 className=' border-[#fef2f2] p-2 flex justify-center text-xs   text-[#f87171] shadow-2xl'>{error} <span className="font-bold ml-2">{t('error__otp')['__try__again']}</span> </h1>}
        </section>
    </div>
}

interface IAvatar {
    link: File | string | null,
    onChanged: boolean
}


const Settings: React.FC<any> = () => {

    const { showSetting, setShowSetting, user } = UseAppContext()
    const { t } = useTranslation()
    const { changeLanguage } = useLanguage()
    const router = useRouter()

    const [ActiveLang, setLangActive] = useState<string>('')

    const refCover = useRef<HTMLInputElement>(null);

    // isOpen, onClose, onConfirm

    const [isOpen, setIsOpen] = useState<boolean | null>(false)


    const [password, setPassword] = useState('');
    const [npassword, setNpassword] = useState('');
    const [cnpassword, setCnpassword] = useState('');
    const [errors, setErrors] = useState({ password: '', npassword: '', cnpassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [apiError, setApiError] = useState('');
    const [ChooseCover, setchooseCover] = useState<any | null>(null)


    const [showPassword, setShowPassword] = useState<boolean>(false)
    const refInput = useRef<HTMLInputElement | null>(null)
    const [intra_id, setIntra] = useState<number | null>(null)
    const [username, setUsername] = useState<string>('')
    const [first_name, setfirst_name] = useState<string>('')
    const [Last_name, set_LastName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [imageLink, setImageLink] = useState<File | null>(null)
    const [CoverLink, setCoverLink] = useState<File | null>(null)
    const [disabled, setDisbaled] = useState<boolean>(true)
    const [LinkAvatar, setLinkAvatar] = useState<IAvatar>({
        'link': null,
        onChanged: false
    })
    const [LinkCover, setLinkCover] = useState<IAvatar>({
        'link': null,
        onChanged: false
    })


    const [twofa, set2fa] = useState<boolean>(false)
    const [userSettings, setUsetSettings] = useState<DataProps>({
        id: "",
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        image: null,
        cover_image: null,
        enableTwoFA: false,
        intra_id: undefined,
    })

    const validate = () => {
        let isValid = true;
        let newErrors = { password: '', npassword: '', cnpassword: '' };

        if (password.length < 8 || password.length > 100) {
            newErrors.password = t('__error_settings_password')['__passwordcar'];
            isValid = false;
        }

        if (npassword.length < 8 || npassword.length > 100) {
            newErrors.npassword = t('__error_settings_password')['n__passwordcar'];
            isValid = false;
        }

        if (cnpassword !== npassword) {
            newErrors.cnpassword = t('__error_settings_password')['__password_dontmatch'];
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const showMessage = (messageType: string, message: string) => {
        if (messageType === 'success') {
            setSuccessMessage(message);
            setTimeout(() => setSuccessMessage(''), 1500);
        } else if (messageType === 'error') {
            setApiError(message)
            setTimeout(() => setApiError(''), 1500);
        }
    };



    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) {
            setTimeout(() => {
                setErrors({ password: '', npassword: '', cnpassword: '' })
            }, 1500)

            return
        };

        setIsLoading(true);
        const formData = new FormData();
        formData.append('oldpassword', password);
        formData.append('newpassword', npassword);

        const access = getCookie('access')

        try {
            const response = await AxiosInstance('/api/v1/changePassword', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access}`,
                    'Content-Type': 'application/json',
                },
                data: {
                    oldpassword: password,
                    newpassword: npassword,
                },
            });
            const data = await response.data;
            if (response.statusText === 'OK' && response.status === 200) {
                showMessage('success', 'Password has been changed successfully');
            } else {
                showMessage('error', `${data.error}`);
            }
        } catch (error) {
            const err = error as any;
            showMessage('error', t('__error_settings_password')[err.response.data.error])
        } finally {
            setIsLoading(false);
        }
    };


    const handleTfa = () => {
        set2fa(!twofa)
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        if (name === 'cover') {
            const target = e.target as HTMLInputElement;
            if (target && target.files && target.files[0]) {
                if (!chekkImage(target.files[0])) {
                    toast.error(t('vaildavatar'))
                    return
                }
                setLinkCover({
                    link: URL.createObjectURL(target.files[0]),
                    onChanged: true
                });
                setCoverLink(target.files[0])
                setchooseCover(null)
            }
        }

        if (name === "avatar") {
            const target = e.target as HTMLInputElement;
            if (target && target.files && target.files[0]) {
                if (!chekkImage(target.files[0])) {
                    toast.error(t('vaildavatar'))
                    return
                }
                setLinkAvatar({
                    link: URL.createObjectURL(target.files[0]),
                    onChanged: true
                });
                setImageLink(target.files[0]);
            }
        }

        switch (name) {
            case "Firstname":
                setfirst_name(value)
                break;
            case "Lastname":
                set_LastName(value)
                break;
            case "username":
                setUsername(value)
                break;
            case "email":
                setEmail(value)
                break;
        }
    };

    const compareObjects = (obj1: DataProps, obj2: DataProps): boolean => {

        if (
            obj1.username !== obj2.username ||
            obj1.first_name !== obj2.first_name ||
            obj1.last_name !== obj2.last_name ||
            obj1.email !== obj2.email ||
            obj1.image !== obj2.image ||
            obj1.cover_image !== obj2.cover_image
        ) {
            return false;
        }
        return true
    }

    useEffect(() => {

        const compareObject: DataProps = {
            username,
            first_name,
            'last_name': Last_name,
            email,
            'image': LinkAvatar.link,
            'cover_image': LinkCover.link
        }

        if (compareObjects(userSettings, compareObject) === true) {
            setDisbaled(true)
        }
        else {
            setDisbaled(false)
        }
    }, [username, first_name, Last_name, email, imageLink, CoverLink])

    useEffect(() => {
        if (user !== null) {
            setUsetSettings({
                id: user.pk,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                email: user.email ? user.email : null,
                image: user.image,
                cover_image: user.cover_image,
                enableTwoFA: user.enableTwoFA,
                intra_id: user.intra_id ? user.intra_id : undefined
            })
        }
    }, [user])


    useEffect(() => {

        if (user.first_name !== undefined && user.first_name !== null) {
            setfirst_name(user.first_name);
        }
        if (user.last_name !== undefined && user.last_name !== null) {
            set_LastName(user.last_name);
        }
        if (user.username !== undefined && user.username !== null) {
            setUsername(user.username);
        }
        if (user.email !== undefined && user.email !== null) {
            setEmail(user.email);
        }
        if (user.intra_id !== undefined) {
            setIntra(user.intra_id);
        }
        if (user.image !== undefined && user.image !== null) {
            setLinkAvatar({
                'link': user.image,
                onChanged: false,
            })
        }
        if (user.cover_image !== undefined && user.cover_image !== null) {
            setLinkCover({
                'link': user.cover_image,
                onChanged: false,
            })
        }
    }, [user]);

    const handleAvatarClick = () => {
        if (refInput.current) {
            refInput.current.click()
        }
    };

    const updateDateUser = async (e: MouseEvent<HTMLButtonElement>) => {

        e.preventDefault()

        const DataParse = {
            username: username,
            email: email,
            first_name: first_name,
            last_name: Last_name,
            image: imageLink,
            cover_image: CoverLink
        }

        const formData = new FormData();

        const result = CheckFields(DataParse)

        if (!result) {
            toast.error(t("errordata"))
            return
        }

        for (const key in DataParse) {
            if (key !== "image" && key !== "cover_image") {
                if (DataParse.hasOwnProperty(key)) {
                    formData.append(key, DataParse[key as keyof typeof DataParse] as string);
                }
            } else {
                if (DataParse.image !== null) {
                    formData.append("image", DataParse[key as keyof typeof DataParse] as File);
                }
                else if (DataParse.cover_image !== null) {
                    formData.append("cover_image", DataParse[key as keyof typeof DataParse] as File);
                }
            }
        }

        try {
            const response = await AxiosInstance('/api/v1/get_Or_UpdateDataUser',
            {
                method: 'PUT',
                data: formData,
                headers: {
                    'Authorization': `Bearer ${getCookie('access')}`,
                    "X-CSRFToken":`${getCookie('csrftoken')}`
                },
            });
            if (response.statusText === 'OK') {
                toast.success(t('dataupdatesuccess'))
            } else {
                toast.error(t('errordata'))

            }
        } catch (error) {
            toast.error(t('errordata'))

        }
    }
    const cancel = () => {
        setShowSetting(!showSetting)
    }


    const LoadLangs = async (e: React.MouseEvent<HTMLButtonElement>, lang: string) => {
        e.preventDefault()

        changeLanguage(lang)
        localStorage.setItem("locale", lang)
        setLangActive(lang)
    }

    useEffect(() => {
        if (typeof window !== undefined) {
            const lang: string | null = localStorage.getItem("locale")

            if (lang) {
                setLangActive(lang)
            }
            else {
                setLangActive("en")
            }
        }
    }, [])

    const ShowChangePassword = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()

        setShowPassword((prev: boolean) => !prev)
    }

    const handlCover = () => {
        if (refCover.current) {
            refCover.current.click()
        }
    }

    const removeaccount = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setIsOpen(prev => !prev)
    }

    const onClose = () => {
        setIsOpen(false)
    }
    const onConfirm = async () => {
        try {
            const response = await AxiosInstance('/api/v1/deleteAccount/',
            {
                method: 'POST',
                data: {
                    'refresh_token':getCookie("refresh")
                },
                headers: {
                    'Authorization': `Bearer ${getCookie('access')}`,
                    'Content-Type': 'application/json',
                }
            });
            if (response.status === 204)
            {   
                setShowSetting(false)
                setIsOpen(false)
                toast.success("User Account deleted with success")

                setTimeout(() => {
                    router.push("/login")
                }, 1000);
            }
        } catch (error) {
            toast.error('Problem Occurred While processing the deletion of user')
        }
    }

    return (<div className='flex justify-center items-center h-full  lg:container mx-auto flex-col min-h-[72rem] '>
        <DeleteAccountModal isOpen={isOpen} onClose={onClose} onConfirm={onConfirm}></DeleteAccountModal>
        {twofa ? <TwoFa enableTwoFA={userSettings.enableTwoFA} set2fa={set2fa}></TwoFa> : (
            <div className={`w-full md:max-w-[34rem]   fixed  flex flex-col items-center mt-12 bg-[#030712] shadow-inner shadow-[#581c87] p-4 lg:rounded-3xl border-[0.1px] fade-in sm:relative ${!showPassword ? 'sm:overflow-hidden' : ''}`}>
                <div className={`bg-[#02030d] w-full  h-full absolute rounded-3xl top-0 p-6 ${showPassword ? 'z-10 password top-[0rem] transition-all ease-out' : 'top-[54rem] hidden'}`}>
                    <h1 className='text-3xl font-extrabold mt-8'>{t('changepassword')}</h1>
                    <p className='mt-6 text-sm text-gray-600'>{t('paragraphchnagepassword')}</p>
                    <div className='flex flex-col max-w-xl rounded-md '>
                        <form onSubmit={onSubmit}>
                            <section className="password mt-12 flex flex-col">
                                <div className="mb-2 w-[100%]">
                                    <label className="text-xs font-extralight" htmlFor="cpass">{t('currentpassword')}</label>
                                    <input
                                        type="password"
                                        id="cpass"
                                        placeholder="********"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`${StyleInput}`}
                                    />
                                    {errors.password && <p className="text-red-500 text-xs font-light mt-2">{errors.password}</p>}
                                </div>
                                <div className="mb-5 w-[100%]">
                                    <label className="text-xs font-extralight" htmlFor="newpass">New password</label>
                                    <input
                                        type="password"
                                        id="newpass"
                                        placeholder="********"
                                        value={npassword}
                                        onChange={(e) => setNpassword(e.target.value)}
                                        className={`${StyleInput}`}
                                    />
                                    {errors.npassword && <p className="text-red-500 text-xs font-light mt-2">{errors.npassword}</p>}
                                </div>
                                <div className="mb-5 w-[100%]">
                                    <label className="text-xs font-extralight" htmlFor="cnewpass">Confirm New password</label>
                                    <input
                                        type="password"
                                        id="cnewpass"
                                        placeholder="********"
                                        value={cnpassword}
                                        onChange={(e) => setCnpassword(e.target.value)}
                                        className={`${StyleInput}`}
                                    />
                                    {errors.cnpassword && <p className="text-red-500 text-xs font-light mt-2">{errors.cnpassword}</p>}
                                </div>
                                {successMessage.length > 0 && <p className="text-green-500 text-xs font-bold mt-2 mb-4 text-center">{successMessage}</p>}
                                {apiError.length > 0 && <p className="text-red-500 text-xs font-bold mt-2 mb-4 text-center">{apiError}</p>}
                                <button
                                    type="submit"
                                    className="w-full font-medium bg-[#1d4ed8] text-white rounded-lg p-4 hover:bg-[#1d4ed8]"
                                    disabled={isLoading}
                                >
                                    {(isLoading) ? t('proccess') : t('save')}
                                </button>
                            </section>
                        </form>
                    </div>
                    <button onClick={() => setShowPassword(false)} className='text-sm  absolute bottom-12 w-full left-0 p-4'>{t('backtosettings')}</button>

                </div>
                <h1 className='flex flex-col justify-start w-full   p-2 rounded-lg mb-2 text-xl font-extrabold text-left'>{t('profilesettings')}</h1>

                <div className='avatars mb-8 bg-[#0f172a] w-full min-h-[8rem] rounded-lg relative'>
                    <Image
                        className="rounded-lg"
                        objectPosition="center"
                        objectFit="cover"
                        layout="fill"
                        src={ChooseCover != null ? ChooseCover :
                            LinkCover.onChanged ?
                                (typeof LinkCover.link === "string" || !LinkCover.link ?
                                    LinkCover.link || Image1 :
                                    URL.createObjectURL(LinkCover.link)) :
                                (typeof LinkCover.link === "string" ?
                                    `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}${LinkCover.link}` :
                                    Image1)
                        }
                        alt="cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                    />
                    <div className='covers flex flex-row gap-3 right-0 justify-end p-2 absolute bottom-0 backdrop-blur-xl bg-black/30 m-1 rounded-lg'>
                        <div className='w-8 h-8 rounded-md relative cursor-pointer flex items-center justify-center' onClick={handlCover}>
                            <div className=''>
                                <FaUpload size={14} ></FaUpload>
                            </div>
                            <input
                                onChange={handleChange}
                                ref={refCover}
                                className="hidden"
                                aria-describedby="file_input_help"
                                id="file_input"
                                name="cover"
                                type="file"
                            />
                        </div>
                    </div>
                    <section className="flex flex-col sm:flex-row justify-start items-center gap-6 p-4 absolute h-[14rem]">
                        <section className="relative overflow-hidden cursor-pointer" onClick={handleAvatarClick}  >
                            <Avv className='w-[70px] h-[70px] border-4 border-[#000000]'>
                                <AvatarImage
                                    src={
                                        LinkAvatar.onChanged
                                            ? typeof LinkAvatar.link === "string" || !LinkAvatar.link
                                                ? LinkAvatar.link || `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`
                                                : URL.createObjectURL(LinkAvatar.link)
                                            : typeof LinkAvatar.link === "string"
                                                ? `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}${LinkAvatar.link}`
                                                : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`
                                    }
                                    alt="avatar"
                                />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avv>

                            <input
                                onChange={handleChange}
                                ref={refInput}
                                className="hidden"
                                aria-describedby="file_input_help"
                                id="file_input"
                                name="avatar"
                                type="file"
                            />
                        </section>
                    </section>
                </div>

                <form className='w-full flex flex-col gap-4  mt-4' method='POST'>

                    <div className='flex flex-col'>
                        <label htmlFor='username' className='text-white text-xs mb-1'>{t('firstname')} / {t('lastname')}</label>
                        <section className='flex flex-row gap-4'>
                            <input onChange={handleChange} name='Firstname' value={first_name || ''} id='firstname' type='text' className={`${StyleInput}`} placeholder={t('firstname')} />
                            <input onChange={handleChange} name='Lastname' value={Last_name || ''} id='Lastname' type='text' className={`${StyleInput}`} placeholder={t('lastname')} />
                        </section>
                    </div>
                    <div className='flex flex-col'>
                        <label htmlFor='username' className='text-white text-xs mb-1'>{t('username')}</label>
                        <section>
                            <input name='username' onChange={handleChange} value={username || ''} id='username' type='text' className={`${StyleInput}`} placeholder={t('username')} />
                        </section>
                    </div>
                    {intra_id === null && <div className='flex flex-col  rounded-md '>
                        <label htmlFor='email' className='text-white text-xs mb-1'>{t('email')}</label>
                        <input onChange={handleChange} name='email' value={email || ''} id='Email' type='text' className={`${StyleInput}`} placeholder={t('emailPlaceholder')} />
                    </div>}

                    <div className='btns flex md:flex-row flex-col md:justify-between md:items-center gap-4 lg:gap-0'>
                        <button onClick={(e) => removeaccount(e)} className='bg-[#fecaca] text-[#ef4444] font-bold text-xs px-[14px] py-[8px] rounded-md'>{t('deleteaccount')}</button>
                        <section className='flex md:flex-row flex-col gap-4'>
                            <button onClick={cancel} className='px-[14px] py-[8px] rounded-md text-sm  border-[0.1px] border-gray-700'>{t('cancel')}</button>
                            <button onClick={updateDateUser} disabled={disabled} className={`px-[14px] py-[8px] rounded-md text-sm bg-gradient-to-r from-cyan-500 to-blue-500 ${disabled ? 'opacity-50' : ''}`}>{t('savechanges')}</button>
                        </section>
                    </div>
                    <section>
                        <h1 className='font-extrabold text-xl'>{t('secsettings')}</h1>
                        {intra_id === null && (
                            <button onClick={ShowChangePassword} className='mt-3 bg-[#0f172a]  w-full p-3 flex justify-start rounded-lg  flex-row gap-2 items-center '>

                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={18} height={18} color={"white"} fill={"none"}>
                                    <path d="M12.5 18C12.5 18 18.5 13.5811 18.5 12C18.5 10.4188 12.5 6 12.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M5.50005 18C5.50005 18 11.5 13.5811 11.5 12C11.5 10.4188 5.5 6 5.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {t('changepassword')}
                            </button>
                        )}
                    </section>
                    <section className="mt-1 bg-[#0f172a] p-4 rounded-md">
                        <section className="flex flex-row justify-between items-center">
                            <h1 className="font-extrabold flex flex-row items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={18} height={18} color={"white"} fill={"none"}>
                                    <path d="M9.5 9.5H7.5C5.15442 9.5 3.98164 9.5 3.17372 10.1199C2.96572 10.2795 2.77954 10.4657 2.61994 10.6737C2 11.4816 2 12.6544 2 15C2 17.3456 2 18.5184 2.61994 19.3263C2.77954 19.5343 2.96572 19.7205 3.17372 19.8801C3.98164 20.5 5.15442 20.5 7.5 20.5H9.5C11.8456 20.5 13.0184 20.5 13.8263 19.8801C14.0343 19.7205 14.2205 19.5343 14.3801 19.3263C15 18.5184 15 17.3456 15 15C15 12.6544 15 11.4816 14.3801 10.6737C14.2205 10.4657 14.0343 10.2795 13.8263 10.1199C13.0184 9.5 11.8456 9.5 9.5 9.5Z" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M11.75 9.5V6.75C11.75 4.95507 10.2949 3.5 8.5 3.5C6.70507 3.5 5.25 4.95507 5.25 6.75V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M21.3801 19.3263L21.9751 19.7829L21.3801 19.3263ZM20.8263 19.8801L21.2829 20.4751L20.8263 19.8801ZM20.8263 10.1199L21.2829 9.52492L20.8263 10.1199ZM21.3801 10.6737L21.9751 10.2171L21.3801 10.6737ZM18 9.5C18 9.91421 18.3358 10.25 18.75 10.25C19.1642 10.25 19.5 9.91421 19.5 9.5H18ZM17.0012 8.75025C16.5869 8.74961 16.2506 9.08487 16.25 9.49909C16.2494 9.9133 16.5846 10.2496 16.9988 10.2502L17.0012 8.75025ZM16.9988 19.7498C16.5846 19.7504 16.2494 20.0867 16.25 20.5009C16.2506 20.9151 16.5869 21.2504 17.0012 21.2498L16.9988 19.7498ZM13.6534 3.20102C13.286 3.39246 13.1435 3.84543 13.3349 4.21274C13.5264 4.58006 13.9793 4.72264 14.3466 4.53119L13.6534 3.20102ZM21.25 15C21.25 16.1902 21.2489 17.0201 21.1772 17.6557C21.1073 18.2762 20.9781 18.6181 20.785 18.8697L21.9751 19.7829C22.4019 19.2266 22.5828 18.5781 22.6678 17.8238C22.7511 17.0846 22.75 16.1553 22.75 15H21.25ZM20.785 18.8697C20.6653 19.0257 20.5257 19.1653 20.3697 19.285L21.2829 20.4751C21.5429 20.2756 21.7756 20.0429 21.9751 19.7829L20.785 18.8697ZM22.75 15C22.75 13.8447 22.7511 12.9154 22.6678 12.1762C22.5828 11.4219 22.4019 10.7734 21.9751 10.2171L20.785 11.1303C20.9781 11.3819 21.1073 11.7238 21.1772 12.3443C21.2489 12.9799 21.25 13.8098 21.25 15H22.75ZM20.3697 10.715C20.5257 10.8347 20.6653 10.9743 20.785 11.1303L21.9751 10.2171C21.7756 9.95715 21.5429 9.72443 21.2829 9.52492L20.3697 10.715ZM19.5 9.5V6.75H18V9.5H19.5ZM19.5 6.75C19.5 4.54086 17.7091 2.75 15.5 2.75V4.25C16.8807 4.25 18 5.36929 18 6.75H19.5ZM16.9988 10.2502C18.0169 10.2518 18.7353 10.2643 19.288 10.3391C19.8256 10.412 20.1364 10.536 20.3697 10.715L21.2829 9.52492C20.7678 9.12969 20.1737 8.94541 19.4894 8.85271C18.8202 8.76207 17.9996 8.75179 17.0012 8.75025L16.9988 10.2502ZM17.0012 21.2498C17.9996 21.2482 18.8202 21.2379 19.4894 21.1473C20.1737 21.0546 20.7678 20.8703 21.2829 20.4751L20.3697 19.285C20.1364 19.464 19.8256 19.588 19.288 19.6609C18.7353 19.7357 18.0169 19.7482 16.9988 19.7498L17.0012 21.2498ZM14.3466 4.53119C14.6909 4.35176 15.0825 4.25 15.5 4.25V2.75C14.8354 2.75 14.2066 2.91267 13.6534 3.20102L14.3466 4.53119Z" fill="currentColor" />
                                    <path d="M6 15C6 15 7 15.5 7.5 17C7.5 17 9 14 11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {t('authapp')}
                            </h1>
                            <button onClick={handleTfa} className="text-xs border-slate-500 border-[0.1px] p-2 rounded-md">{t('twofabutton')}</button>
                        </section>
                        <p className="text-xs text-slate-400 mt-6">{t('useappauth')}</p>
                    </section>
                    <section className='mt-1 flex flex-col'>
                        <h1 className='font-extrabold bg-[#0f172a] w-full p-3 rounded-md text-sm'>{t('langs')}</h1>

                        <section className='flex flex-row gap-2 justify-around mt-2'>
                            <button onClick={(e) => LoadLangs(e, "en")} className={` rounded-lg p-2 mt-4 border-[0.1px] flex flex-row justify-center items-center gap-2 text-sm ${ActiveLang === 'en' ? "bg-gray-900" : ''}`}>
                                {t('langOptions')['en']}
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#fff"></rect><path d="M1.638,5.846H30.362c-.711-1.108-1.947-1.846-3.362-1.846H5c-1.414,0-2.65,.738-3.362,1.846Z" fill="#a62842"></path><path d="M2.03,7.692c-.008,.103-.03,.202-.03,.308v1.539H31v-1.539c0-.105-.022-.204-.03-.308H2.03Z" fill="#a62842"></path><path fill="#a62842" d="M2 11.385H31V13.231H2z"></path><path fill="#a62842" d="M2 15.077H31V16.923000000000002H2z"></path><path fill="#a62842" d="M1 18.769H31V20.615H1z"></path><path d="M1,24c0,.105,.023,.204,.031,.308H30.969c.008-.103,.031-.202,.031-.308v-1.539H1v1.539Z" fill="#a62842"></path><path d="M30.362,26.154H1.638c.711,1.108,1.947,1.846,3.362,1.846H27c1.414,0,2.65-.738,3.362-1.846Z" fill="#a62842"></path><path d="M5,4h11v12.923H1V8c0-2.208,1.792-4,4-4Z" fill="#102d5e"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path><path fill="#fff" d="M4.601 7.463L5.193 7.033 4.462 7.033 4.236 6.338 4.01 7.033 3.279 7.033 3.87 7.463 3.644 8.158 4.236 7.729 4.827 8.158 4.601 7.463z"></path><path fill="#fff" d="M7.58 7.463L8.172 7.033 7.441 7.033 7.215 6.338 6.989 7.033 6.258 7.033 6.849 7.463 6.623 8.158 7.215 7.729 7.806 8.158 7.58 7.463z"></path><path fill="#fff" d="M10.56 7.463L11.151 7.033 10.42 7.033 10.194 6.338 9.968 7.033 9.237 7.033 9.828 7.463 9.603 8.158 10.194 7.729 10.785 8.158 10.56 7.463z"></path><path fill="#fff" d="M6.066 9.283L6.658 8.854 5.927 8.854 5.701 8.158 5.475 8.854 4.744 8.854 5.335 9.283 5.109 9.979 5.701 9.549 6.292 9.979 6.066 9.283z"></path><path fill="#fff" d="M9.046 9.283L9.637 8.854 8.906 8.854 8.68 8.158 8.454 8.854 7.723 8.854 8.314 9.283 8.089 9.979 8.68 9.549 9.271 9.979 9.046 9.283z"></path><path fill="#fff" d="M12.025 9.283L12.616 8.854 11.885 8.854 11.659 8.158 11.433 8.854 10.702 8.854 11.294 9.283 11.068 9.979 11.659 9.549 12.251 9.979 12.025 9.283z"></path><path fill="#fff" d="M6.066 12.924L6.658 12.494 5.927 12.494 5.701 11.799 5.475 12.494 4.744 12.494 5.335 12.924 5.109 13.619 5.701 13.19 6.292 13.619 6.066 12.924z"></path><path fill="#fff" d="M9.046 12.924L9.637 12.494 8.906 12.494 8.68 11.799 8.454 12.494 7.723 12.494 8.314 12.924 8.089 13.619 8.68 13.19 9.271 13.619 9.046 12.924z"></path><path fill="#fff" d="M12.025 12.924L12.616 12.494 11.885 12.494 11.659 11.799 11.433 12.494 10.702 12.494 11.294 12.924 11.068 13.619 11.659 13.19 12.251 13.619 12.025 12.924z"></path><path fill="#fff" d="M13.539 7.463L14.13 7.033 13.399 7.033 13.173 6.338 12.947 7.033 12.216 7.033 12.808 7.463 12.582 8.158 13.173 7.729 13.765 8.158 13.539 7.463z"></path><path fill="#fff" d="M4.601 11.104L5.193 10.674 4.462 10.674 4.236 9.979 4.01 10.674 3.279 10.674 3.87 11.104 3.644 11.799 4.236 11.369 4.827 11.799 4.601 11.104z"></path><path fill="#fff" d="M7.58 11.104L8.172 10.674 7.441 10.674 7.215 9.979 6.989 10.674 6.258 10.674 6.849 11.104 6.623 11.799 7.215 11.369 7.806 11.799 7.58 11.104z"></path><path fill="#fff" d="M10.56 11.104L11.151 10.674 10.42 10.674 10.194 9.979 9.968 10.674 9.237 10.674 9.828 11.104 9.603 11.799 10.194 11.369 10.785 11.799 10.56 11.104z"></path><path fill="#fff" d="M13.539 11.104L14.13 10.674 13.399 10.674 13.173 9.979 12.947 10.674 12.216 10.674 12.808 11.104 12.582 11.799 13.173 11.369 13.765 11.799 13.539 11.104z"></path><path fill="#fff" d="M4.601 14.744L5.193 14.315 4.462 14.315 4.236 13.619 4.01 14.315 3.279 14.315 3.87 14.744 3.644 15.44 4.236 15.01 4.827 15.44 4.601 14.744z"></path><path fill="#fff" d="M7.58 14.744L8.172 14.315 7.441 14.315 7.215 13.619 6.989 14.315 6.258 14.315 6.849 14.744 6.623 15.44 7.215 15.01 7.806 15.44 7.58 14.744z"></path><path fill="#fff" d="M10.56 14.744L11.151 14.315 10.42 14.315 10.194 13.619 9.968 14.315 9.237 14.315 9.828 14.744 9.603 15.44 10.194 15.01 10.785 15.44 10.56 14.744z"></path><path fill="#fff" d="M13.539 14.744L14.13 14.315 13.399 14.315 13.173 13.619 12.947 14.315 12.216 14.315 12.808 14.744 12.582 15.44 13.173 15.01 13.765 15.44 13.539 14.744z"></path></svg>
                            </button>
                            <button onClick={(e) => LoadLangs(e, "fr")} className={`rounded-lg p-2 mt-4 border-[0.1px] flex flex-row justify-center items-center gap-2 text-sm  ${ActiveLang === 'fr' ? "bg-gray-900" : ''}`}>
                                {t('langOptions')['fr']}
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="#fff" d="M10 4H22V28H10z"></path><path d="M5,4h6V28H5c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" fill="#092050"></path><path d="M25,4h6V28h-6c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" transform="rotate(180 26 16)" fill="#be2a2c"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path></svg>
                            </button>
                        </section>
                    </section>
                </form>
            </div>
        )}
    </div>)
}


export default Settings