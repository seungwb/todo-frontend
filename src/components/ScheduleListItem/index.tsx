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

    return (
        <>
            <motion.div
                className="bg-[#13131a] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.10] hover:bg-[#1c1c28] transition-all cursor-default"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.18 }}
            >
                {/* 상단: 제목 + 액션 버튼 */}
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-slate-100 font-semibold text-base leading-snug flex-1 pr-2">{event.title}</h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            onClick={() => onUpdateButtonHandler(event)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                            aria-label="일정 수정"
                        >
                            <Edit2 size={15} />
                        </button>
                        <button
                            onClick={onDeleteButtonHandler}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            aria-label="일정 삭제"
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                </div>

                {/* 날짜 범위 */}
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1.5">
                    <Calendar size={14} className="flex-shrink-0 text-slate-600" />
                    <span>
                        {new Date(event.start as Date).toLocaleDateString("ko-KR")} — {new Date(event.end as Date).toLocaleDateString("ko-KR")}
                    </span>
                </div>

                {/* 장소 */}
                {extProps?.location && (
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-1.5">
                        <MapPin size={14} className="flex-shrink-0 text-slate-600" />
                        <span>{extProps.location as string}</span>
                    </div>
                )}

                {/* 내용 */}
                {extProps?.content && (
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed line-clamp-2">{extProps.content as string}</p>
                )}

                {/* 작성자 / 작성일 */}
                <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs text-slate-600">{extProps.name as string}</span>
                    <span className="text-xs text-slate-600">{new Date(extProps.regDate as Date).toLocaleString("ko-KR")}</span>
                </div>
            </motion.div>
            <ScheduleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={updateData} onSave={onSave} />
        </>
    )
}
