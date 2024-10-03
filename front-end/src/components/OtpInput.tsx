
'use client'

import React, { useRef, useState } from 'react';


type InputProps = {
    length?: number;
    onComplete: (pin: string) => void;
};


const OTPInput = ({ length = 4, onComplete }: InputProps) => {


    const inputRef = useRef<HTMLInputElement[]>(Array(length).fill(null));


    const [OTP, setOTP] = useState<string[]>(Array(length).fill(''));


    const handleTextChange = (input: string, index: number) => {
        const newPin = [...OTP];
        newPin[index] = input;
        setOTP(newPin);

        if (input.length === 1 && index < length - 1) {
            inputRef.current[index + 1]?.focus();
        }


        if (input.length === 0 && index > 0) {
            inputRef.current[index - 1]?.focus();
        }


        if (newPin.every((digit) => digit !== '')) {
            onComplete(newPin.join(''));
        }
    };


    return (
        <div className={`grid grid-cols-6 gap-4`}>
            {Array.from({ length }, (_, index) => (
                <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={OTP[index]}
                    onChange={(e) => handleTextChange(e.target.value, index)}
                    ref={(ref) => {
                        inputRef.current[index] = ref as HTMLInputElement;
                    }}
                    className={`border border-solid border-border-slate-500 focus:border-blue-600 bg-transparent  rounded-md text-center outline-none p-2 `}
                    style={{ marginRight: index === length - 1 ? '0' : '10px' }}
                />
            ))}
        </div>
    );
};


export default OTPInput;