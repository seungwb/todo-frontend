"use client"

import { useEffect, useRef, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import type { EventInput } from "@fullcalendar/core"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import type { DateClickArg } from "@fullcalendar/interaction"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarDays, ChevronDown, Plus } from "lucide-react"
import { DayPicker } from "react-day-picker"
import type { DateRange } from "react-day-picker"
import "react-day-picker/style.css"
import { addDays, subDays, startOfDay, format } from "date-fns"
import { ko } from "date-fns/locale"
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

const formatRange = (range: DateRange) => {
    const fmt = (d: Date) => format(d, "M.d")
    if (!range.from) return "날짜 선택"
    if (!range.to || range.from.getTime() === range.to.getTime()) return fmt(range.from)
    return `${fmt(range.from)} – ${fmt(range.to)}`
}

export default function Schedule() {
    const [events, setEvents] = useState<EventInput[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState("")
    const [filterType, setFilterType] = useState<FilterKey>("today")
    const [cookies] = useCookies()

    const today = startOfDay(new Date())
    const [dateRange, setDateRange] = useState<DateRange>({ from: today, to: addDays(today, 7) })
    const [pickerOpen, setPickerOpen] = useState(false)
    const pickerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (!pickerOpen) return
        const handleClickOutside = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setPickerOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [pickerOpen])

    const handleFilterChange = (key: FilterKey) => {
        const t = startOfDay(new Date())
        if (key === "future") setDateRange({ from: t, to: addDays(t, 7) })
        if (key === "past") setDateRange({ from: subDays(t, 7), to: t })
        setFilterType(key)
        setPickerOpen(false)
    }

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

        const { scheduleListItems } = responseBody as GetScheduleResponseDto
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
        const eventStart = startOfDay(new Date(event.start as Date))
        const eventEnd = startOfDay(new Date(event.end as Date))
        const t = startOfDay(new Date())

        if (filterType === "today") {
            return eventStart <= t && eventEnd >= t
        }

        const from = dateRange.from ? startOfDay(dateRange.from) : null
        const to = dateRange.to ? startOfDay(dateRange.to) : null
        if (!from) return true
        const rangeEnd = to ?? from
        return eventStart <= rangeEnd && eventEnd >= from
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

                {/* 필터 + 날짜 범위 + 카운트 */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* 필터 탭 */}
                        <div className="flex gap-1 bg-[#111118] border border-white/[0.07] rounded-xl p-1">
                            {FILTERS.map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => handleFilterChange(key)}
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

                        {/* 날짜 범위 picker (오늘 탭 제외) */}
                        {filterType !== "today" && (
                            <div className="relative" ref={pickerRef}>
                                <button
                                    onClick={() => setPickerOpen(!pickerOpen)}
                                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#111118] border border-white/[0.07] hover:border-white/[0.14] rounded-xl text-sm text-slate-300 transition-all duration-200"
                                >
                                    <CalendarDays size={13} className="text-slate-500" />
                                    {formatRange(dateRange)}
                                    <ChevronDown
                                        size={13}
                                        className={`text-slate-500 transition-transform duration-200 ${pickerOpen ? "rotate-180" : ""}`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {pickerOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 6, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 4, scale: 0.97 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute top-full mt-2 left-0 z-50 bg-[#111118] border border-white/[0.07] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] p-4"
                                        >
                                            <DayPicker
                                                mode="range"
                                                selected={dateRange}
                                                onSelect={(r) => { if (r) setDateRange(r) }}
                                                locale={ko}
                                                classNames={{ root: "rdp-dark" }}
                                            />
                                            <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-white/[0.06]">
                                                <button
                                                    onClick={() => {
                                                        const t = startOfDay(new Date())
                                                        setDateRange(
                                                            filterType === "future"
                                                                ? { from: t, to: addDays(t, 7) }
                                                                : { from: subDays(t, 7), to: t }
                                                        )
                                                    }}
                                                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                                                >
                                                    초기화
                                                </button>
                                                <button
                                                    onClick={() => setPickerOpen(false)}
                                                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-all"
                                                >
                                                    적용
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
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
