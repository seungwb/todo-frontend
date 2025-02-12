import React, {useEffect, useRef, useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ScheduleModal from '../../components/ScheduleModal';
import {ScheduleListItems} from "../../types/interface";
import {getScheduleRequest} from "../../apis";
import {useCookies} from "react-cookie";
import {GetScheduleResponseDto} from "../../apis/response/schedule";
import {ResponseDto} from "../../apis/response";
import ScheduleListItem from '../../components/ScheduleListItem'

export default function Schedule(){
    const [events, setEvents] = useState([]); // 일정 저장
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림 여부
    const [selectedDate, setSelectedDate] = useState(""); // 선택된 날짜
    const [filterType, setFilterType] = useState("today"); // 🟢 현재 선택된 필터 상태
    const [cookies, setCookie] = useCookies();
    useEffect(() => {
        fetchEvents().then();
    }, []);

    // 날짜 클릭 시 모달 열기
    const handleDateClick = (info: any) => {
        const clickedDateTime = new Date(info.date);
        const now = new Date(); // 현재 시간 가져오기

        // 클릭한 날짜 + 현재 시간 적용
        clickedDateTime.setHours(now.getHours(), now.getMinutes(), 0, 0); // 🟢 현재 시간 반영

        const localISOTime = new Date(clickedDateTime.getTime() - clickedDateTime.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16); // 🟢 24시간제 & "YYYY-MM-DDTHH:mm" 형식 적용
        console.log('=========클릭한 시간=========');
        console.log(localISOTime);

        setSelectedDate(localISOTime); // 선택한 날짜 + 시간 저장
        setIsModalOpen(true);
    };

    const getScheduleResponse = (responseBody: GetScheduleResponseDto | ResponseDto | null)=> {
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

    // 새 일정 저장
    const fetchEvents = async () => {
        const accessToken = cookies.accessToken;
        const responseBody  = await getScheduleRequest(accessToken).then(getScheduleResponse);
        if (!responseBody) return;

        const {scheduleListItems} = responseBody as ScheduleListItems[];

        const scheduleList: ScheduleListItems[] = scheduleListItems.map((event: any) => ({
            ...event,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            regDate: new Date(event.regDate)
        }));

        const formattedEvents = scheduleList.map((event) => ({
            title: event.title,
            start: event.startDate,
            end: event.endDate,
            backgroundColor: "rgba(99, 102, 241, 0.5)",
            borderColor: "rgb(99, 102, 241)",
            extendedProps: {
                id: event.id,
                name: event.name,
                location: event.location,
                content: event.content,
                regDate: event.regDate
            },
        }));

        setEvents(formattedEvents); // FullCalendar에 새 일정 반영
    };




    // 일정 필터링 함수
    const filteredEvents = events.filter((event) => {
        const startDate = new Date(event.start);
        startDate.setHours(0, 0, 0, 0); // 🟢 시작 날짜 00:00:00 기준으로 변경

        const endDate = new Date(event.end);
        endDate.setHours(0, 0, 0, 0); // 🟢 종료 날짜 00:00:00 기준으로 변경

        const today = new Date();
        today.setHours(0, 0, 0, 0); // 🟢 오늘 날짜 00:00:00 기준으로 변경

        if (filterType === "past") {
            return endDate.getTime() < today.getTime(); // ✅ 종료일이 오늘보다 이전이면 과거 일정
        } else if (filterType === "today") {
            return startDate.getTime() <= today.getTime() && endDate.getTime() >= today.getTime();
            // ✅ 시작일이 오늘이거나 오늘 이전 && 종료일이 오늘 이후
        } else if (filterType === "future") {
            return startDate.getTime() > today.getTime() || endDate.getTime() > today.getTime();
            // ✅ 시작일이 오늘 이후이거나 종료일이 오늘 이후면 차후 일정에 포함
        }
        return true;
    });




    return(
        <div className="flex flex-col gap-16">
            <div className="m-8">
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={events} // 저장된 일정 표시
                    dateClick={handleDateClick} // 날짜 클릭 시 모달 열기
                    className="w-full" //fullcalendar 라이브러리 사용 시 tailwindcss 사라지는 문제 해결

                />
                <ScheduleModal isOpen={isModalOpen}
                               onClose={() => setIsModalOpen(false)}
                               onSave = {fetchEvents}
                               selectedDate={selectedDate}/>
            </div>
            {/* 🟢 일정 필터 버튼 */}
            <div className="flex flex-row justify-between p-4">
                <button
                    className={`px-4 py-2 rounded ${filterType === "past" ? "bg-indigo-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setFilterType("past")}
                >
                    이전 일정
                </button>
                <button
                    className={`px-4 py-2 rounded ${filterType === "today" ? "bg-indigo-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setFilterType("today")}
                >
                    오늘 일정
                </button>
                <button
                    className={`px-4 py-2 rounded ${filterType === "future" ? "bg-indigo-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setFilterType("future")}
                >
                    차후 일정
                </button>
            </div>

            {/* 🟢 필터링된 일정 리스트 출력 */}
            <div className="flex flex-col gap-4 items-center">
                {filteredEvents.length === 0 ? (
                    <p className="text-gray-500 text-center">일정이 없습니다.</p>
                ) : (
                    filteredEvents.map((event, index) => (
                        <ScheduleListItem key={index}
                                          event={event}
                                          onSave = {fetchEvents}
                        />
                    ))
                )}
            </div>
        </div>
    )
}