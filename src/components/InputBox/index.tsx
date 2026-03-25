import { forwardRef, type ChangeEvent, type KeyboardEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputBoxProps {
    label: string;
    type: 'text' | 'password';
    placeholder: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    errorMessage: string;
    onValidate?: (value: string) => boolean;
    onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(
    ({ label, type, placeholder, value, onChange, errorMessage, onValidate, onKeyDown }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const [error, setError] = useState(false);

        const handleBlur = () => {
            if (onValidate) {
                setError(!onValidate(value));
            }
        };

        const onKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => {
            if (!onKeyDown) return;
            onKeyDown(e);
        };

        return (
            <div className="w-full mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-1.5">{label}</label>
                <div className="relative">
                    <input
                        ref={ref}
                        type={type === "password" && !showPassword ? "password" : "text"}
                        className={`w-full px-4 py-3 pr-10 rounded-xl bg-white/[0.04] border text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                            error
                                ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/10"
                                : "border-white/[0.08] focus:border-indigo-500/50 focus:ring-indigo-500/10"
                        }`}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        onBlur={handleBlur}
                        onKeyDown={onKeyDownHandler}
                    />
                    {type === "password" && (
                        <button
                            type="button"
                            tabIndex={-1}
                            className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 transition-all duration-200"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                        >
                            {showPassword
                                ? <EyeOff size={18} />
                                : <Eye size={18} />
                            }
                        </button>
                    )}
                </div>
                {error && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                        <p className="text-xs text-red-400">{errorMessage}</p>
                    </div>
                )}
            </div>
        );
    }
);

InputBox.displayName = "InputBox";

export default InputBox;
