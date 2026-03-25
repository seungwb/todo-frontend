"use client"

import { useEffect, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import type { EventInput } from "@fullcalendar/core"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import type { DateClickArg } from "@fullcalendar/interaction"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Plus } from "lucide-react"
import ScheduleModal from "../../components/ScheduleModal"
import ScheduleListItem from "../../components/ScheduleListItem"
import type { ScheduleListItems } from "../../types/interface"
import { getScheduleRequest } from "../../apis"
import { useCookies } from "react-cookie"
import type { GetScheduleResponseDto } from "../../apis/response/schedule"
import type { ResponseDto } from "../../apis/response"
import ResponseCode from "../../types/enum/response-code.enum"

const FILTER_LABELS: Record<string, string> = {
    past: "이전 일정",
    today: "오늘 일정",
    future: "차후 일정",
}

export default function Schedule() {
    const [events, setEvents] = useState<EventInput[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState("")
    const [filterType, setFilterType] = useState("today")
    const [cookies] = useCookies()

    useEffect(() => {
        fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleDateClick = (info: DateClickArg) => {
        const clickedDateTime = new Date(info.date)
        const now = new Date()
        clickedDateTime.setHours(now.getHours(), now.getMinutes(), 0, 0)
        const localISOTime = new Date(clickedDateTime.getTime() - clickedDateTime.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16)
        setSelectedDate(localISOTime)
        setIsModalOpen(true)
    }

    const getScheduleResponse = (responseBody: GetScheduleResponseDto | ResponseDto | null) => {
        if (!responseBody) { alert("네트워크 이상입니다."); return null }
        const { code } = responseBody
        if (code === ResponseCode.DATABASE_ERROR) alert("데이터베이스 오류입니다.")
        if (code === ResponseCode.VALIDATION_FAILED) alert("로그인이 필요한 기능입니다.")
        if (code !== ResponseCode.SUCCESS) return null
        return responseBody
    }

    const fetchEvents = async () => {
        const accessToken = cookies.accessToken
        const responseBody = await getScheduleRequest(accessToken).then(getScheduleResponse)
        if (!responseBody || !("scheduleListItems" in responseBody)) return

        const { scheduleListItems } = responseBody

        const formattedEvents: EventInput[] = scheduleListItems.map((event: ScheduleListItems) => ({
            title: event.title,
            start: new Date(event.startDate),
            end: new Date(event.endDate),
            backgroundColor: "rgba(99, 102, 241, 0.5)",
            borderColor: "rgb(99, 102, 241)",
            extendedProps: {
                id: event.id,
                name: event.name,
                location: event.location,
                content: event.content,
                regDate: new Date(event.regDate),
            },
        }))

        setEvents(formattedEvents)
    }

    const filteredEvents = events.filter((event) => {
        const startDate = new Date(event.start as Date)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(event.end as Date)
        endDate.setHours(0, 0, 0, 0)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (filterType === "past") return endDate.getTime() < today.getTime()
        if (filterType === "today") return startDate.getTime() <= today.getTime() && endDate.getTime() >= today.getTime()
        if (filterType === "future") return startDate.getTime() > today.getTime() || endDate.getTime() > today.getTime()
        return true
    })

    return (
        <div className="min-h-screen bg-[#0d0d12] px-4 py-8">
            <div className="max-w-6xl mx-auto">
            {/* 페이지 헤더 */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Calendar size={22} className="text-indigo-400" />
                    <h1 className="text-2xl font-bold text-slate-100">일정 관리</h1>
                </div>
                <button
                    onClick={() => { setSelectedDate(""); setIsModalOpen(true) }}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl px-4 py-2.5 font-medium transition-all text-sm"
                >
                    <Plus size={16} />
                    새 일정 추가
                </button>
            </div>

            {/* 캘린더 영역 */}
            <div className="bg-[#13131a] border border-white/[0.06] rounded-2xl p-4 mb-6">
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    timeZone="local"
                    events={events}
                    dateClick={handleDateClick}
                    headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,dayGridWeek,dayGridDay" }}
                    buttonText={{ today: "오늘", month: "월", week: "주", day: "일" }}
                    locale="ko"
                    height="auto"
                />
            </div>

            {/* 필터 버튼 그룹 */}
            <div className="flex items-center gap-2 mb-6">
                {Object.entries(FILTER_LABELS).map(([type, label]) => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                            filterType === type
                                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                                : "bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08]"
                        }`}
                    >
                        {label}
                    </button>
                ))}
                <span className="ml-auto text-slate-600 text-sm">{filteredEvents.length}건</span>
            </div>

            {/* 일정 목록 */}
            <AnimatePresence mode="wait">
                {filteredEvents.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center py-16 gap-3"
                    >
                        <Calendar size={36} className="text-slate-700" />
                        <p className="text-slate-600 text-base">일정이 없습니다.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {filteredEvents.map((event, index) => (
                            <motion.div
                                key={event.extendedProps?.id as number}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.07 }}
                            >
                                <ScheduleListItem event={event} onSave={fetchEvents} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchEvents}
                selectedDate={selectedDate}
            />
        </div>
    )
}
