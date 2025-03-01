"use client"

import { useState, useEffect } from "react"
import {getTodayScheduleRequest, getTodoRequest, getWeatherRequest, getWeeklyScheduleRequest} from "../apis"
import type { ScheduleListItems } from "../types/interface"
import { useCookies } from "react-cookie"
import type {GetTodayScheduleIndexResponseDto, GetWeeklyScheduleIndexResponseDto, ResponseDto} from "../apis/response"
import { motion } from "framer-motion"
import { Sun, Calendar, CheckSquare, AlertTriangle } from "lucide-react"
import type {GetTodoResponseDto} from "../apis/response/todo";

export default function IndexPage() {
    const [cookies] = useCookies()
    const [weather, setWeather] = useState(null)
    const [todaySchedules, setTodaySchedules] = useState<ScheduleListItems[]>([])
    const [thisWeekSchedules, setThisWeekSchedules] = useState<ScheduleListItems[]>([])
    const [todos, setTodos] = useState([])

    useEffect(() => {
        fetchWeatherEvents().then()
        fetchTodayEvents().then()
        fetchWeeklyEvents().then()
        fetchTodoEvents().then()
    }, [])

    const getTodayDate = (): string => {
        const today = new Date()
        return today.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    }

    const getThisWeekRange = (): { start: string; end: string } => {
        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay() + 1)
        const endOfWeek = new Date(today)
        endOfWeek.setDate(today.getDate() - today.getDay() + 7)

        return {
            start: startOfWeek.toISOString().split("T")[0], // YYYY-MM-DD
            end: endOfWeek.toISOString().split("T")[0], // YYYY-MM-DD
        }
    }

    const fetchWeatherEvents = async () => {
        const responseBody = await getWeatherRequest()
        setWeather(responseBody)
    }

    const getTodayScheduleResponse = (responseBody: GetTodayScheduleIndexResponseDto | ResponseDto | null) => {
        if (!responseBody) {
            alert("네트워크 이상입니다.")
            return
        }
        const { code } = responseBody
        if (code !== "SU") return
        return responseBody
    }

    const fetchTodayEvents = async () => {
        const accessToken = cookies.accessToken
        if (!accessToken) return
        const today = new Date().toISOString().split("T")[0]
        const responseBody = await getTodayScheduleRequest(today, accessToken).then(getTodayScheduleResponse)
        if (responseBody && "todayScheduleListItems" in responseBody) {
            const scheduleList: ScheduleListItems[] = responseBody.todayScheduleListItems.map((e: any) => ({
                ...e,
                startDate: new Date(e.startDate).toLocaleDateString("ko-KR"),
                endDate: new Date(e.endDate).toLocaleDateString("ko-KR"),
                regDate: new Date(e.regDate).toLocaleDateString("ko-KR"),
            }))
            setTodaySchedules(scheduleList)
        }
    }

    const getWeeklyScheduleResponse = (responseBody: GetWeeklyScheduleIndexResponseDto | ResponseDto | null) => {
        if (!responseBody) {
            alert("네트워크 이상입니다.")
            return
        }
        const { code } = responseBody
        if (code !== "SU") return
        return responseBody
    }

    const fetchWeeklyEvents = async () => {
        const accessToken = cookies.accessToken
        if (!accessToken) return
        const { start, end } = getThisWeekRange()
        const responseBody = await getWeeklyScheduleRequest(start, end, accessToken).then(getWeeklyScheduleResponse)
        if (responseBody && "weeklyScheduleListItems" in responseBody) {
            const scheduleList: ScheduleListItems[] = responseBody.weeklyScheduleListItems.map((e: any) => ({
                ...e,
                startDate: new Date(e.startDate).toLocaleDateString("ko-KR"),
                endDate: new Date(e.endDate).toLocaleDateString("ko-KR"),
                regDate: new Date(e.regDate).toLocaleDateString("ko-KR"),
            }))
            setThisWeekSchedules(scheduleList)
        }
    }

    const getTodoResponse = (responseBody: GetTodoResponseDto | ResponseDto | null) => {
        if (!responseBody) {
            alert("네트워크 이상입니다.")
            return
        }
        const { code } = responseBody
        if (code !== "SU") return
        return responseBody
    }

    const fetchTodoEvents = async () => {
        const accessToken = cookies.accessToken
        const responseBody = await getTodoRequest(accessToken).then(getTodoResponse)

        if (!responseBody) {
            return
        }

        const { todoListItems } = responseBody
        setTodos(todoListItems)
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    }


    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">대시보드</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.section
                    className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-2xl shadow-lg text-white"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 }}
                >
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                        <Sun className="mr-2" /> 오늘의 날씨
                    </h2>
                    {weather ? (
                        <div>
                            <p className="text-2xl font-bold">{weather.main.temp}°C</p>
                            <p className="text-lg">{weather.weather[0].description}</p>
                            <p className="text-sm mt-2">{weather.name}</p>
                        </div>
                    ) : (
                        <p className="text-lg">날씨 정보를 불러오는 중...</p>
                    )}
                </motion.section>

                <motion.section
                    className="bg-white p-6 rounded-2xl shadow-lg"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                        <Calendar className="mr-2" /> 오늘의 일정 ({getTodayDate()})
                    </h2>
                    {todaySchedules.length > 0 ? (
                        <ul className="space-y-3">
                            {todaySchedules.map((schedule, index) => (
                                <li key={index} className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-medium text-gray-800">{schedule.title}</p>
                                    <p className="text-sm text-gray-600">
                                        {schedule.startDate} - {schedule.endDate}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">오늘 예정된 일정이 없습니다.</p>
                    )}
                </motion.section>

                <motion.section
                    className="bg-white p-6 rounded-2xl shadow-lg"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                        <CheckSquare className="mr-2" /> 할 일 목록
                    </h2>
                    {todos.length > 0 ? (
                    <ul className="space-y-2">
                        {todos.map((todo, index) => (
                            <li key={index} className="flex items-center">
                                <input
                                    type="checkbox"
                                    readOnly={true}
                                    checked={todo.state}
                                    className="mr-2 form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                                />
                                <span className={`${todo.state ?  "text-gray-800" : "line-through text-gray-400"}`}>{todo.title}</span>
                            </li>
                        ))}
                    </ul>
                        ): (
                        <p className="text-gray-500">오늘 예정된 할일이 없습니다.</p>
                    )}
                </motion.section>

                <motion.section
                    className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white md:col-span-2 lg:col-span-3"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-xl font-semibold flex items-center mb-4 text-shadow">
                        <AlertTriangle className="mr-2" /> 이번 주 일정 ({getThisWeekRange().start} - {getThisWeekRange().end})
                    </h2>
                    <p className="text-lg mb-4 text-shadow">📅 이번 주 총 {thisWeekSchedules.length}개의 일정이 있습니다.</p>
                    {thisWeekSchedules.length > 0 ? (
                        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {thisWeekSchedules.map((schedule, index) => (
                                <li key={index} className="bg-indigo-100 bg-opacity-20 p-3 rounded-lg text-shadow">
                                    <p className="font-medium text-indigo-700">{schedule.title}</p>
                                    <p className="text-sm text-indigo-500">
                                        {schedule.startDate} - {schedule.endDate}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-shadow">이번 주 예정된 일정이 없습니다.</p>
                    )}
                </motion.section>
            </div>
        </div>
    )
}
