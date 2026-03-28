"use client"

import { useEffect, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import type { EventInput } from "@fullcalendar/core"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import type { DateClickArg } from "@fullcalendar/interaction"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarDays, Plus } from "lucide-react"
import ScheduleModal from "../../components/ScheduleModal"
import ScheduleListItem from "../../components/ScheduleListItem"
import type { ScheduleListItems } from "../../types/interface"
import { getScheduleRequest } from "../../apis"
import { useCookies } from "react-cookie"
import type { GetScheduleResponseDto } from "../../apis/response/schedule"
import type { ResponseDto } from "../../apis/response"
import ResponseCode from "../../types/enum/response-code.enum"

const FILTERS = [
    { key: "today", label: "오늘" },
    { key: "future", label: "예정" },
    { key: "past", label: "지난" },
] as const

type FilterKey = typeof FILTERS[number]["key"]

export default function Schedule() {
    const [events, setEvents] = useState<EventInput[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState("")
    const [filterType, setFilterType] = useState<FilterKey>("today")
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
        <div className="min-h-screen bg-[#09090f] px-4 py-8">
            <div className="max-w-6xl mx-auto">

                {/* 페이지 헤더 */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-7 h-7 bg-violet-500/15 rounded-lg flex items-center justify-center">
                                <CalendarDays size={15} className="text-violet-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">일정 관리</h1>
                        </div>
                        <p className="text-sm text-slate-500 pl-9.5">달력을 클릭해 일정을 추가하세요</p>
                    </div>
                    <button
                        onClick={() => { setSelectedDate(""); setIsModalOpen(true) }}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2.5 font-medium transition-all text-sm shadow-[0_0_16px_rgba(99,102,241,0.25)] hover:shadow-[0_0_24px_rgba(99,102,241,0.35)]"
                    >
                        <Plus size={15} strokeWidth={2.5} />
                        새 일정
                    </button>
                </div>

                {/* 캘린더 영역 */}
                <div className="bg-[#111118] border border-white/[0.07] rounded-2xl p-5 mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
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

                {/* 필터 + 카운트 */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex gap-1 bg-[#111118] border border-white/[0.07] rounded-xl p-1">
                        {FILTERS.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setFilterType(key)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    filterType === key
                                        ? "bg-white/[0.08] text-slate-100"
                                        : "text-slate-500 hover:text-slate-300"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <span className="text-slate-600 text-sm">
                        {filteredEvents.length > 0
                            ? <span className="text-slate-400">{filteredEvents.length}</span>
                            : "0"}건
                    </span>
                </div>

                {/* 일정 목록 */}
                <AnimatePresence mode="wait">
                    {filteredEvents.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20 gap-3"
                        >
                            <div className="w-14 h-14 bg-[#111118] border border-white/[0.07] rounded-2xl flex items-center justify-center mb-1">
                                <CalendarDays size={24} className="text-slate-700" />
                            </div>
                            <p className="text-slate-500 text-sm">해당 기간에 일정이 없어요</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
                        >
                            {filteredEvents.map((event, index) => (
                                <motion.div
                                    key={event.extendedProps?.id as number}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
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
        </div>
    )
}
