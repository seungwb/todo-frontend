"use client"

import { useState, useEffect } from "react"
import { getTodayScheduleRequest, getTodoRequest, getWeatherRequest, getWeeklyScheduleRequest } from "../apis"
import type { ScheduleListItems, TodoListItems } from "../types/interface"
import { useCookies } from "react-cookie"
import type { GetTodayScheduleIndexResponseDto, GetWeeklyScheduleIndexResponseDto, ResponseDto } from "../apis/response"
import { motion } from "framer-motion"
import { Sun, Cloud, Calendar, CheckSquare, CalendarDays } from "lucide-react"
import type { GetTodoResponseDto } from "../apis/response/todo"
import ResponseCode from "../types/enum/response-code.enum"

interface WeatherData {
    name: string;
    main: { temp: number };
    weather: { description: string }[];
}

export default function IndexPage() {
    const [cookies] = useCookies()
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [todaySchedules, setTodaySchedules] = useState<ScheduleListItems[]>([])
    const [thisWeekSchedules, setThisWeekSchedules] = useState<ScheduleListItems[]>([])
    const [todos, setTodos] = useState<TodoListItems[]>([])

    useEffect(() => {
        fetchWeatherEvents()
        fetchTodayEvents()
        fetchWeeklyEvents()
        fetchTodoEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getTodayDate = (): string => {
        const today = new Date()
        return today.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })
    }

    const getThisWeekRange = (): { start: string; end: string } => {
        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay() + 1)
        const endOfWeek = new Date(today)
        endOfWeek.setDate(today.getDate() - today.getDay() + 7)

        return {
            start: startOfWeek.toISOString().split("T")[0],
            end: endOfWeek.toISOString().split("T")[0],
        }
    }

    const fetchWeatherEvents = async () => {
        const responseBody = await getWeatherRequest()
        setWeather(responseBody)
    }

    const getTodayScheduleResponse = (responseBody: GetTodayScheduleIndexResponseDto | ResponseDto | null) => {
        if (!responseBody) { alert("네트워크 이상입니다."); return }
        const { code } = responseBody
        if (code !== ResponseCode.SUCCESS) return
        return responseBody
    }

    const fetchTodayEvents = async () => {
        const accessToken = cookies.accessToken
        if (!accessToken) return
        const today = new Date().toISOString().split("T")[0]
        const responseBody = await getTodayScheduleRequest(today, accessToken).then(getTodayScheduleResponse)
        if (responseBody && "todayScheduleListItems" in responseBody) {
            setTodaySchedules(responseBody.todayScheduleListItems)
        }
    }

    const getWeeklyScheduleResponse = (responseBody: GetWeeklyScheduleIndexResponseDto | ResponseDto | null) => {
        if (!responseBody) { alert("네트워크 이상입니다."); return }
        const { code } = responseBody
        if (code !== ResponseCode.SUCCESS) return
        return responseBody
    }

    const fetchWeeklyEvents = async () => {
        const accessToken = cookies.accessToken
        if (!accessToken) return
        const { start, end } = getThisWeekRange()
        const responseBody = await getWeeklyScheduleRequest(start, end, accessToken).then(getWeeklyScheduleResponse)
        if (responseBody && "weeklyScheduleListItems" in responseBody) {
            setThisWeekSchedules(responseBody.weeklyScheduleListItems)
        }
    }

    const getTodoResponse = (responseBody: GetTodoResponseDto | ResponseDto | null) => {
        if (!responseBody) { alert("네트워크 이상입니다."); return }
        const { code } = responseBody
        if (code !== ResponseCode.SUCCESS) return
        return responseBody
    }

    const fetchTodoEvents = async () => {
        const accessToken = cookies.accessToken
        if (!accessToken) return
        const responseBody = await getTodoRequest(accessToken).then(getTodoResponse)
        if (!responseBody || !("todoListItems" in responseBody)) return

        const { todoListItems } = responseBody as GetTodoResponseDto
        setTodos(todoListItems)
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    }

    const { start, end } = getThisWeekRange()

    return (
        <div className="min-h-screen bg-[#0d0d12] px-4 py-8">
            <div className="max-w-5xl mx-auto">
            {/* 상단 인사 섹션 */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
            >
                <p className="text-slate-500 text-sm mb-1">{getTodayDate()}</p>
                <h1 className="text-2xl font-bold text-slate-100">안녕하세요 👋</h1>
                <p className="text-slate-400 text-sm mt-1">오늘도 좋은 하루 되세요.</p>
            </motion.div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* 날씨 카드 */}
                <motion.section
                    variants={cardVariants}
                    className="bg-gradient-to-br from-indigo-500/15 to-violet-600/15 border border-indigo-500/20 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Sun size={18} className="text-indigo-400" />
                        <h2 className="text-sm font-medium text-indigo-400 uppercase tracking-wider">오늘의 날씨</h2>
                    </div>
                    {weather ? (
                        <div>
                            <div className="flex items-end gap-3 mb-2">
                                <span className="text-5xl font-bold text-slate-100">{Math.round(weather.main?.temp)}°</span>
                                <span className="text-slate-400 text-lg mb-1">C</span>
                            </div>
                            <p className="text-slate-300 text-base capitalize">{weather.weather?.[0]?.description}</p>
                            <p className="text-slate-500 text-sm mt-1">{weather.name}</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-slate-500">
                            <Cloud size={16} />
                            <span className="text-sm">날씨 정보를 불러오는 중...</span>
                        </div>
                    )}
                </motion.section>

                {/* 오늘의 일정 카드 */}
                <motion.section
                    variants={cardVariants}
                    className="bg-[#13131a] border border-white/[0.06] rounded-2xl p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar size={18} className="text-indigo-400" />
                        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">오늘의 일정</h2>
                        {todaySchedules.length > 0 && (
                            <span className="ml-auto bg-indigo-500/15 text-indigo-400 rounded-lg px-2.5 py-1 text-xs font-medium">
                                {todaySchedules.length}건
                            </span>
                        )}
                    </div>
                    {todaySchedules.length > 0 ? (
                        <ul className="space-y-2">
                            {todaySchedules.map((schedule) => (
                                <li key={schedule.id} className="bg-[#1c1c28] border border-white/[0.06] rounded-xl px-4 py-3">
                                    <p className="text-slate-100 text-sm font-medium">{schedule.title}</p>
                                    <p className="text-slate-500 text-xs mt-0.5">
                                        {new Date(schedule.startDate).toLocaleDateString("ko-KR")} — {new Date(schedule.endDate).toLocaleDateString("ko-KR")}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 gap-2">
                            <Calendar size={28} className="text-slate-700" />
                            <p className="text-slate-600 text-sm">오늘 예정된 일정이 없습니다.</p>
                        </div>
                    )}
                </motion.section>

                {/* 할일 목록 카드 */}
                <motion.section
                    variants={cardVariants}
                    className="bg-[#13131a] border border-white/[0.06] rounded-2xl p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <CheckSquare size={18} className="text-indigo-400" />
                        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">할 일 목록</h2>
                        {todos.length > 0 && (
                            <span className="ml-auto bg-indigo-500/15 text-indigo-400 rounded-lg px-2.5 py-1 text-xs font-medium">
                                {todos.filter(t => !t.state).length}개 남음
                            </span>
                        )}
                    </div>
                    {todos.length > 0 ? (
                        <ul className="space-y-2">
                            {todos.map((todo) => (
                                <li key={todo.id} className="flex items-center gap-3 bg-[#1c1c28] border border-white/[0.06] rounded-xl px-4 py-3">
                                    <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${todo.state ? "bg-indigo-500 border-indigo-500" : "border-slate-600"}`}>
                                        {todo.state && (
                                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        )}
                                    </div>
                                    <span className={`text-sm ${todo.state ? "line-through text-slate-600" : "text-slate-100"}`}>
                                        {todo.title}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 gap-2">
                            <CheckSquare size={28} className="text-slate-700" />
                            <p className="text-slate-600 text-sm">등록된 할일이 없습니다.</p>
                        </div>
                    )}
                </motion.section>

                {/* 이번 주 일정 카드 */}
                <motion.section
                    variants={cardVariants}
                    className="bg-[#13131a] border border-white/[0.06] rounded-2xl p-6 md:col-span-2"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <CalendarDays size={18} className="text-indigo-400" />
                        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">이번 주 일정</h2>
                        {thisWeekSchedules.length > 0 && (
                            <span className="ml-auto bg-indigo-500/15 text-indigo-400 rounded-lg px-2.5 py-1 text-xs font-medium">
                                총 {thisWeekSchedules.length}건
                            </span>
                        )}
                    </div>
                    <p className="text-slate-600 text-xs mb-4">{start} — {end}</p>
                    {thisWeekSchedules.length > 0 ? (
                        <ul className="space-y-2">
                            {thisWeekSchedules.map((schedule) => (
                                <li key={schedule.id} className="bg-[#1c1c28] border border-white/[0.06] rounded-xl px-4 py-3">
                                    <p className="text-slate-100 text-sm font-medium">{schedule.title}</p>
                                    <p className="text-slate-500 text-xs mt-0.5">
                                        {new Date(schedule.startDate).toLocaleDateString("ko-KR")} — {new Date(schedule.endDate).toLocaleDateString("ko-KR")}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 gap-2">
                            <CalendarDays size={28} className="text-slate-700" />
                            <p className="text-slate-600 text-sm">이번 주 예정된 일정이 없습니다.</p>
                        </div>
                    )}
                </motion.section>
            </motion.div>
            </div>
        </div>
    )
}
