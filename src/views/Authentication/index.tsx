"use client"

import { type ChangeEvent, type KeyboardEvent, useRef, useState } from "react"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { findIdRequest, findPasswordRequest, signInRequest, signUpRequest, verifiedNumberRequest } from "../../apis"
import type { FindIdRequestDto, SignInRequestDto, SignUpRequestDto } from "../../apis/request/auth"
import type { FindIdResponseDto, SignInResponseDto, SignUpResponseDto } from "../../apis/response/auth"
import type { ResponseDto } from "../../apis/response"
import { CALENDAR_PATH, MAIN_PATH } from "../../constants"
import InputBox from "../../components/InputBox"
import type { FindPasswordResponseDto, VerifiedNumberResponseDto } from "../../apis/response/mail"
import type { FindPasswordRequestDto, VerifiedNumberRequestDto } from "../../apis/request/mail"
import ResponseCode from "../../types/enum/response-code.enum"

type AuthView = "sign-in" | "sign-up" | "find-id" | "find-password"

interface SignInCardProps {
    setView: (view: AuthView) => void
}

function SignInCard({ setView }: SignInCardProps) {
    const emailRef = useRef<HTMLInputElement | null>(null)
    const passwordRef = useRef<HTMLInputElement | null>(null)
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [, setCookie] = useCookies()
    const navigate = useNavigate()

    const signInResponse = (responseBody: SignInResponseDto | ResponseDto | null) => {
        if (!responseBody) { alert("네트워크 이상입니다."); return }
        const { code } = responseBody
        if (code === ResponseCode.DATABASE_ERROR) alert("데이터베이스 오류입니다.")
        if (code === ResponseCode.SIGN_IN_FAIL || code === ResponseCode.VALIDATION_FAILED) alert("로그인 정보를 확인해주세요.")
        if (code !== ResponseCode.SUCCESS) return

        const { token, expirationTime } = responseBody as SignInResponseDto
        const now = new Date().getTime()
        const expires = new Date(now + expirationTime * 1000)
        setCookie("accessToken", token, { expires, path: MAIN_PATH })
        navigate(CALENDAR_PATH)
    }

    const onSignInButtonClickHandler = () => {
        const requestBody: SignInRequestDto = { email, password }
        signInRequest(requestBody).then(signInResponse)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
        >
            {/* 로고 & 타이틀 */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-4 shadow-lg shadow-indigo-500/25">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 11l3 3L22 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                    Todo App
                </h1>
                <p className="text-slate-400 text-sm mt-1">다시 만나서 반가워요</p>
            </div>

            <InputBox
                ref={emailRef}
                label="이메일 주소" type="text" placeholder="이메일을 입력해주세요."
                value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") passwordRef.current?.focus() }}
                errorMessage="올바른 이메일 형식이 아닙니다."
                onValidate={(value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)}
            />
            <InputBox
                ref={passwordRef}
                label="비밀번호" type="password" placeholder="비밀번호를 입력해주세요."
                value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") onSignInButtonClickHandler() }}
                errorMessage="비밀번호는 8자 이상이어야 합니다."
                onValidate={(value) => value.length >= 8}
            />

            <button
                onClick={onSignInButtonClickHandler}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold py-3 px-4 rounded-xl mt-2 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-[0.98]"
            >
                로그인
            </button>

            <div className="flex items-center justify-center gap-3 mt-5">
                <span
                    className="text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
                    onClick={() => setView("find-id")}
                >
                    아이디 찾기
                </span>
                <span className="text-slate-700 text-xs">|</span>
                <span
                    className="text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
                    onClick={() => setView("find-password")}
                >
                    비밀번호 찾기
                </span>
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.06] text-center">
                <span className="text-slate-500 text-sm">계정이 없으신가요? </span>
                <span
                    className="text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors font-medium"
                    onClick={() => setView("sign-up")}
                >
                    회원가입
                </span>
            </div>
        </motion.div>
    )
}

interface SignUpCardProps {
    setView: (view: AuthView) => void
}

function SignUpCard({ setView }: SignUpCardProps) {
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

    const signUpResponse = (responseBody: SignUpResponseDto | ResponseDto | null) => {
        if (!responseBody) { alert("네트워크 이상입니다."); return }
        const { code } = responseBody
        if (code === ResponseCode.DATABASE_ERROR) alert("데이터베이스 오류입니다.")
        if (code === ResponseCode.DUPLICATE_PHONE) alert("동일한 휴대전화로 회원가입되어 있습니다.")
        if (code === ResponseCode.DUPLICATE_EMAIL) alert("동일한 이메일이 회원가입되어 있습니다.")
        if (code !== ResponseCode.SUCCESS) return

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
            className="w-full"
        >
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-4 shadow-lg shadow-indigo-500/25">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-100">계정 만들기</h1>
                <p className="text-slate-400 text-sm mt-1">새 계정을 등록해주세요</p>
            </div>

            <InputBox ref={nameRef} label="이름" type="text" placeholder="성함을 입력해주세요." value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") emailRef.current?.focus() }}
                errorMessage="이름은 2자 이상이어야 합니다." onValidate={(v) => v.length >= 2} />
            <InputBox ref={emailRef} label="이메일 주소" type="text" placeholder="이메일을 입력해주세요." value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") passwordRef.current?.focus() }}
                errorMessage="올바른 이메일 형식이 아닙니다." onValidate={(v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)} />
            <InputBox ref={passwordRef} label="비밀번호" type="password" placeholder="비밀번호를 입력해주세요." value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") passwordCheckRef.current?.focus() }}
                errorMessage="비밀번호는 8자 이상이어야 합니다." onValidate={(v) => v.length >= 8} />
            <InputBox ref={passwordCheckRef} label="비밀번호 확인" type="password" placeholder="비밀번호를 재입력해주세요." value={passwordCheck}
                onChange={(e) => setPasswordCheck(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") phoneRef.current?.focus() }}
                errorMessage="비밀번호가 일치하지 않습니다." onValidate={(v) => v === password} />
            <InputBox ref={phoneRef} label="휴대전화번호" type="text" placeholder="전화번호를 입력해주세요. ex)01012345678" value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") onSignUpButtonClickHandler() }}
                errorMessage="올바른 전화번호 형식이 아닙니다." onValidate={(v) => /^[0-9]{11,13}$/.test(v)} />

            <button
                onClick={onSignUpButtonClickHandler}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold py-3 px-4 rounded-xl mt-2 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-[0.98]"
            >
                가입하기
            </button>

            <div className="mt-4 pt-4 border-t border-white/[0.06] text-center">
                <span className="text-slate-500 text-sm">이미 계정이 있으신가요? </span>
                <span
                    className="text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors font-medium"
                    onClick={() => setView("sign-in")}
                >
                    로그인으로 돌아가기
                </span>
            </div>
        </motion.div>
    )
}

interface FindIdCardProps {
    setView: (view: AuthView) => void
}

function FindIdCard({ setView }: FindIdCardProps) {
    const [name, setName] = useState<string>("")
    const [phone, setPhone] = useState<string>("")
    const [foundEmail, setFoundEmail] = useState<string | null>(null)
    const nameRef = useRef<HTMLInputElement | null>(null)
    const phoneRef = useRef<HTMLInputElement | null>(null)

    const findIdResponse = (responseBody: FindIdResponseDto | ResponseDto | null) => {
        if (!responseBody) { alert("네트워크 이상입니다."); return }
        const { code } = responseBody
        if (code === ResponseCode.DATABASE_ERROR) alert("데이터베이스 오류입니다.")
        if (code === ResponseCode.FIND_ID_FAIL) alert("일치하는 회원정보가 없습니다.")
        if (code !== ResponseCode.SUCCESS) return

        const { email } = responseBody as FindIdResponseDto
        setFoundEmail(email)
    }

    const onFindIdButtonClickHandler = () => {
        const requestBody: FindIdRequestDto = { name, phone }
        findIdRequest(requestBody).then(findIdResponse)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
        >
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-4 shadow-lg shadow-indigo-500/25">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2"/>
                        <path d="m21 21-4.35-4.35" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-100">아이디 찾기</h1>
                <p className="text-slate-400 text-sm mt-1">이름과 전화번호로 이메일을 찾아드려요</p>
            </div>

            <InputBox ref={nameRef} label="이름" type="text" placeholder="이름을 입력해주세요." value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") phoneRef.current?.focus() }}
                errorMessage="이름은 2자 이상이어야 합니다." onValidate={(v) => v.length >= 2} />
            <InputBox ref={phoneRef} label="휴대전화번호" type="text" placeholder="전화번호를 입력해주세요. ex)01012345678" value={phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") onFindIdButtonClickHandler() }}
                errorMessage="올바른 전화번호 형식이 아닙니다." onValidate={(v) => /^[0-9]{11,13}$/.test(v)} />

            {foundEmail && (
                <div className="mb-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <p className="text-xs text-indigo-400 mb-1 font-medium">찾은 이메일</p>
                    <p className="text-slate-100 font-semibold">{foundEmail}</p>
                </div>
            )}

            <button
                onClick={onFindIdButtonClickHandler}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold py-3 px-4 rounded-xl mt-2 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-[0.98]"
            >
                아이디 찾기
            </button>

            <div className="flex items-center justify-center gap-3 mt-5">
                <span
                    className="text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
                    onClick={() => setView("sign-in")}
                >
                    로그인으로 돌아가기
                </span>
                <span className="text-slate-700 text-xs">|</span>
                <span
                    className="text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
                    onClick={() => setView("find-password")}
                >
                    비밀번호 찾기
                </span>
            </div>
        </motion.div>
    )
}

interface FindPasswordCardProps {
    setView: (view: AuthView) => void
}

function FindPasswordCard({ setView }: FindPasswordCardProps) {
    const [email, setEmail] = useState<string>("")
    const [number, setNumber] = useState<string>("")
    const [isEmailSent, setIsEmailSent] = useState<boolean>(false)
    const emailRef = useRef<HTMLInputElement | null>(null)
    const verificationCodeRef = useRef<HTMLInputElement | null>(null)

    const findPasswordResponse = (responseBody: FindPasswordResponseDto | ResponseDto | null) => {
        if (!responseBody) { alert("네트워크 이상입니다."); return }
        const { code } = responseBody
        if (code === ResponseCode.DATABASE_ERROR) alert("데이터베이스 오류입니다.")
        if (code === ResponseCode.NOT_EXISTED_USER) alert("회원가입 되어있는 이메일이 아닙니다.")
        if (code !== ResponseCode.SUCCESS) return
        alert(email + "로 인증코드를 발송하였습니다.")
    }

    const onSendVerificationCodeHandler = () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("올바른 이메일 형식이 아닙니다.")
            return
        }
        const requestBody: FindPasswordRequestDto = { email }
        findPasswordRequest(requestBody).then(findPasswordResponse)
        setIsEmailSent(true)
        setTimeout(() => { verificationCodeRef.current?.focus() }, 100)
    }

    const verifiedNumberResponse = (responseBody: VerifiedNumberResponseDto | ResponseDto | null) => {
        if (!responseBody) { alert("네트워크 이상입니다."); return }
        const { code } = responseBody
        if (code === ResponseCode.DATABASE_ERROR) alert("데이터베이스 오류입니다.")
        if (code === ResponseCode.NOT_MATCH_NUMBER) alert("인증번호가 틀렸습니다.")
        if (code !== ResponseCode.SUCCESS) return
        alert("인증이 완료되었습니다.")
        setView("sign-in")
    }

    const onVerifyCodeButtonClickHandler = () => {
        const requestBody: VerifiedNumberRequestDto = { email, number }
        verifiedNumberRequest(requestBody).then(verifiedNumberResponse)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
        >
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-4 shadow-lg shadow-indigo-500/25">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="white" strokeWidth="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-100">비밀번호 찾기</h1>
                <p className="text-slate-400 text-sm mt-1">이메일로 인증코드를 발송해드려요</p>
            </div>

            {/* 이메일 입력 + 인증번호 받기 버튼 */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-1.5">이메일 주소</label>
                <div className="flex gap-2">
                    <input
                        ref={emailRef}
                        id="email"
                        type="email"
                        placeholder="이메일을 입력해주세요."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter" && !isEmailSent) onSendVerificationCodeHandler() }}
                        disabled={isEmailSent}
                        className={`flex-1 px-4 py-3 rounded-xl border text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:border-indigo-500/50 focus:ring-indigo-500/10 transition-all duration-200 ${
                            isEmailSent
                                ? "bg-white/[0.02] border-white/[0.04] text-slate-500 cursor-not-allowed"
                                : "bg-white/[0.04] border-white/[0.08]"
                        }`}
                    />
                    <button
                        onClick={onSendVerificationCodeHandler}
                        disabled={isEmailSent}
                        className="whitespace-nowrap px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-indigo-500 disabled:hover:to-violet-600"
                    >
                        인증번호 받기
                    </button>
                </div>
                {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                        <p className="text-xs text-red-400">올바른 이메일 형식이 아닙니다.</p>
                    </div>
                )}
            </div>

            {/* 인증번호 입력 */}
            <div className="mb-4">
                <label htmlFor="verificationCode" className="block text-sm font-medium text-slate-400 mb-1.5">인증 번호</label>
                <input
                    ref={verificationCodeRef}
                    id="verificationCode"
                    type="text"
                    placeholder="이메일로 받은 인증 번호를 입력해주세요."
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter" && isEmailSent) onVerifyCodeButtonClickHandler() }}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:border-indigo-500/50 focus:ring-indigo-500/10 transition-all duration-200"
                />
                {number === "" && isEmailSent && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                        <p className="text-xs text-red-400">인증 번호를 입력해주세요.</p>
                    </div>
                )}
            </div>

            {isEmailSent && (
                <div className="mb-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <p className="text-xs text-indigo-400 font-medium">
                        {email}로 인증코드를 발송했습니다. 메일함을 확인해주세요.
                    </p>
                </div>
            )}

            <button
                onClick={onVerifyCodeButtonClickHandler}
                disabled={!isEmailSent}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold py-3 px-4 rounded-xl mt-2 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-indigo-500 disabled:hover:to-violet-600 disabled:active:scale-100"
            >
                인증하기
            </button>

            <div className="flex items-center justify-center gap-3 mt-5">
                <span
                    className="text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
                    onClick={() => setView("sign-in")}
                >
                    로그인으로 돌아가기
                </span>
                <span className="text-slate-700 text-xs">|</span>
                <span
                    className="text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
                    onClick={() => setView("find-id")}
                >
                    아이디 찾기
                </span>
            </div>
        </motion.div>
    )
}

export default function Authentication() {
    const [view, setView] = useState<AuthView>("sign-in")

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#0d0d12] p-4 overflow-hidden">
            {/* 배경 광원 효과 */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-violet-500/8 blur-[100px] rounded-full pointer-events-none" />

            {/* 카드 */}
            <div className="relative w-full max-w-[400px] bg-[#13131a] rounded-2xl p-8 border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <AnimatePresence mode="wait">
                    {view === "sign-in" && <SignInCard key="sign-in" setView={setView} />}
                    {view === "sign-up" && <SignUpCard key="sign-up" setView={setView} />}
                    {view === "find-id" && <FindIdCard key="find-id" setView={setView} />}
                    {view === "find-password" && <FindPasswordCard key="find-password" setView={setView} />}
                </AnimatePresence>
            </div>
        </div>
    )
}
