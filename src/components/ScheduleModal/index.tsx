"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { postScheduleRequest, updateScheduleRequest } from "../../apis"
import type { PostScheduleRequestDto, UpdateScheduleRequestDto } from "../../apis/request/schedule"
import { useCookies } from "react-cookie"
import type { PostScheduleResponseDto, UpdateScheduleResponseDto } from "../../apis/response/schedule"
import type { ResponseDto } from "../../apis/response"

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
            setFormData((prevFormData) => ({
                ...prevFormData,
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
        if (code === "DBE") alert("데이터베이스 오류입니다.")
        if (code === "VF" || code === "NU") alert("로그인이 필요한 기능입니다.")
        if (code === "NS") alert("존재하지 않는 게시물 입니다.")
        if (code !== "SU") return

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
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">{initialData ? "일정 수정" : "일정 추가"}</h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <input
                            type="text"
                            name="title"
                            placeholder="제목"
                            className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.title}
                            onChange={onChangeHandler}
                        />
                        <textarea
                            name="content"
                            placeholder="내용"
                            className="w-full p-2 border rounded mb-4 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.content}
                            onChange={onChangeHandler}
                        />
                        <input
                            type="text"
                            name="location"
                            placeholder="장소"
                            className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.location}
                            onChange={onChangeHandler}
                        />
                        <input
                            type="datetime-local"
                            name="startDate"
                            className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.startDate}
                            onChange={onChangeHandler}
                        />
                        <input
                            type="datetime-local"
                            name="endDate"
                            className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.endDate}
                            onChange={onChangeHandler}
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={onSubmitHandler}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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

