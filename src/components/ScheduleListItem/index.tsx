"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Edit2, Trash2, MapPin, Calendar, Clock } from "lucide-react"
import type { ResponseDto } from "../../apis/response"
import { deleteScheduleRequest } from "../../apis"
import { useCookies } from "react-cookie"
import type { DeleteScheduleResponseDto } from "../../apis/response/schedule"
import ScheduleModal from "../ScheduleModal";

export default function ScheduleListItem({ event, onSave }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [updateData, setUpdateData] = useState({
        id: 0,
        title: "",
        content: "",
        location: "",
        startDate: "",
        endDate: "",
    })
    const [cookies] = useCookies()

    const deleteScheduleResponse = (responseBody: DeleteScheduleResponseDto | ResponseDto | null) => {
        if (!responseBody) {
            alert("네트워크 이상입니다.")
            return
        }
        const { code } = responseBody
        if (code === "DBE") alert("데이터베이스 오류입니다.")
        if (code === "VF" || code === "NU") alert("로그인이 필요한 기능입니다.")
        if (code === "NS") alert("이미 삭제 된 일정입니다.")
        if (code !== "SU") return

        alert("일정이 삭제 되었습니다.")
        onSave()
    }

    const onDeleteButtonHandler = () => {
        if (window.confirm("정말로 이 일정을 삭제하시겠습니까?")) {
            const id = event.extendedProps.id
            const accessToken = cookies.accessToken
            deleteScheduleRequest(id, accessToken).then(deleteScheduleResponse)
        }
    }

    const onUpdateButtonHandler = (event) => {
        setUpdateData({
            id: event.extendedProps.id,
            title: event.title,
            content: event.extendedProps.content,
            location: event.extendedProps.location,
            startDate: new Date(event.start).toISOString().slice(0, 16),
            endDate: new Date(event.end).toISOString().slice(0, 16),
        })
        setIsModalOpen(true)
    }

    return (
        <motion.div
            className="bg-white rounded-lg shadow-md overflow-hidden"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
        >
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">{event.title}</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onUpdateButtonHandler(event)}
                            }
                            className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                            aria-label="일정 수정"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button
                            onClick={onDeleteButtonHandler}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                            aria-label="일정 삭제"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                    <p className="flex items-center mb-1">
                        <Calendar className="mr-2" size={16} />
                        {new Date(event.start).toLocaleDateString()} - {new Date(event.end).toLocaleDateString()}
                    </p>
                    <p className="flex items-center">
                        <Clock className="mr-2" size={16} />
                        {new Date(event.start).toLocaleTimeString()} - {new Date(event.end).toLocaleTimeString()}
                    </p>
                </div>
                {event.extendedProps?.location && (
                    <p className="text-sm text-gray-600 mb-4 flex items-center">
                        <MapPin className="mr-2" size={16} />
                        {event.extendedProps.location}
                    </p>
                )}
                {event.extendedProps?.content && <p className="text-sm text-gray-700 mb-4">{event.extendedProps.content}</p>}
                <div className="text-xs text-gray-500 mt-4">
                    <p>작성자: {event.extendedProps.name}</p>
                    <p>작성일: {new Date(event.extendedProps.regDate).toLocaleString()}</p>
                </div>
            </div>
            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={updateData}
                onSave={onSave}
            />
        </motion.div>
    )
}

