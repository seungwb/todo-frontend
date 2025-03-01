"use client"

import { useEffect, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Filter } from "lucide-react"
import ScheduleModal from "../../components/ScheduleModal"
import ScheduleListItem from "../../components/ScheduleListItem"
import type { ScheduleListItems } from "../../types/interface"
import { getScheduleRequest } from "../../apis"
import { useCookies } from "react-cookie"
import type { GetScheduleResponseDto } from "../../apis/response/schedule"
import type { ResponseDto } from "../../apis/response"

export default function Schedule() {
    const [events, setEvents] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState("")
    const [filterType, setFilterType] = useState("today")
    const [cookies] = useCookies()

    useEffect(() => {
        fetchEvents().then()
    }, [])

    const handleDateClick = (info: any) => {
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
        if (!responseBody) {
            alert("네트워크 이상입니다.")
            return null
        }
        const { code } = responseBody
        if (code === "DBE") alert("데이터베이스 오류입니다.")
        if (code === "VF") alert("로그인이 필요한 기능입니다.")
        if (code !== "SU") return null
        return responseBody
    }

    const fetchEvents = async () => {
        const accessToken = cookies.accessToken
        const responseBody = await getScheduleRequest(accessToken).then(getScheduleResponse)
        if (!responseBody) return

        const { scheduleListItems } = responseBody as { scheduleListItems: ScheduleListItems[] }

        const formattedEvents = scheduleListItems.map((event: any) => ({
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
        const startDate = new Date(event.start)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(event.end)
        endDate.setHours(0, 0, 0, 0)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (filterType === "past") {
            return endDate.getTime() < today.getTime()
        } else if (filterType === "today") {
            return startDate.getTime() <= today.getTime() && endDate.getTime() >= today.getTime()
        } else if (filterType === "future") {
            return startDate.getTime() > today.getTime() || endDate.getTime() > today.getTime()
        }
        return true
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
                <Calendar className="mr-2" /> 일정 관리
            </h1>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    timeZone="local"
                    events={events}
                    dateClick={handleDateClick}
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,dayGridWeek,dayGridDay",
                    }}
                    buttonText={{
                        today: "오늘",
                        month: "월",
                        week: "주",
                        day: "일",
                    }}
                    locale="ko"
                    height="auto"
                />
            </div>
            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchEvents}
                selectedDate={selectedDate}
            />
            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Filter className="mr-2" /> 일정 필터
                </h2>
                <div className="flex  justify-between">
                    {["past", "today", "future"].map((type) => (
                        <button
                            key={type}
                            className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                                filterType === type ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            }`}
                            onClick={() => setFilterType(type)}
                        >
                            {type === "past" ? "이전 일정" : type === "today" ? "오늘 일정" : "차후 일정"}
                        </button>
                    ))}
                </div>
            </div>
            <AnimatePresence>
                {filteredEvents.length === 0 ? (
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-gray-500 text-center text-lg"
                    >
                        일정이 없습니다.
                    </motion.p>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {filteredEvents.map((event, index) => (
                            <motion.div
                                key={event.extendedProps.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <ScheduleListItem event={event} onSave={fetchEvents} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

