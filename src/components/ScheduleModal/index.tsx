"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CalendarDays } from "lucide-react"
import { postScheduleRequest, updateScheduleRequest } from "../../apis"
import type { PostScheduleRequestDto, UpdateScheduleRequestDto } from "../../apis/request/schedule"
import { useCookies } from "react-cookie"
import type { PostScheduleResponseDto, UpdateScheduleResponseDto } from "../../apis/response/schedule"
import type { ResponseDto } from "../../apis/response"
import ResponseCode from "../../types/enum/response-code.enum"

interface ScheduleModalProps {
    isOpen: boolean
    onClose: () => void
    selectedDate?: string
    onSave: () => void
    initialData?: {
        id: number
        title: string
        content: string
        location: string
        startDate: string
        endDate: string
    }
}

const inputClass =
    "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-700 focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all duration-200 text-sm"

const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, onSave, selectedDate, initialData }) => {
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        location: "",
        startDate: "",
        endDate: "",
    })

    const [cookies] = useCookies()

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                content: initialData.content || "",
                location: initialData.location || "",
                startDate: initialData.startDate,
                endDate: initialData.endDate,
            })
        } else if (selectedDate) {
            setFormData(() => ({
                title: "",
                content: "",
                location: "",
                startDate: selectedDate,
                endDate: selectedDate,
            }))
        }
    }, [initialData, selectedDate])

    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const scheduleResponse = (responseBody: PostScheduleResponseDto | UpdateScheduleResponseDto | ResponseDto | null) => {
        if (!responseBody) { alert("네트워크 이상입니다."); return }
        const { code } = responseBody
        if (code === ResponseCode.DATABASE_ERROR) alert("데이터베이스 오류입니다.")
        if (code === ResponseCode.VALIDATION_FAILED || code === ResponseCode.NOT_EXISTED_USER) alert("로그인이 필요한 기능입니다.")
        if (code === ResponseCode.NOT_EXISTED_SCHEDULE) alert("존재하지 않는 게시물 입니다.")
        if (code !== ResponseCode.SUCCESS) return

        alert(initialData ? "일정이 수정되었습니다!" : "일정이 추가되었습니다!")
        onSave()
        onClose()
    }

    const onSubmitHandler = () => {
        const accessToken = cookies.accessToken
        if (!accessToken) { alert("로그인이 필요한 기능입니다."); onClose(); return }

        const requestBody: PostScheduleRequestDto | UpdateScheduleRequestDto = {
            title: formData.title,
            content: formData.content,
            location: formData.location,
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate),
        }

        if (initialData) {
            updateScheduleRequest(initialData.id, requestBody as UpdateScheduleRequestDto, accessToken).then(scheduleResponse)
        } else {
            postScheduleRequest(requestBody as PostScheduleRequestDto, accessToken).then(scheduleResponse)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0"
                    onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
                >
                    <motion.div
                        initial={{ scale: 0.96, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.96, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        className="bg-[#111118] border border-white/[0.09] rounded-2xl w-full max-w-md shadow-[0_8px_40px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden"
                    >
                        {/* 상단 컬러 바 */}
                        <div className="h-px bg-gradient-to-r from-violet-500/60 via-indigo-500/60 to-transparent" />

                        <div className="p-5">
                            {/* 헤더 */}
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 bg-violet-500/15 rounded-lg flex items-center justify-center">
                                        <CalendarDays size={14} className="text-violet-400" />
                                    </div>
                                    <h2 className="text-sm font-semibold text-slate-100">
                                        {initialData ? "일정 수정" : "새 일정 추가"}
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
                                >
                                    <X size={15} />
                                </button>
                            </div>

                            {/* 폼 */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wider">제목</label>
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="일정 제목을 입력하세요"
                                        className={inputClass}
                                        value={formData.title}
                                        onChange={onChangeHandler}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wider">내용 <span className="text-slate-700 normal-case">(선택)</span></label>
                                    <textarea
                                        name="content"
                                        placeholder="일정 내용을 입력하세요"
                                        className={`${inputClass} h-24 resize-none`}
                                        value={formData.content}
                                        onChange={onChangeHandler}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wider">장소 <span className="text-slate-700 normal-case">(선택)</span></label>
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="장소를 입력하세요"
                                        className={inputClass}
                                        value={formData.location}
                                        onChange={onChangeHandler}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wider">시작</label>
                                        <input
                                            type="datetime-local"
                                            name="startDate"
                                            className={inputClass}
                                            value={formData.startDate}
                                            onChange={onChangeHandler}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wider">종료</label>
                                        <input
                                            type="datetime-local"
                                            name="endDate"
                                            className={inputClass}
                                            value={formData.endDate}
                                            onChange={onChangeHandler}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 버튼 */}
                            <div className="flex gap-2 mt-5">
                                <button
                                    onClick={onClose}
                                    className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/[0.07] rounded-xl px-4 py-2.5 font-medium transition-all duration-200 text-sm"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={onSubmitHandler}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2.5 font-medium transition-all duration-200 text-sm shadow-[0_0_16px_rgba(99,102,241,0.25)]"
                                >
                                    {initialData ? "수정하기" : "추가하기"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default ScheduleModal
