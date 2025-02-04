import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputBoxProps {
    label: string;
    type?: "name" | "email" | "password" | "password-valid" | "phone";
    placeholder: string;
    errorMessage?: string;
    onValidate?: (value: string) => boolean;
}

const InputBox = ({ label, type, placeholder, errorMessage, onValidate }: InputBoxProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [value, setValue] = useState("");
    const [error, setError] = useState(false);

    const handleBlur = () => {
        if (onValidate) {
            setError(!onValidate(value)); // 유효성 검사 결과가 false이면 error 상태 활성화
        }
    };

    return (
        <div className="w-full max-w-sm">
            <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <input
                    type={type === "password" || type === "password-valid" ? (showPassword ? "text" : "password") : "text"}
                    className={`w-full p-2 pr-10 border rounded-lg focus:outline-none ${
                        error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={handleBlur}
                />
                {/* 비밀번호일 때만 아이콘 표시 */}
                {type === "password" || type === "password-valid" ? (
                    <div
                        className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={20} className="text-gray-500"/> :
                            <Eye size={20} className="text-gray-500"/>}
                    </div>
                ) : null}
            </div>
            {error && <div className="text-xs text-red-500 mt-1">{errorMessage}</div>}
        </div>
    );
};

export default InputBox;