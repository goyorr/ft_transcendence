'use client'

import { useState, MouseEvent, ChangeEvent, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation';
import LoadingDoted from "@/components/LoadingDoated"
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

type ButtonProps = {
    onClick: (event: MouseEvent<SVGSVGElement>) => void;
    setHidePassword: React.Dispatch<React.SetStateAction<boolean>>
    hidepassword: boolean,
};

const VisiblePassword: React.FC<ButtonProps> = ({ onClick, hidepassword }) => {
    return (<>
        {hidepassword ? (
            <svg onClick={onClick}
                className='absolute right-0 top-1/2 transform -translate-y-1/2 mr-3 cursor-pointer'
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width={20}
                height={20}
                color={"#ccc"}
                fill={"none"}
            >
                <path
                    d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
                <path
                    d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
            </svg>
        ) : (
            <svg
                onClick={onClick}
                className='absolute right-0 top-1/2 transform -translate-y-1/2 mr-3 cursor-pointer'
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width={20}
                height={20}
                color={"#ccc"}
                fill={"none"}>
                <path d="M19.439 15.439C20.3636 14.5212 21.0775 13.6091 21.544 12.955C21.848 12.5287 22 12.3155 22 12C22 11.6845 21.848 11.4713 21.544 11.045C20.1779 9.12944 16.6892 5 12 5C11.0922 5 10.2294 5.15476 9.41827 5.41827M6.74742 6.74742C4.73118 8.1072 3.24215 9.94266 2.45604 11.045C2.15201 11.4713 2 11.6845 2 12C2 12.3155 2.15201 12.5287 2.45604 12.955C3.8221 14.8706 7.31078 19 12 19C13.9908 19 15.7651 18.2557 17.2526 17.2526" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9.85786 10C9.32783 10.53 9 11.2623 9 12.0711C9 13.6887 10.3113 15 11.9289 15C12.7377 15 13.47 14.6722 14 14.1421" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )}
    </>)
}



const ResetPassword = () => {
    const [newpassword, setnewpassword] = useState<string>('')
    const [cnewpassword, setcnewpassword] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [hidepassword, setHidePassword] = useState<boolean>(true)
    const [check, setCheck] = useState<boolean>(false)

    const { language } = useLanguage()

    const refPassword = useRef<HTMLInputElement>(null)
    const refPassword2 = useRef<HTMLInputElement>(null)

    const { t } = useTranslation()

    const [error, setError] = useState<string>('')

    const router = useRouter()

    const { uuidbase64, token } = useParams() as { uuidbase64: string; token: string };

    const [disabled, setDisabled] = useState<boolean>(true)
    const [errors, setErrors] = useState<string[] | null>(null);


    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget

        if (name === 'newp') {
            setnewpassword(value)
        }
        else if (name === 'cnewp') {
            setcnewpassword(value)
        }
    }

    const updatePassword = async (e: MouseEvent<HTMLButtonElement>) => {

        e.preventDefault()
        setCheck(true)
        const url_back_end = `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/v1/rest_password/${uuidbase64}/${token}/`
        try {
            const response = await fetch(url_back_end, {
                method: "POST",
                headers:
                {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'npassword': newpassword,
                    'cnpassword': cnewpassword
                })
            })
            if (response.status === 201) {
                router.push("/login")
            }

            if (!response.ok) {
                setCheck(false)
                const data = await response.json()
                if (language === 'fr') {
                    setError(t('notorrectpassword'))
                }
                else {
                    setError(data.message)
                }
                setTimeout(() => {
                    setError('')
                }, 5000)
            }
        }
        catch (e) {
            setCheck(false)
        }
    }

    const checkToken = async () => {

        const url_back_end = `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/v1/rest_password/${uuidbase64}/${token}/`
        try {
            const response = await fetch(url_back_end, {
                method: "GET",
            })
            if (response.status === 401 || response.status === 400) {
                router.push("/login")
            }
            else {
                setLoading(true)
            }
        }
        catch (e) {
            toast.error(t('erroroccurred'))
        }
    }

    const HideShowPassword = () => {
        setHidePassword(!hidepassword)
    }

    useEffect(() => {
        checkToken()
    }, [])

    useEffect(() => {
        const sanitizePassword = (password: string) => {
            const sanitizedPassword = password.replace(/[^a-zA-Z0-9!@#$%^&*()_+=\-]/g, '');
            return sanitizedPassword;
        };
    
        const validatePassword = (password: string) => {
            const validationErrors: string[] = [];
            if (password.length < 8) {
                validationErrors.push(t('passwordValidation')['length']);
            }
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
    
        if (newpassword.length > 0 || cnewpassword.length > 0) {
            const newPasswordSanitized = sanitizePassword(newpassword);
            const confirmPasswordSanitized = sanitizePassword(cnewpassword);
    
            if (newPasswordSanitized === confirmPasswordSanitized) {
                const validationErrors = validatePassword(newPasswordSanitized);
                if (validationErrors.length === 0) {
                    setDisabled(false);
                    setErrors([]);
                } else {
                    setDisabled(true);
                    setErrors(validationErrors);
                }
            } else {
                setDisabled(true);
                setErrors(['Passwords do not match.']);
            }
        } else {
            setErrors(null);
        }
    }, [newpassword, cnewpassword]);

    return (
        <>
            {loading && <div className="flex flex-col items-center justify-center min-h-screen text-sm">
                <div className=" p-8 rounded  w-full max-w-md">
                    <h1 className="text-2xl font-bold mb-4">{t('resetpasswod')}</h1>
                    <div className="mb-4">
                        <label htmlFor="pass" className="block text-gray-700 text-xs font-medium mb-2">{t('newpassword')}</label>
                        <div className="relative w-full mb-4">
                            <input
                                ref={refPassword}
                                type={hidepassword ? "password" : "text"}
                                id="newp"
                                name="newp"
                                value={newpassword}
                                onChange={handleChange}
                                className="bg-[#0f172a] shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline pr-10"
                                placeholder="********"
                            />
                            <VisiblePassword onClick={HideShowPassword} setHidePassword={setHidePassword} hidepassword={hidepassword}></VisiblePassword>
                        </div>

                        <label htmlFor="pass" className="block text-gray-700 text-xs font-medium mb-2">{t('cnewpassword')}</label>
                        <input
                            ref={refPassword2}
                            type={hidepassword ? "password" : "text"}
                            id="cnewp"
                            name="cnewp"
                            value={cnewpassword}
                            onChange={handleChange}
                            className="bg-[#0f172a] shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="********"
                        />
                    </div>
                    <div className="flex justify-between flex-col gap-4">
                        <button
                            disabled={disabled}
                            onClick={updatePassword}
                            className={`bg-[#8b5cf6] flex flex-row p-4 justify-center hover:bg-[#8b5cf6] text-white font-bold text-xs  rounded focus:outline-none focus:shadow-outline `}
                        >
                            {check ? (<LoadingDoted></LoadingDoted>) : t('changepassword')}
                        </button>
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
                        {error.length > 0 && <h1 className=' border-[#fef2f2] p-2 flex justify-center text-xs   text-[#f87171] shadow-2xl'>{error}</h1>}
                    </div>
                </div>
            </div>}
        </>
    );
}


export default ResetPassword