import React, {ChangeEvent, Dispatch, KeyboardEvent, SetStateAction, useState} from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputBoxProps {
    label: string;
    type: 'text' | 'password';
    placeholder: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>)=>void;
    errorMessage: string;
    onValidate?: (value: string) => boolean;

    onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) =>void;
}
//          component Input Box 컴포넌트          //
function  InputBox ({label, type, placeholder, value, onChange, errorMessage, onValidate, onKeyDown, ref}: InputBoxProps){
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(false);

    const handleBlur = () => {
        if (onValidate) {
            setError(!onValidate(value)); // 유효성 검사 결과가 false이면 error 상태 활성화
        }
    };

    //          event handler : input 값 변경 이벤트 처리 함수          //


    const onKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) =>{
        if(!onKeyDown) return;
        onKeyDown(e);
    }
    //          render: Input Box 컴포넌트          //
    return (
        <div className="w-full max-w-sm">
            <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <input
                    ref = {ref}
                    type={type === "password" && !showPassword ? "password" : "text"}
                    className={`w-full p-2 pr-10 border rounded-lg focus:outline-none ${
                        error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                    placeholder={placeholder}
                    value={value}
                    onChange = {onChange}
                    onBlur={handleBlur}
                    onKeyDown={onKeyDownHandler}
                />
                {type === "password" && (
                    <div
                        className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={20} className="text-gray-500"/> : <Eye size={20} className="text-gray-500"/>}
                    </div>
                )}
            </div>
            {error && <div className="text-xs text-red-500 mt-1">{errorMessage}</div>}
        </div>
    )
};

export default InputBox;