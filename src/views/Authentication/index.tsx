"use client"

import { type ChangeEvent, type KeyboardEvent, useRef, useState } from "react"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { signInRequest, signUpRequest } from "../../apis"
import type { SignInRequestDto, SignUpRequestDto } from "../../apis/request/auth"
import type { SignInResponseDto, SignUpResponseDto } from "../../apis/response/auth"
import type { ResponseDto } from "../../apis/response"
import { CALENDAR_PATH, MAIN_PATH } from "../../constants"
import InputBox from "../../components/InputBox"

export default function Authentication() {
    const [view, setView] = useState<"sign-in" | "sign-up">("sign-in")
    const [cookies, setCookie] = useCookies()
    const navigate = useNavigate()

    const SignInCard = () => {
        const emailRef = useRef<HTMLInputElement | null>(null)
        const passwordRef = useRef<HTMLInputElement | null>(null)
        const [email, setEmail] = useState<string>("")
        const [password, setPassword] = useState<string>("")

        const signInResponse = (responseBody: SignInResponseDto | ResponseDto | null) => {
            if (!responseBody) {
                alert("네트워크 이상입니다.")
                return
            }
            const { code } = responseBody
            if (code === "DBE") alert("데이터베이스 오류입니다.")
            if (code === "SF" || code === "VF") alert("로그인 정보를 확인해주세요.")
            if (code !== "SU") return

            const { token, expirationTime } = responseBody as SignInResponseDto
            const now = new Date().getTime()
            const expires = new Date(now + expirationTime * 1000)
            setCookie("accessToken", token, { expires, path: MAIN_PATH })
            navigate(CALENDAR_PATH)
        }

        const onEmailChangeHandler = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)
        const onPasswordChangeHandler = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)
        const onSignInButtonClickHandler = () => {
            const requestBody: SignInRequestDto = { email, password }
            signInRequest(requestBody).then(signInResponse)
        }

        const onEmailKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") passwordRef.current?.focus()
        }

        const onPasswordKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") onSignInButtonClickHandler()
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-md"
            >
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">로그인</h2>
                <InputBox
                    ref={emailRef}
                    label="이메일 주소"
                    type="text"
                    placeholder="이메일을 입력해주세요."
                    value={email}
                    onChange={onEmailChangeHandler}
                    onKeyDown={onEmailKeyDownHandler}
                    errorMessage="올바른 이메일 형식이 아닙니다."
                    onValidate={(value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)}
                />
                <InputBox
                    ref={passwordRef}
                    label="비밀번호"
                    type="password"
                    placeholder="비밀번호를 입력해주세요."
                    value={password}
                    onChange={onPasswordChangeHandler}
                    onKeyDown={onPasswordKeyDownHandler}
                    errorMessage="비밀번호는 8자 이상이어야 합니다."
                    onValidate={(value) => value.length >= 8}
                />
                <button
                    onClick={onSignInButtonClickHandler}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg mt-6 hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1"
                >
                    로그인
                </button>
                <p className="text-center text-gray-600 mt-4">
                    아이디가 없다면?{" "}
                    <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => setView("sign-up")}>
            회원가입
          </span>
                </p>
            </motion.div>
        )
    }

    const SignUpCard = () => {
        const [name, setName] = useState<string>("")
        const [email, setEmail] = useState<string>("")
        const [password, setPassword] = useState<string>("")
        const [passwordCheck, setPasswordCheck] = useState<string>("")
        const [phone, setPhone] = useState<string>("")

        const nameRef = useRef<HTMLInputElement | null>(null)
        const emailRef = useRef<HTMLInputElement | null>(null)
        const passwordRef = useRef<HTMLInputElement | null>(null)
        const passwordCheckRef = useRef<HTMLInputElement | null>(null)
        const phoneRef = useRef<HTMLInputElement | null>(null)

        const onNameChangeHandler = (e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)
        const onEmailChangeHandler = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)
        const onPasswordChangeHandler = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)
        const onPasswordCheckChangeHandler = (e: ChangeEvent<HTMLInputElement>) => setPasswordCheck(e.target.value)
        const onPhoneChangeHandler = (e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)

        const onNameKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") emailRef.current?.focus()
        }
        const onEmailKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") passwordRef.current?.focus()
        }
        const onPasswordKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") passwordCheckRef.current?.focus()
        }
        const onPasswordCheckKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") phoneRef.current?.focus()
        }
        const onPhoneKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") onSignUpButtonClickHandler()
        }

        const signUpResponse = (responseBody: SignUpResponseDto | ResponseDto | null) => {
            if (!responseBody) {
                alert("네트워크 이상입니다.")
                return
            }
            const { code } = responseBody
            if (code === "DBE") alert("데이터베이스 오류입니다.")
            if (code === "SF" || code === "VF") alert("회원가입 정보를 확인해주세요.")
            if (code === "DE") alert("동일한 이메일이 회원가입되어 있습니다.")
            if (code !== "SU") return

            alert("회원가입에 성공하였습니다! \n 로그인 해주세요.")
            setView("sign-in")
        }

        const onSignUpButtonClickHandler = () => {
            const requestBody: SignUpRequestDto = { name, email, password, phone }
            signUpRequest(requestBody).then(signUpResponse)
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-md"
            >
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">회원가입</h2>
                <InputBox
                    ref={nameRef}
                    label="이름"
                    type="text"
                    placeholder="성함을 입력해주세요."
                    value={name}
                    onChange={onNameChangeHandler}
                    onKeyDown={onNameKeyDownHandler}
                    errorMessage="이름은 2자 이상이어야 합니다."
                    onValidate={(value) => value.length >= 2}
                />
                <InputBox
                    ref={emailRef}
                    label="이메일 주소"
                    type="text"
                    placeholder="이메일을 입력해주세요."
                    value={email}
                    onChange={onEmailChangeHandler}
                    onKeyDown={onEmailKeyDownHandler}
                    errorMessage="올바른 이메일 형식이 아닙니다."
                    onValidate={(value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)}
                />
                <InputBox
                    ref={passwordRef}
                    label="비밀번호"
                    type="password"
                    placeholder="비밀번호를 입력해주세요."
                    value={password}
                    onChange={onPasswordChangeHandler}
                    onKeyDown={onPasswordKeyDownHandler}
                    errorMessage="비밀번호는 8자 이상이어야 합니다."
                    onValidate={(value) => value.length >= 8}
                />
                <InputBox
                    ref={passwordCheckRef}
                    label="비밀번호 확인"
                    type="password"
                    placeholder="비밀번호를 재입력해주세요."
                    value={passwordCheck}
                    onChange={onPasswordCheckChangeHandler}
                    onKeyDown={onPasswordCheckKeyDownHandler}
                    errorMessage="비밀번호가 일치하지 않습니다."
                    onValidate={(value) => value === password}
                />
                <InputBox
                    ref={phoneRef}
                    label="휴대전화번호"
                    type="text"
                    placeholder="전화번호를 입력해주세요. ex)01012345678"
                    value={phone}
                    onChange={onPhoneChangeHandler}
                    onKeyDown={onPhoneKeyDownHandler}
                    errorMessage="올바른 전화번호 형식이 아닙니다."
                    onValidate={(value) => /^[0-9]{11,13}$/.test(value)}
                />
                <button
                    onClick={onSignUpButtonClickHandler}
                    className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg mt-6 hover:bg-green-700 transition duration-300 ease-in-out transform hover:-translate-y-1"
                >
                    회원가입
                </button>
                <p className="text-center text-gray-600 mt-4">
                    이미 계정이 있으신가요?{" "}
                    <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => setView("sign-in")}>
            로그인
          </span>
                </p>
            </motion.div>
        )
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 transition-all duration-300 ease-in-out transform hover:scale-105">
                <AnimatePresence mode="wait">
                    {view === "sign-in" ? <SignInCard key="sign-in" /> : <SignUpCard key="sign-up" />}
                </AnimatePresence>
            </div>
        </div>
    )
}
