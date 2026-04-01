"use client"

import { type ChangeEvent, type KeyboardEvent, useRef, useState } from "react"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { findIdRequest, findPasswordRequest, resetPasswordRequest, signInRequest, signUpRequest, verifiedNumberRequest } from "../../apis"
import type { FindIdRequestDto, ResetPasswordRequestDto, SignInRequestDto, SignUpRequestDto } from "../../apis/request/auth"
import type { FindIdResponseDto, ResetPasswordResponseDto, SignInResponseDto, SignUpResponseDto } from "../../apis/response/auth"
import type { ResponseDto } from "../../apis/response"
import { CALENDAR_PATH, MAIN_PATH } from "../../constants"
import InputBox from "../../components/InputBox"
import type { FindPasswordResponseDto, VerifiedNumberResponseDto } from "../../apis/response/mail"
import type { FindPasswordRequestDto, VerifiedNumberRequestDto } from "../../apis/request/mail"
import ResponseCode from "../../types/enum/response-code.enum"
import { CheckSquare, ArrowLeft } from "lucide-react"

type AuthView = "sign-in" | "sign-up" | "find-id" | "find-password" | "reset-password"

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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
        >
            <div className="text-center mb-7">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                    <CheckSquare size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-xl font-bold text-slate-100 tracking-tight">다시 만나서 반가워요</h1>
                <p className="text-slate-500 text-sm mt-1">계속하려면 로그인해주세요</p>
            </div>

            <InputBox
                ref={emailRef}
                label="이메일" type="text" placeholder="이메일을 입력하세요"
                value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") passwordRef.current?.focus() }}
                errorMessage="올바른 이메일 형식이 아닙니다."
                onValidate={(value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)}
            />
            <InputBox
                ref={passwordRef}
                label="비밀번호" type="password" placeholder="비밀번호를 입력하세요"
                value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") onSignInButtonClickHandler() }}
                errorMessage="비밀번호는 8자 이상이어야 합니다."
                onValidate={(value) => value.length >= 8}
            />

            <button
                onClick={onSignInButtonClickHandler}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl mt-1 transition-all duration-200 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_28px_rgba(99,102,241,0.4)] active:scale-[0.98] text-sm"
            >
                로그인
            </button>

            <div className="flex items-center justify-center gap-3 mt-5">
                <button
                    className="text-sm text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
                    onClick={() => setView("find-id")}
                >
                    아이디 찾기
                </button>
                <span className="text-white/10 text-xs">|</span>
                <button
                    className="text-sm text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
                    onClick={() => setView("find-password")}
                >
                    비밀번호 찾기
                </button>
            </div>

            <div className="mt-5 pt-5 border-t border-white/[0.06] text-center">
                <span className="text-slate-600 text-sm">계정이 없으신가요? </span>
                <button
                    className="text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors font-medium"
                    onClick={() => setView("sign-up")}
                >
                    회원가입
                </button>
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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
        >
            <div className="flex items-center gap-2 mb-6">
                <button
                    onClick={() => setView("sign-in")}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
                >
                    <ArrowLeft size={16} />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-slate-100 tracking-tight leading-tight">계정 만들기</h1>
                    <p className="text-slate-500 text-xs">새 계정을 등록해주세요</p>
                </div>
            </div>

            <InputBox ref={nameRef} label="이름" type="text" placeholder="성함을 입력해주세요" value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") emailRef.current?.focus() }}
                errorMessage="이름은 2자 이상이어야 합니다." onValidate={(v) => v.length >= 2} />
            <InputBox ref={emailRef} label="이메일" type="text" placeholder="이메일을 입력해주세요" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") passwordRef.current?.focus() }}
                errorMessage="올바른 이메일 형식이 아닙니다." onValidate={(v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)} />
            <InputBox ref={passwordRef} label="비밀번호" type="password" placeholder="비밀번호를 입력해주세요" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") passwordCheckRef.current?.focus() }}
                errorMessage="비밀번호는 8자 이상이어야 합니다." onValidate={(v) => v.length >= 8} />
            <InputBox ref={passwordCheckRef} label="비밀번호 확인" type="password" placeholder="비밀번호를 재입력해주세요" value={passwordCheck}
                onChange={(e) => setPasswordCheck(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") phoneRef.current?.focus() }}
                errorMessage="비밀번호가 일치하지 않습니다." onValidate={(v) => v === password} />
            <InputBox ref={phoneRef} label="휴대전화번호" type="text" placeholder="01012345678" value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") onSignUpButtonClickHandler() }}
                errorMessage="올바른 전화번호 형식이 아닙니다." onValidate={(v) => /^[0-9]{11,13}$/.test(v)} />

            <button
                onClick={onSignUpButtonClickHandler}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl mt-1 transition-all duration-200 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_28px_rgba(99,102,241,0.4)] active:scale-[0.98] text-sm"
            >
                가입하기
            </button>
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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
        >
            <div className="flex items-center gap-2 mb-6">
                <button
                    onClick={() => setView("sign-in")}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
                >
                    <ArrowLeft size={16} />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-slate-100 tracking-tight leading-tight">아이디 찾기</h1>
                    <p className="text-slate-500 text-xs">이름과 전화번호로 이메일을 찾아드려요</p>
                </div>
            </div>

            <InputBox ref={nameRef} label="이름" type="text" placeholder="이름을 입력해주세요" value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") phoneRef.current?.focus() }}
                errorMessage="이름은 2자 이상이어야 합니다." onValidate={(v) => v.length >= 2} />
            <InputBox ref={phoneRef} label="휴대전화번호" type="text" placeholder="01012345678" value={phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") onFindIdButtonClickHandler() }}
                errorMessage="올바른 전화번호 형식이 아닙니다." onValidate={(v) => /^[0-9]{11,13}$/.test(v)} />

            {foundEmail && (
                <div className="mb-4 p-4 bg-indigo-500/8 border border-indigo-500/20 rounded-xl">
                    <p className="text-[11px] text-indigo-400 mb-1 font-medium uppercase tracking-wider">찾은 이메일</p>
                    <p className="text-slate-100 font-semibold text-sm">{foundEmail}</p>
                </div>
            )}

            <button
                onClick={onFindIdButtonClickHandler}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl mt-1 transition-all duration-200 shadow-[0_0_20px_rgba(99,102,241,0.3)] active:scale-[0.98] text-sm"
            >
                아이디 찾기
            </button>

            <div className="flex items-center justify-center gap-3 mt-5">
                <button
                    className="text-sm text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
                    onClick={() => setView("find-password")}
                >
                    비밀번호 찾기
                </button>
            </div>
        </motion.div>
    )
}

interface FindPasswordCardProps {
    setView: (view: AuthView) => void
    setVerifiedEmail: (email: string) => void
}

function FindPasswordCard({ setView, setVerifiedEmail }: FindPasswordCardProps) {
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
        setVerifiedEmail(email)
        setView("reset-password")
    }

    const onVerifyCodeButtonClickHandler = () => {
        const requestBody: VerifiedNumberRequestDto = { email, number }
        verifiedNumberRequest(requestBody).then(verifiedNumberResponse)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
        >
            <div className="flex items-center gap-2 mb-6">
                <button
                    onClick={() => setView("sign-in")}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
                >
                    <ArrowLeft size={16} />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-slate-100 tracking-tight leading-tight">비밀번호 찾기</h1>
                    <p className="text-slate-500 text-xs">이메일로 인증코드를 발송해드려요</p>
                </div>
            </div>

            {/* 이메일 입력 */}
            <div className="mb-4">
                <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wider">이메일</label>
                <div className="flex gap-2">
                    <input
                        ref={emailRef}
                        type="email"
                        placeholder="이메일을 입력해주세요"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter" && !isEmailSent) onSendVerificationCodeHandler() }}
                        disabled={isEmailSent}
                        className={`flex-1 px-3.5 py-2.5 rounded-xl border text-slate-100 placeholder-slate-700 text-sm focus:outline-none focus:ring-2 focus:border-indigo-500/40 focus:ring-indigo-500/10 transition-all duration-200 ${
                            isEmailSent
                                ? "bg-white/[0.02] border-white/[0.04] text-slate-600 cursor-not-allowed"
                                : "bg-white/[0.04] border-white/[0.08]"
                        }`}
                    />
                    <button
                        onClick={onSendVerificationCodeHandler}
                        disabled={isEmailSent}
                        className="whitespace-nowrap px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        인증번호 받기
                    </button>
                </div>
                {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                    <p className="text-[11px] text-red-400 mt-1.5">올바른 이메일 형식이 아닙니다.</p>
                )}
            </div>

            {/* 인증번호 입력 */}
            <div className="mb-4">
                <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wider">인증 번호</label>
                <input
                    ref={verificationCodeRef}
                    type="text"
                    placeholder="이메일로 받은 인증 번호를 입력해주세요"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter" && isEmailSent) onVerifyCodeButtonClickHandler() }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-100 placeholder-slate-700 text-sm focus:outline-none focus:ring-2 focus:border-indigo-500/40 focus:ring-indigo-500/10 transition-all duration-200"
                />
            </div>

            {isEmailSent && (
                <div className="mb-4 p-3.5 bg-indigo-500/8 border border-indigo-500/20 rounded-xl">
                    <p className="text-xs text-indigo-400">
                        <span className="font-medium">{email}</span>로 인증코드를 발송했습니다.
                    </p>
                </div>
            )}

            <button
                onClick={onVerifyCodeButtonClickHandler}
                disabled={!isEmailSent}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl mt-1 transition-all duration-200 shadow-[0_0_20px_rgba(99,102,241,0.3)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 text-sm"
            >
                인증하기
            </button>
        </motion.div>
    )
}

interface ResetPasswordCardProps {
    setView: (view: AuthView) => void
    verifiedEmail: string
}

function ResetPasswordCard({ setView, verifiedEmail }: ResetPasswordCardProps) {
    const [newPassword, setNewPassword] = useState<string>("")
    const [newPasswordCheck, setNewPasswordCheck] = useState<string>("")
    const newPasswordRef = useRef<HTMLInputElement | null>(null)
    const newPasswordCheckRef = useRef<HTMLInputElement | null>(null)

    const resetPasswordResponse = (responseBody: ResetPasswordResponseDto | ResponseDto | null) => {
        if (!responseBody) { alert("네트워크 이상입니다."); return }
        const { code } = responseBody
        if (code === ResponseCode.DATABASE_ERROR) alert("데이터베이스 오류입니다.")
        if (code === ResponseCode.AUTHORIZATION_FAILED) alert("인증이 만료되었습니다. 다시 시도해주세요.")
        if (code === ResponseCode.NOT_EXISTED_USER) alert("존재하지 않는 이메일입니다.")
        if (code !== ResponseCode.SUCCESS) return
        alert("비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.")
        setView("sign-in")
    }

    const onResetPasswordButtonClickHandler = () => {
        if (newPassword !== newPasswordCheck) {
            alert("비밀번호가 일치하지 않습니다.")
            return
        }
        if (newPassword.length < 8) {
            alert("비밀번호는 8자 이상이어야 합니다.")
            return
        }
        const requestBody: ResetPasswordRequestDto = { email: verifiedEmail, newPassword }
        resetPasswordRequest(requestBody).then(resetPasswordResponse)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
        >
            <div className="flex items-center gap-2 mb-6">
                <button
                    onClick={() => setView("find-password")}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
                >
                    <ArrowLeft size={16} />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-slate-100 tracking-tight leading-tight">새 비밀번호 설정</h1>
                    <p className="text-slate-500 text-xs">사용할 새 비밀번호를 입력해주세요</p>
                </div>
            </div>

            <div className="mb-4 p-3.5 bg-indigo-500/8 border border-indigo-500/20 rounded-xl">
                <p className="text-[11px] text-indigo-400 mb-0.5 font-medium uppercase tracking-wider">인증된 이메일</p>
                <p className="text-slate-100 text-sm font-semibold">{verifiedEmail}</p>
            </div>

            <InputBox
                ref={newPasswordRef}
                label="새 비밀번호" type="password" placeholder="새 비밀번호를 입력해주세요"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") newPasswordCheckRef.current?.focus() }}
                errorMessage="비밀번호는 8자 이상이어야 합니다." onValidate={(v) => v.length >= 8}
            />
            <InputBox
                ref={newPasswordCheckRef}
                label="새 비밀번호 확인" type="password" placeholder="새 비밀번호를 재입력해주세요"
                value={newPasswordCheck} onChange={(e) => setNewPasswordCheck(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") onResetPasswordButtonClickHandler() }}
                errorMessage="비밀번호가 일치하지 않습니다." onValidate={(v) => v === newPassword}
            />

            <button
                onClick={onResetPasswordButtonClickHandler}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl mt-1 transition-all duration-200 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_28px_rgba(99,102,241,0.4)] active:scale-[0.98] text-sm"
            >
                비밀번호 변경
            </button>
        </motion.div>
    )
}

export default function Authentication() {
    const [view, setView] = useState<AuthView>("sign-in")
    const [verifiedEmail, setVerifiedEmail] = useState<string>("")

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#09090f] p-4 overflow-hidden">
            {/* 배경 광원 효과 */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/8 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[350px] bg-violet-600/6 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

            {/* 카드 */}
            <div className="relative w-full max-w-[380px]">
                {/* 카드 글로우 */}
                <div className="absolute -inset-px bg-gradient-to-b from-white/[0.06] to-transparent rounded-2xl pointer-events-none" />
                <div className="relative bg-[#111118] rounded-2xl border border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-hidden">
                    {/* 상단 그라디언트 라인 */}
                    <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                    <div className="p-7">
                        <AnimatePresence mode="wait">
                            {view === "sign-in" && <SignInCard key="sign-in" setView={setView} />}
                            {view === "sign-up" && <SignUpCard key="sign-up" setView={setView} />}
                            {view === "find-id" && <FindIdCard key="find-id" setView={setView} />}
                            {view === "find-password" && <FindPasswordCard key="find-password" setView={setView} setVerifiedEmail={setVerifiedEmail} />}
                            {view === "reset-password" && <ResetPasswordCard key="reset-password" setView={setView} verifiedEmail={verifiedEmail} />}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
