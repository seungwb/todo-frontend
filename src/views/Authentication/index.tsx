import React, { useState } from "react";
import InputBox from "../../components/InputBox";

export default function Authentication() {
    // ✅ 현재 화면 상태 (로그인 / 회원가입)
    const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-in');

    // ✅ 회원가입 시 필요한 상태 (입력값 저장)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
    });

    // ✅ 회원가입 폼 유효성 상태
    const [valid, setValid] = useState({
        email: false,
        password: false,
        confirmPassword: false,
        phone: false,
    });

    // ✅ 입력값 변경 핸들러
    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // ✅ 유효성 검증 핸들러
    const handleValidation = (field: string, isValid: boolean) => {
        setValid((prev) => ({
            ...prev,
            [field]: isValid,
        }));
    };

    // ✅ 로그인 핸들러
    const handleLogin = () => {
        alert("로그인 성공!");
    };

    // ✅ 회원가입 핸들러
    const handleSignup = () => {
        if (valid.email && valid.password && valid.confirmPassword && valid.phone) {
            alert("회원가입 성공!");
        } else {
            alert("입력 정보를 확인해주세요.");
        }
    };

    // 🔹 로그인 폼
    const SignInCard = () => {
        return (
            <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-center mb-4">로그인</h2>
                <InputBox
                    label="이메일"
                    type="email"
                    placeholder="이메일을 입력하세요"
                    errorMessage="유효한 이메일을 입력하세요."
                    onValidate={(value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)}
                />
                <InputBox
                    label="비밀번호"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    errorMessage="비밀번호는 8자 이상이어야 합니다."
                    onValidate={(value) => value.length >= 8}
                />
                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4"
                >
                    로그인
                </button>
                <p className="text-center text-sm mt-4">
                    아이디가 없다면?{" "}
                    <span className="text-blue-500 cursor-pointer" onClick={() => setView("sign-up")}>
            회원가입
          </span>
                </p>
            </div>
        );
    };

    // 🔹 회원가입 폼
    const SignUpCard = () => {
        return (
            <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-center mb-4">회원가입</h2>
                <InputBox
                    label="이름"
                    type="text"
                    placeholder="이름을 입력하세요"
                    errorMessage="유효한 이름을 입력하세요."
                    onValidate={(value) => value.length >= 2}
                />
                <InputBox
                    label="이메일"
                    type="email"
                    placeholder="이메일을 입력하세요"
                    errorMessage="유효한 이메일을 입력하세요."
                    onValidate={(value) => {
                        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                        handleValidation("email", isValid);
                        return isValid;
                    }}
                />
                <InputBox
                    label="비밀번호"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    errorMessage="비밀번호는 8자 이상이어야 합니다."
                    onValidate={(value) => {
                        handleInputChange("password", value);
                        const isValid = value.length >= 8;
                        handleValidation("password", isValid);
                        return isValid;
                    }}
                />
                <InputBox
                    label="비밀번호 확인"
                    type="password-valid"
                    placeholder="비밀번호를 재입력하세요"
                    errorMessage="입력하신 비밀번호와 같지 않습니다."
                    onValidate={(value) => {
                        const isValid = value === formData.password;
                        handleValidation("confirmPassword", isValid);
                        return isValid;
                    }}
                />
                <InputBox
                    label="전화번호"
                    type="phone"
                    placeholder="전화번호를 입력하세요"
                    errorMessage="유효한 전화번호를 입력하세요."
                    onValidate={(value) => {
                        const isValid = /^[0-9]{11,13}$/.test(value);
                        handleValidation("phone", isValid);
                        return isValid;
                    }}
                />
                <button
                    onClick={handleSignup}
                    disabled={!valid.email || !valid.password || !valid.confirmPassword || !valid.phone}
                    className={`w-full py-2 px-4 rounded mt-4 font-bold text-white ${
                        valid.email && valid.password && valid.confirmPassword && valid.phone
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-gray-400 cursor-not-allowed"
                    }`}
                >
                    회원가입
                </button>
                <p className="text-center text-sm mt-4">
                    이미 계정이 있나요?{" "}
                    <span className="text-blue-500 cursor-pointer" onClick={() => setView("sign-in")}>
            로그인
          </span>
                </p>
            </div>
        );
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            {view === "sign-in" ? <SignInCard /> : <SignUpCard />}
        </div>
    );
}
