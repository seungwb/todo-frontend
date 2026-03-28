"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Edit2, Trash2, MapPin, Calendar } from "lucide-react"
import type { ResponseDto } from "../../apis/response"
import { deleteScheduleRequest } from "../../apis"
import { useCookies } from "react-cookie"
import type { DeleteScheduleResponseDto } from "../../apis/response/schedule"
import ScheduleModal from "../ScheduleModal"
import type { EventInput } from "@fullcalendar/core"
import ResponseCode from "../../types/enum/response-code.enum"

interface ScheduleListItemProps {
    event: EventInput
    onSave: () => void
}

export default function ScheduleListItem({ event, onSave }: ScheduleListItemProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [updateData, setUpdateData] = useState({ id: 0, title: "", content: "", location: "", startDate: "", endDate: "" })
    const [cookies] = useCookies()

    const deleteScheduleResponse = (responseBody: DeleteScheduleResponseDto | ResponseDto | null) => {
        if (!responseBody) { alert("네트워크 이상입니다."); return }
        const { code } = responseBody
        if (code === ResponseCode.DATABASE_ERROR) alert("데이터베이스 오류입니다.")
        if (code === ResponseCode.VALIDATION_FAILED || code === ResponseCode.NOT_EXISTED_USER) alert("로그인이 필요한 기능입니다.")
        if (code === ResponseCode.NOT_EXISTED_SCHEDULE) alert("이미 삭제 된 일정입니다.")
        if (code !== ResponseCode.SUCCESS) return

        alert("일정이 삭제 되었습니다.")
        onSave()
    }

    const onDeleteButtonHandler = () => {
        if (window.confirm("정말로 이 일정을 삭제하시겠습니까?")) {
            const extProps = event.extendedProps as Record<string, unknown>
            const id = extProps.id as number
            const accessToken = cookies.accessToken
            deleteScheduleRequest(id, accessToken).then(deleteScheduleResponse)
        }
    }

    const onUpdateButtonHandler = (event: EventInput) => {
        const extProps = event.extendedProps as Record<string, unknown>
        setUpdateData({
            id: extProps.id as number,
            title: event.title as string,
            content: extProps.content as string,
            location: extProps.location as string,
            startDate: new Date(event.start as Date).toISOString().slice(0, 16),
            endDate: new Date(event.end as Date).toISOString().slice(0, 16),
        })
        setIsModalOpen(true)
    }

    const extProps = event.extendedProps as Record<string, unknown>

    const startDate = new Date(event.start as Date)
    const endDate = new Date(event.end as Date)
    const isSameDay = startDate.toDateString() === endDate.toDateString()

    return (
        <>
            <motion.div
                className="group bg-[#111118] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.13] hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-200"
                whileHover={{ y: -1 }}
                transition={{ duration: 0.15 }}
            >
                {/* 상단 컬러 바 */}
                <div className="h-px bg-gradient-to-r from-indigo-500/50 via-violet-500/30 to-transparent" />

                <div className="p-4">
                    {/* 제목 + 액션 버튼 */}
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="text-slate-100 font-semibold text-sm leading-snug flex-1 pr-2 group-hover:text-white transition-colors">
                            {event.title}
                        </h3>
                        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                                onClick={() => onUpdateButtonHandler(event)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                                aria-label="일정 수정"
                            >
                                <Edit2 size={13} />
                            </button>
                            <button
                                onClick={onDeleteButtonHandler}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                aria-label="일정 삭제"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    </div>

                    {/* 날짜 */}
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar size={12} className="flex-shrink-0 text-slate-600" />
                        <span className="text-slate-500 text-xs">
                            {isSameDay
                                ? startDate.toLocaleDateString("ko-KR")
                                : `${startDate.toLocaleDateString("ko-KR")} — ${endDate.toLocaleDateString("ko-KR")}`
                            }
                        </span>
                    </div>

                    {/* 장소 */}
                    {extProps?.location && (
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin size={12} className="flex-shrink-0 text-slate-600" />
                            <span className="text-slate-500 text-xs truncate">{extProps.location as string}</span>
                        </div>
                    )}

                    {/* 내용 */}
                    {extProps?.content && (
                        <p className="text-slate-600 text-xs mt-2.5 leading-relaxed line-clamp-2">
                            {extProps.content as string}
                        </p>
                    )}

                    {/* 하단 메타 */}
                    <div className="mt-3.5 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                        <span className="text-[11px] text-slate-700 font-medium">{extProps.name as string}</span>
                        <span className="text-[11px] text-slate-700">
                            {new Date(extProps.regDate as Date).toLocaleDateString("ko-KR")}
                        </span>
                    </div>
                </div>
            </motion.div>
            <ScheduleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={updateData} onSave={onSave} />
        </>
    )
}
