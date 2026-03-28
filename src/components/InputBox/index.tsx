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
        const [touched, setTouched] = useState(false);

        const handleBlur = () => {
            setTouched(true);
            if (onValidate && value) {
                setError(!onValidate(value));
            }
        };

        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            onChange(e);
            if (touched && onValidate) {
                setError(!onValidate(e.target.value));
            }
        };

        const onKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => {
            if (!onKeyDown) return;
            onKeyDown(e);
        };

        const showError = error && touched;

        return (
            <div className="w-full mb-4">
                <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wider">{label}</label>
                <div className="relative">
                    <input
                        ref={ref}
                        type={type === "password" && !showPassword ? "password" : "text"}
                        className={`w-full px-3.5 py-2.5 ${type === "password" ? "pr-10" : ""} rounded-xl bg-white/[0.04] border text-slate-100 placeholder-slate-700 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                            showError
                                ? "border-red-500/40 focus:border-red-500/50 focus:ring-red-500/10"
                                : "border-white/[0.08] focus:border-indigo-500/40 focus:ring-indigo-500/10"
                        }`}
                        placeholder={placeholder}
                        value={value}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyDown={onKeyDownHandler}
                    />
                    {type === "password" && (
                        <button
                            type="button"
                            tabIndex={-1}
                            className="absolute inset-y-0 right-3 flex items-center text-slate-600 hover:text-slate-400 transition-colors duration-200"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                        >
                            {showPassword
                                ? <EyeOff size={16} />
                                : <Eye size={16} />
                            }
                        </button>
                    )}
                </div>
                {showError && (
                    <p className="text-[11px] text-red-400 mt-1.5">{errorMessage}</p>
                )}
            </div>
        );
    }
);

InputBox.displayName = "InputBox";

export default InputBox;
