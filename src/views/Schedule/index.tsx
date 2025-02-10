import React, {useState} from 'react';
import CalendarListItem from '../../components/ScheduleListItem';
import Header from '../../layouts/Header';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ScheduleModal from '../../components/ScheduleModal';
import ScheduleListItem from "../../components/ScheduleListItem";

export default function Schedule(){
    const [events, setEvents] = useState([]); // 일정 저장
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림 여부
    const [selectedDate, setSelectedDate] = useState(""); // 선택된 날짜
    const [filterType, setFilterType] = useState("today"); // 🟢 현재 선택된 필터 상태

    // 날짜 클릭 시 모달 열기
    const handleDateClick = (info: any) => {
        const clickedDateTime = new Date(info.date);
        const now = new Date(); // 현재 시간 가져오기

        // 클릭한 날짜 + 현재 시간 적용
        clickedDateTime.setHours(now.getHours(), now.getMinutes(), 0, 0); // 🟢 현재 시간 반영

        const localISOTime = new Date(clickedDateTime.getTime() - clickedDateTime.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16); // 🟢 24시간제 & "YYYY-MM-DDTHH:mm" 형식 적용
        console.log(localISOTime);

        setSelectedDate(localISOTime); // 선택한 날짜 + 시간 저장
        setIsModalOpen(true);
    };

    // 새 일정 저장
    const handleSaveEvent = (newEvent: any) => {

        setEvents([...events,
            {
                title: newEvent.title,
                start: newEvent.start, // new Date()로 변환된 값
                end: newEvent.end,     // new Date()로 변환된 값
                backgroundColor: "rgba(99, 102, 241, 0.5)", // 연한 인디고 색상
                borderColor: "rgb(99, 102, 241)", // 테두리 색상
            },
        ]);
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
                <ScheduleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveEvent}
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
                        <ScheduleListItem key={index} event={event}/>
                    ))
                )}
            </div>
        </div>
    )
}