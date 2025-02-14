import React, { useState, useEffect } from "react";
import {getTodayScheduleRequest, getWeatherRequest, getWeeklyScheduleRequest} from "../apis";
import {ScheduleListItems} from "../types/interface";
import {useCookies} from "react-cookie";
import {GetTodayScheduleIndexResponseDto, ResponseDto} from "../apis/response";

export default function IndexPage() {
    const [cookies, setCookie] = useCookies();
    const [weather, setWeather] = useState(null);
    const [events, setEvents] = useState([
        { title: "팀 회의", time: "10:00 AM" },
        { title: "운동하기", time: "2:30 PM" },
        { title: "프로젝트 마감", time: "7:00 PM" },
    ]);
    const [todaySchedules, setTodaySchedules] = useState<ScheduleListItems[]>([]);
    const [thisWeekSchedules, setThisWeekSchedules] = useState<ScheduleListItems[]>([]);
    const [todos, setTodos] = useState([
        { text: "문서 작성", done: false },
        { text: "발표 준비", done: false },
        { text: "코드 리뷰", done: false },
    ]);


    useEffect(() => {
        fetchWeatherEvents();
        fetchTodayEvents();
        fetchWeeklyEvents();
    }, []);

    const getTodayDate = (): string => {
        const today = new Date();
        return today.toISOString().split("T")[0]; // YYYY-MM-DD 형식으로 변환
    };

    const getThisWeekRange = (): { start: string; end: string } => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // 월요일
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() - today.getDay() + 7); // 일요일

        return {
            start: startOfWeek.toISOString().split("T")[0], // YYYY-MM-DD
            end: endOfWeek.toISOString().split("T")[0], // YYYY-MM-DD
        };
    };

    const fetchWeatherEvents = async ()=>{

        //                 fetch : 날씨 정보          //
        const responseBody = await getWeatherRequest(); // API 호출
        setWeather(responseBody);
    }
    const getTodayScheduleResponse = (responseBody: GetTodayScheduleIndexResponseDto | ResponseDto | null)=> {
        if(!responseBody){
            alert('네트워크 이상입니다.');
            return;
        }
        const { code } = responseBody;
        if (code === 'DBE') alert('데이터베이스 오류입니다.');

        if (code === 'VF' || code === 'NU')  alert('로그인이 필요한 기능입니다.');

        if (code === 'AF') alert('인증에 실패하였습니다');
        if (code!=='SU') return;
        return responseBody;
    };
    const fetchTodayEvents = async () =>{
        const accessToken = cookies.accessToken;
        if(!accessToken) return;
        //                 fetch: 오늘 일정          //
        const today = getTodayDate();
        const responseBody = await getTodayScheduleRequest(today, accessToken).then(getTodayScheduleResponse);
        const {todayScheduleListItems} = responseBody as ScheduleListItems[];

        const scheduleList: ScheduleListItems[] = todayScheduleListItems.map((e: any) => ({
            ...e,
            startDate: new Date(e.startDate).toISOString().split("T")[0], // 'YYYY-MM-DD' 변환
            endDate: new Date(e.endDate).toISOString().split("T")[0],
            regDate: new Date(e.regDate).toISOString().split("T")[0]
        }));
        setTodaySchedules(scheduleList);

    }

    const fetchWeeklyEvents = async () =>{
        const accessToken = cookies.accessToken;
        if(!accessToken) return;
        //                 fetch: 오늘 일정          //
        const {start} = getThisWeekRange()
        const {end} = getThisWeekRange()
        const responseBody = await getWeeklyScheduleRequest(start, end, accessToken)
            .then();
        const {weeklyScheduleListItems} = responseBody as ScheduleListItems[];

        const scheduleList: ScheduleListItems[] = weeklyScheduleListItems.map((e: any) => ({
            ...e,
            startDate: new Date(e.startDate).toISOString().split("T")[0], // 'YYYY-MM-DD' 변환
            endDate: new Date(e.endDate).toISOString().split("T")[0],
            regDate: new Date(e.regDate).toISOString().split("T")[0]
        }));
        setThisWeekSchedules(scheduleList);
    }

    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ☀️ 날씨 정보 */}
            <section className="bg-blue-100 p-4 rounded-2xl shadow-md">
                <h2 className="text-lg font-semibold">☀️ 오늘의 날씨</h2>
                {weather ? (
                    <p className="text-gray-700 mt-2">
                        {weather.name}: {weather.main.temp}°C, {weather.weather[0].description}
                    </p>
                ) : (
                    <p className="text-gray-500 mt-2">날씨 정보를 불러오는 중...</p>
                )}
            </section>

            {/* 📝 오늘의 일정 */}
            <section className="bg-white p-4 rounded-2xl shadow-md">
                <h2 className="text-lg font-semibold">📝 오늘의 일정 ({getTodayDate()})</h2>
                <ul className="mt-2 space-y-3">
                    {todaySchedules.map((schedule, index) => (
                        <li key={index} className="text-gray-800">
                            📌 <span className="font-medium">{schedule.startDate} - {schedule.endDate}</span>
                            <div className="ml-6 text-gray-600">{schedule.title}</div>
                        </li>
                    ))}
                </ul>
            </section>

            {/* ✅ 할 일 목록 (To-Do List) */}
            <section className="bg-gray-100 p-4 rounded-2xl shadow-md">
                <h2 className="text-lg font-semibold">✅ 할 일 목록</h2>
                <ul className="mt-2 space-y-2">
                    {todos.map((todo, index) => (
                        <li key={index} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={todo.done}
                                onChange={() => {
                                    const newTodos = [...todos];
                                    newTodos[index].done = !newTodos[index].done;
                                    setTodos(newTodos);
                                }}
                                className="mr-2"
                            />
                            <span className={`${todo.done ? "line-through text-gray-500" : "text-gray-800"}`}>
                {todo.text}
              </span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* 🔥 주간 일정 요약 */}
            <section className="bg-yellow-100 p-4 rounded-2xl shadow-md col-span-1 md:col-span-2">
                <h2 className="text-lg font-semibold">🔥 이번 주 일정 ({getThisWeekRange().start} - {getThisWeekRange().end})</h2>
                <p className="text-gray-800 mt-2">📅 이번 주 총 {thisWeekSchedules.length}개의 일정 있음</p>
                <ul className="mt-3 space-y-3">
                    {thisWeekSchedules.map((schedule, index) => (
                        <li key={index} className="text-gray-800">
                            📅 <span className="font-medium">{schedule.startDate} - {schedule.endDate}</span>
                            <div className="ml-6 text-gray-600">{schedule.title}</div>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
