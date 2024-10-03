import {VariantProps,cva} from "class-variance-authority"
import React, { ButtonHTMLAttributes } from "react";



const ButtonVariant = cva(
    "w-full rounded-none bg-[#6d28d9] text-white font-bold",
)


interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>,VariantProps<typeof ButtonVariant>{
    text:string | React.ReactNode
}
 
const SubmitButton:React.FC<ButtonProps> = ({text,className,type,disabled}) =>
{
    return ( <button disabled={disabled} className={className}  type={type}>
        {text}
    </button>)
}

export default SubmitButton