"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar } from "lucide-react"
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
    "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-sm"

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
        if (!responseBody) {
            alert("네트워크 이상입니다.")
            return
        }
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
        if (!accessToken) {
            alert("로그인이 필요한 기능입니다.")
            onClose()
            return
        }

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
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
                    onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 16 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 16 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="bg-[#13131a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-[0_8px_48px_rgba(0,0,0,0.6)]"
                    >
                        {/* 헤더 */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-indigo-400" />
                                <h2 className="text-lg font-semibold text-slate-100">
                                    {initialData ? "일정 수정" : "새 일정 추가"}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* 폼 */}
                        <div className="space-y-3">
                            <input
                                type="text"
                                name="title"
                                placeholder="제목"
                                className={inputClass}
                                value={formData.title}
                                onChange={onChangeHandler}
                            />
                            <textarea
                                name="content"
                                placeholder="내용"
                                className={`${inputClass} h-28 resize-none`}
                                value={formData.content}
                                onChange={onChangeHandler}
                            />
                            <input
                                type="text"
                                name="location"
                                placeholder="장소"
                                className={inputClass}
                                value={formData.location}
                                onChange={onChangeHandler}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1.5 ml-1">시작일시</label>
                                    <input
                                        type="datetime-local"
                                        name="startDate"
                                        className={inputClass}
                                        value={formData.startDate}
                                        onChange={onChangeHandler}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1.5 ml-1">종료일시</label>
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
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={onClose}
                                className="flex-1 bg-white/[0.06] hover:bg-white/[0.10] text-slate-300 rounded-xl px-4 py-2.5 font-medium transition-all text-sm"
                            >
                                취소
                            </button>
                            <button
                                onClick={onSubmitHandler}
                                className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl px-4 py-2.5 font-medium transition-all text-sm"
                            >
                                {initialData ? "수정" : "추가"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default ScheduleModal
