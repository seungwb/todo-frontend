"use client"

import { useState, useEffect } from "react"
import { getTodayScheduleRequest, getTodoRequest, getWeatherRequest, getWeeklyScheduleRequest } from "../apis"
import type { ScheduleListItems, TodoListItems } from "../types/interface"
import { useCookies } from "react-cookie"
import type { GetTodayScheduleIndexResponseDto, GetWeeklyScheduleIndexResponseDto, ResponseDto } from "../apis/response"
import { motion } from "framer-motion"
import { Sun, Cloud, Droplets, Calendar, CheckSquare, CalendarDays, TrendingUp, ArrowRight } from "lucide-react"
import type { GetTodoResponseDto } from "../apis/response/todo"
import ResponseCode from "../types/enum/response-code.enum"
import { Link } from "react-router-dom"
import { CALENDAR_PATH, TODO_PATH } from "../constants"

interface WeatherData {
    name: string;
    main: { temp: number; humidity: number };
    weather: { description: string; icon: string }[];
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

    const getGreeting = (): string => {
        const hour = new Date().getHours()
        if (hour < 6) return "좋은 새벽이에요"
        if (hour < 12) return "좋은 아침이에요"
        if (hour < 18) return "좋은 오후예요"
        return "좋은 저녁이에요"
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

    const completedTodos = todos.filter(t => t.state).length
    const pendingTodos = todos.filter(t => !t.state).length
    const completionRate = todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0

    const { start, end } = getThisWeekRange()

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    }

    return (
        <div className="min-h-screen bg-[#09090f]">
            {/* Ambient background glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-indigo-600/5 blur-[120px] rounded-full" />
                <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-violet-600/4 blur-[100px] rounded-full" />
            </div>

            <div className="relative max-w-5xl mx-auto px-4 py-10">

                {/* Hero greeting */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mb-10"
                >
                    <p className="text-slate-500 text-sm mb-2 tracking-wide">{getTodayDate()}</p>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">
                        <span className="text-slate-100">{getGreeting()} </span>
                        <span className="text-2xl">👋</span>
                    </h1>
                    <p className="text-slate-500 text-sm">오늘도 계획한 일들을 하나씩 완료해보세요.</p>
                </motion.div>

                {/* Stats row */}
                {todos.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="grid grid-cols-3 gap-3 mb-8"
                    >
                        {[
                            { label: "전체 할일", value: todos.length, icon: CheckSquare, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                            { label: "남은 할일", value: pendingTodos, icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10" },
                            { label: "완료율", value: `${completionRate}%`, icon: CheckSquare, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-[#111118] border border-white/[0.07] rounded-xl px-4 py-3 flex items-center gap-3">
                                <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                    <stat.icon size={15} className={stat.color} />
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-500 leading-none mb-1">{stat.label}</p>
                                    <p className={`text-base font-semibold ${stat.color} leading-none`}>{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Main grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Weather card — 1/3 */}
                    <motion.section
                        variants={itemVariants}
                        className="relative overflow-hidden bg-gradient-to-br from-indigo-500/[0.12] via-violet-500/[0.08] to-[#111118] border border-indigo-500/20 rounded-2xl p-5"
                    >
                        <div className="absolute -right-6 -top-6 w-28 h-28 bg-indigo-500/15 blur-2xl rounded-full pointer-events-none" />
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 bg-indigo-500/20 rounded-md flex items-center justify-center">
                                    <Sun size={13} className="text-indigo-400" />
                                </div>
                                <span className="text-[11px] font-medium text-indigo-400 uppercase tracking-wider">오늘의 날씨</span>
                            </div>
                            {weather ? (
                                <div>
                                    <div className="flex items-end gap-1 mb-1">
                                        <span className="text-4xl font-bold text-slate-100 tracking-tight leading-none">
                                            {Math.round(weather.main?.temp)}°
                                        </span>
                                        <span className="text-slate-400 text-base mb-0.5">C</span>
                                    </div>
                                    <p className="text-slate-300 text-sm capitalize mt-1">{weather.weather?.[0]?.description}</p>
                                    <p className="text-slate-500 text-xs mt-2">{weather.name}</p>
                                    {weather.main?.humidity && (
                                        <div className="flex items-center gap-1 mt-2 text-slate-500 text-xs">
                                            <Droplets size={11} />
                                            <span>습도 {weather.main.humidity}%</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-slate-600 py-4">
                                    <Cloud size={16} className="animate-pulse" />
                                    <span className="text-sm">불러오는 중...</span>
                                </div>
                            )}
                        </div>
                    </motion.section>

                    {/* Today's schedule — 2/3 */}
                    <motion.section
                        variants={itemVariants}
                        className="md:col-span-2 bg-[#111118] border border-white/[0.07] rounded-2xl p-5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-violet-500/15 rounded-md flex items-center justify-center">
                                    <Calendar size={13} className="text-violet-400" />
                                </div>
                                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">오늘의 일정</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {todaySchedules.length > 0 && (
                                    <span className="bg-violet-500/12 text-violet-400 border border-violet-500/20 rounded-full px-2.5 py-0.5 text-[11px] font-medium">
                                        {todaySchedules.length}건
                                    </span>
                                )}
                                <Link to={CALENDAR_PATH} className="text-slate-600 hover:text-slate-400 transition-colors">
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                        {todaySchedules.length > 0 ? (
                            <ul className="space-y-2">
                                {todaySchedules.map((schedule) => (
                                    <li key={schedule.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.10] rounded-xl px-4 py-3 transition-colors group">
                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-slate-100 text-sm font-medium truncate group-hover:text-white transition-colors">{schedule.title}</p>
                                            <p className="text-slate-600 text-xs mt-0.5">
                                                {new Date(schedule.startDate).toLocaleDateString("ko-KR")} — {new Date(schedule.endDate).toLocaleDateString("ko-KR")}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 gap-2">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-1">
                                    <Calendar size={18} className="text-slate-700" />
                                </div>
                                <p className="text-slate-600 text-sm">오늘 예정된 일정이 없어요</p>
                            </div>
                        )}
                    </motion.section>

                    {/* Todo quick view — 2/3 */}
                    <motion.section
                        variants={itemVariants}
                        className="md:col-span-2 bg-[#111118] border border-white/[0.07] rounded-2xl p-5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-indigo-500/15 rounded-md flex items-center justify-center">
                                    <CheckSquare size={13} className="text-indigo-400" />
                                </div>
                                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">할 일 목록</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {pendingTodos > 0 && (
                                    <span className="bg-indigo-500/12 text-indigo-400 border border-indigo-500/20 rounded-full px-2.5 py-0.5 text-[11px] font-medium">
                                        {pendingTodos}개 남음
                                    </span>
                                )}
                                <Link to={TODO_PATH} className="text-slate-600 hover:text-slate-400 transition-colors">
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>

                        {/* Progress bar */}
                        {todos.length > 0 && (
                            <div className="mb-4">
                                <div className="flex justify-between text-[11px] text-slate-600 mb-1.5">
                                    <span>진행률</span>
                                    <span>{completionRate}%</span>
                                </div>
                                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completionRate}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                                    />
                                </div>
                            </div>
                        )}

                        {todos.length > 0 ? (
                            <ul className="space-y-1.5">
                                {todos.slice(0, 5).map((todo) => (
                                    <li key={todo.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.03] transition-colors group">
                                        <div className={`flex-shrink-0 w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                            todo.state
                                                ? "bg-gradient-to-br from-indigo-500 to-violet-600 border-transparent"
                                                : "border-white/[0.15]"
                                        }`}>
                                            {todo.state && (
                                                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                    <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            )}
                                        </div>
                                        <span className={`text-sm flex-1 truncate transition-colors ${
                                            todo.state
                                                ? "line-through text-slate-600"
                                                : "text-slate-300 group-hover:text-slate-100"
                                        }`}>
                                            {todo.title}
                                        </span>
                                    </li>
                                ))}
                                {todos.length > 5 && (
                                    <li className="px-3 py-1.5">
                                        <Link to={TODO_PATH} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                            +{todos.length - 5}개 더 보기
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 gap-2">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-1">
                                    <CheckSquare size={18} className="text-slate-700" />
                                </div>
                                <p className="text-slate-600 text-sm">등록된 할일이 없어요</p>
                            </div>
                        )}
                    </motion.section>

                    {/* This week — 1/3 */}
                    <motion.section
                        variants={itemVariants}
                        className="bg-[#111118] border border-white/[0.07] rounded-2xl p-5"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-emerald-500/15 rounded-md flex items-center justify-center">
                                    <CalendarDays size={13} className="text-emerald-400" />
                                </div>
                                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">이번 주</span>
                            </div>
                            {thisWeekSchedules.length > 0 && (
                                <span className="bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5 text-[11px] font-medium">
                                    {thisWeekSchedules.length}건
                                </span>
                            )}
                        </div>
                        <p className="text-slate-700 text-[11px] mb-4">{start} — {end}</p>
                        {thisWeekSchedules.length > 0 ? (
                            <ul className="space-y-2">
                                {thisWeekSchedules.slice(0, 4).map((schedule) => (
                                    <li key={schedule.id} className="flex items-start gap-2.5">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                                        <div className="min-w-0">
                                            <p className="text-slate-200 text-xs font-medium truncate">{schedule.title}</p>
                                            <p className="text-slate-600 text-[11px] mt-0.5">
                                                {new Date(schedule.startDate).toLocaleDateString("ko-KR")}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                                {thisWeekSchedules.length > 4 && (
                                    <p className="text-xs text-slate-600 pl-3.5">+{thisWeekSchedules.length - 4}개 더</p>
                                )}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 gap-2">
                                <CalendarDays size={20} className="text-slate-700" />
                                <p className="text-slate-700 text-xs">일정 없음</p>
                            </div>
                        )}
                    </motion.section>
                </motion.div>
            </div>
        </div>
    )
}
