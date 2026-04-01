"use client"

import { useEffect, useState, type KeyboardEvent } from "react"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
    User, Mail, Phone, Calendar, Shield, LogOut,
    Pencil, Check, X, KeyRound, Trash2, CheckSquare, CalendarDays, TrendingUp,
} from "lucide-react"
import {
    getMeRequest, updateMeRequest, changePasswordRequest, withdrawRequest,
    getTodoRequest, getScheduleRequest,
} from "../../apis"
import type { GetMemberResponseDto } from "../../apis/response/member"
import type { ResponseDto } from "../../apis/response"
import type { GetTodoResponseDto } from "../../apis/response/todo"
import type { GetScheduleResponseDto } from "../../apis/response/schedule"
import ResponseCode from "../../types/enum/response-code.enum"
import { AUTH_PATH, MAIN_PATH } from "../../constants"
import { deleteCookie } from "../../utils/cookie"
import InputBox from "../../components/InputBox"

// ─── 섹션 래퍼 ─────────────────────────────────────────────────────
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-[#111118] border border-white/[0.07] rounded-2xl p-6 ${className}`}>
            {children}
        </div>
    )
}

function SectionTitle({ icon: Icon, label, color = "text-indigo-400", bg = "bg-indigo-500/15" }: {
    icon: React.ElementType; label: string; color?: string; bg?: string
}) {
    return (
        <div className="flex items-center gap-2.5 mb-5">
            <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon size={14} className={color} />
            </div>
            <h2 className="text-sm font-semibold text-slate-200">{label}</h2>
        </div>
    )
}

// ─── 메인 ──────────────────────────────────────────────────────────
export default function MyPage() {
    const [cookies] = useCookies(["accessToken"])
    const accessToken: string = cookies.accessToken
    const navigate = useNavigate()

    // 내 정보
    const [member, setMember] = useState<GetMemberResponseDto | null>(null)

    // 프로필 편집 상태
    const [editingProfile, setEditingProfile] = useState(false)
    const [editName, setEditName] = useState("")
    const [editPhone, setEditPhone] = useState("")

    // 비밀번호 변경
    const [currentPw, setCurrentPw] = useState("")
    const [newPw, setNewPw] = useState("")
    const [newPwCheck, setNewPwCheck] = useState("")

    // 탈퇴 확인
    const [showWithdraw, setShowWithdraw] = useState(false)
    const [withdrawPw, setWithdrawPw] = useState("")

    // 통계
    const [todoTotal, setTodoTotal] = useState(0)
    const [todoCompleted, setTodoCompleted] = useState(0)
    const [scheduleTotal, setScheduleTotal] = useState(0)

    useEffect(() => {
        if (!accessToken) { navigate(AUTH_PATH); return }
        loadMe()
        loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const loadMe = () => {
        getMeRequest(accessToken).then((res) => {
            if (!res || res.code !== ResponseCode.SUCCESS) return
            setMember(res as GetMemberResponseDto)
        })
    }

    const loadStats = () => {
        getTodoRequest(accessToken).then((res: GetTodoResponseDto | ResponseDto) => {
            if (!res || res.code !== ResponseCode.SUCCESS) return
            const { todoListItems } = res as GetTodoResponseDto
            setTodoTotal(todoListItems.length)
            setTodoCompleted(todoListItems.filter(t => t.state).length)
        })
        getScheduleRequest(accessToken).then((res: GetScheduleResponseDto | ResponseDto) => {
            if (!res || res.code !== ResponseCode.SUCCESS) return
            const { scheduleListItems } = res as GetScheduleResponseDto
            setScheduleTotal(scheduleListItems.length)
        })
    }

    // ── 프로필 수정 ──────────────────────────────────────────────
    const onEditStart = () => {
        if (!member) return
        setEditName(member.name)
        setEditPhone(member.phone)
        setEditingProfile(true)
    }

    const onEditCancel = () => setEditingProfile(false)

    const onEditSave = () => {
        if (!editName.trim()) { alert("이름을 입력해주세요."); return }
        if (!/^[0-9]{11,13}$/.test(editPhone)) { alert("올바른 전화번호 형식이 아닙니다."); return }
        updateMeRequest({ name: editName, phone: editPhone }, accessToken).then((res) => {
            if (!res) { alert("네트워크 이상입니다."); return }
            if (res.code === ResponseCode.DUPLICATE_PHONE) { alert("이미 사용 중인 전화번호입니다."); return }
            if (res.code !== ResponseCode.SUCCESS) { alert("수정에 실패했습니다."); return }
            setEditingProfile(false)
            loadMe()
        })
    }

    // ── 비밀번호 변경 ────────────────────────────────────────────
    const onChangePassword = () => {
        if (!currentPw || !newPw || !newPwCheck) { alert("모든 항목을 입력해주세요."); return }
        if (newPw !== newPwCheck) { alert("새 비밀번호가 일치하지 않습니다."); return }
        if (newPw.length < 8) { alert("새 비밀번호는 8자 이상이어야 합니다."); return }
        changePasswordRequest({ currentPassword: currentPw, newPassword: newPw }, accessToken).then((res) => {
            if (!res) { alert("네트워크 이상입니다."); return }
            if (res.code === ResponseCode.WRONG_PASSWORD) { alert("현재 비밀번호가 올바르지 않습니다."); return }
            if (res.code !== ResponseCode.SUCCESS) { alert("변경에 실패했습니다."); return }
            alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.")
            deleteCookie("accessToken")
            navigate(AUTH_PATH)
        })
    }

    // ── 회원 탈퇴 ───────────────────────────────────────────────
    const onWithdraw = () => {
        if (!withdrawPw) { alert("비밀번호를 입력해주세요."); return }
        withdrawRequest({ password: withdrawPw }, accessToken).then((res) => {
            if (!res) { alert("네트워크 이상입니다."); return }
            if (res.code === ResponseCode.WRONG_PASSWORD) { alert("비밀번호가 올바르지 않습니다."); return }
            if (res.code !== ResponseCode.SUCCESS) { alert("탈퇴 처리에 실패했습니다."); return }
            alert("탈퇴가 완료되었습니다.")
            deleteCookie("accessToken")
            navigate(MAIN_PATH)
            window.location.reload()
        })
    }

    const completionRate = todoTotal > 0 ? Math.round((todoCompleted / todoTotal) * 100) : 0
    const joinDateFormatted = member?.joinDate ? member.joinDate.slice(0, 10) : ""

    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut", delay: i * 0.07 } }),
    }

    return (
        <div className="min-h-screen bg-[#09090f] px-4 py-8 md:px-8">
            {/* 배경 glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/3 w-[500px] h-[400px] bg-indigo-600/4 blur-[120px] rounded-full" />
            </div>

            <div className="relative max-w-3xl mx-auto space-y-4">

                {/* 페이지 헤더 */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-6">
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-7 h-7 bg-indigo-500/15 rounded-lg flex items-center justify-center">
                            <User size={14} className="text-indigo-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">마이페이지</h1>
                    </div>
                    <p className="text-slate-500 text-sm pl-9.5">내 정보와 활동을 확인하세요.</p>
                </motion.div>

                {/* ── 프로필 카드 ─────────────────────────────── */}
                <motion.div custom={0} variants={itemVariants} initial="hidden" animate="visible">
                    <Section>
                        <SectionTitle icon={User} label="프로필 정보" />

                        {member && (
                            <div className="space-y-4">
                                {/* 아바타 + 이름 */}
                                <div className="flex items-center gap-4 pb-4 border-b border-white/[0.06]">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-slate-100 font-semibold text-base">{member.name}</p>
                                        <p className="text-slate-500 text-sm">{member.email}</p>
                                    </div>
                                    {!editingProfile && (
                                        <button
                                            onClick={onEditStart}
                                            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-all"
                                        >
                                            <Pencil size={12} /> 수정
                                        </button>
                                    )}
                                </div>

                                {/* 편집 폼 or 정보 표시 */}
                                {editingProfile ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wider">이름</label>
                                            <input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") onEditSave() }}
                                                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-100 text-sm focus:outline-none focus:ring-2 focus:border-indigo-500/40 focus:ring-indigo-500/10 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wider">전화번호</label>
                                            <input
                                                value={editPhone}
                                                onChange={(e) => setEditPhone(e.target.value)}
                                                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") onEditSave() }}
                                                placeholder="01012345678"
                                                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-100 text-sm focus:outline-none focus:ring-2 focus:border-indigo-500/40 focus:ring-indigo-500/10 transition-all"
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                            <button
                                                onClick={onEditSave}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
                                            >
                                                <Check size={13} /> 저장
                                            </button>
                                            <button
                                                onClick={onEditCancel}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
                                            >
                                                <X size={13} /> 취소
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { icon: Mail, label: "이메일", value: member.email },
                                            { icon: Phone, label: "전화번호", value: member.phone },
                                            { icon: Calendar, label: "가입일", value: joinDateFormatted },
                                        ].map(({ icon: Icon, label, value }) => (
                                            <div key={label} className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                                                <div className="w-7 h-7 bg-white/[0.04] rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Icon size={13} className="text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-600 uppercase tracking-wider">{label}</p>
                                                    <p className="text-sm text-slate-300 font-medium">{value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </Section>
                </motion.div>

                {/* ── 활동 통계 ────────────────────────────────── */}
                <motion.div custom={1} variants={itemVariants} initial="hidden" animate="visible">
                    <Section>
                        <SectionTitle icon={TrendingUp} label="활동 통계" color="text-emerald-400" bg="bg-emerald-500/15" />
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { icon: CheckSquare, label: "전체 할 일", value: todoTotal, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                                { icon: CheckSquare, label: "완료한 할 일", value: todoCompleted, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                                { icon: CalendarDays, label: "등록한 일정", value: scheduleTotal, color: "text-violet-400", bg: "bg-violet-500/10" },
                            ].map(({ icon: Icon, label, value, color, bg }) => (
                                <div key={label} className="flex flex-col items-center gap-2 px-3 py-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                                    <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                                        <Icon size={15} className={color} />
                                    </div>
                                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                                    <p className="text-[11px] text-slate-600 text-center">{label}</p>
                                </div>
                            ))}
                        </div>
                        {todoTotal > 0 && (
                            <div className="mt-4">
                                <div className="flex justify-between text-[11px] text-slate-600 mb-1.5">
                                    <span>할 일 완료율</span>
                                    <span className="text-emerald-400 font-medium">{completionRate}%</span>
                                </div>
                                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completionRate}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                                    />
                                </div>
                            </div>
                        )}
                    </Section>
                </motion.div>

                {/* ── 비밀번호 변경 ─────────────────────────────── */}
                <motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible">
                    <Section>
                        <SectionTitle icon={KeyRound} label="비밀번호 변경" color="text-amber-400" bg="bg-amber-500/15" />
                        <div className="space-y-1">
                            <InputBox
                                label="현재 비밀번호" type="password" placeholder="현재 비밀번호를 입력해주세요"
                                value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
                                errorMessage="비밀번호는 8자 이상이어야 합니다." onValidate={(v) => v.length >= 8}
                            />
                            <InputBox
                                label="새 비밀번호" type="password" placeholder="새 비밀번호를 입력해주세요"
                                value={newPw} onChange={(e) => setNewPw(e.target.value)}
                                errorMessage="비밀번호는 8자 이상이어야 합니다." onValidate={(v) => v.length >= 8}
                            />
                            <InputBox
                                label="새 비밀번호 확인" type="password" placeholder="새 비밀번호를 재입력해주세요"
                                value={newPwCheck} onChange={(e) => setNewPwCheck(e.target.value)}
                                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") onChangePassword() }}
                                errorMessage="비밀번호가 일치하지 않습니다." onValidate={(v) => v === newPw}
                            />
                        </div>
                        <button
                            onClick={onChangePassword}
                            className="mt-4 w-full bg-amber-500/90 hover:bg-amber-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]"
                        >
                            비밀번호 변경
                        </button>
                    </Section>
                </motion.div>

                {/* ── 계정 관리 (로그아웃 / 탈퇴) ─────────────── */}
                <motion.div custom={3} variants={itemVariants} initial="hidden" animate="visible">
                    <Section>
                        <SectionTitle icon={Shield} label="계정 관리" color="text-slate-400" bg="bg-white/[0.06]" />

                        <div className="space-y-3">
                            {/* 로그아웃 */}
                            <button
                                onClick={() => { deleteCookie("accessToken"); navigate(MAIN_PATH); window.location.reload() }}
                                className="w-full flex items-center gap-3 px-4 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.10] rounded-xl transition-all group"
                            >
                                <div className="w-8 h-8 bg-white/[0.04] rounded-lg flex items-center justify-center">
                                    <LogOut size={14} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">로그아웃</p>
                                    <p className="text-[11px] text-slate-600">현재 기기에서 로그아웃합니다</p>
                                </div>
                            </button>

                            {/* 회원 탈퇴 */}
                            <button
                                onClick={() => setShowWithdraw(!showWithdraw)}
                                className="w-full flex items-center gap-3 px-4 py-3.5 bg-red-500/[0.04] hover:bg-red-500/[0.08] border border-red-500/[0.1] hover:border-red-500/20 rounded-xl transition-all group"
                            >
                                <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                                    <Trash2 size={14} className="text-red-500/60 group-hover:text-red-400 transition-colors" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-red-500/70 group-hover:text-red-400 transition-colors">회원 탈퇴</p>
                                    <p className="text-[11px] text-slate-700">계정과 모든 데이터가 삭제됩니다</p>
                                </div>
                            </button>

                            {/* 탈퇴 확인 폼 */}
                            {showWithdraw && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-red-500/[0.04] border border-red-500/20 rounded-xl space-y-3"
                                >
                                    <p className="text-xs text-red-400 font-medium">탈퇴 시 모든 할 일·일정 데이터가 영구 삭제됩니다.</p>
                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wider">비밀번호 확인</label>
                                        <input
                                            type="password"
                                            value={withdrawPw}
                                            onChange={(e) => setWithdrawPw(e.target.value)}
                                            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") onWithdraw() }}
                                            placeholder="비밀번호를 입력해주세요"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-red-500/20 text-slate-100 placeholder-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={onWithdraw}
                                            className="flex-1 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-all"
                                        >
                                            탈퇴 확인
                                        </button>
                                        <button
                                            onClick={() => { setShowWithdraw(false); setWithdrawPw("") }}
                                            className="flex-1 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-300 bg-white/[0.04] hover:bg-white/[0.07] transition-all"
                                        >
                                            취소
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </Section>
                </motion.div>

            </div>
        </div>
    )
}
