import React from "react";

// 날짜 포맷 변경 함수
const formatDate = (date) => {
    return new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD 형식
};

//          component : Calendar List Item 컴포넌트          //
export default function ScheduleListItem({ event }) {
    return (
        <div className="w-2/3 p-6 bg-indigo-200 rounded-lg shadow-md text-gray-900">
            {/* 제목 */}
            <div className="text-lg font-bold border-b border-gray-400 pb-2">{event.title}</div>

            {/* 작성자 & 작성일 */}
            <div className="flex justify-between text-sm text-indigo-900 mt-3">
                <div className="font-semibold">작성자: 관리자</div>
                <div className="font-semibold">작성일: {formatDate(event.start)}</div>
            </div>

            {/* 일정 정보 */}
            <div className="text-sm mt-4 text-gray-800">
                <div className="font-medium">시작일: {new Date(event.start).toLocaleString()}</div>
                <div className="font-medium">마감일: {new Date(event.end).toLocaleString()}</div>
            </div>

            {/* 장소 */}
            <div className="text-sm mt-4 border-t border-gray-400 pt-3 text-gray-900">
                <span className="font-semibold text-indigo-900">장소:</span> {event.extendedProps?.location || "미정"}
            </div>

            {/* 내용 */}
            <div className="text-sm mt-2 text-gray-900">
                <span className="font-semibold text-indigo-900">내용:</span> {event.extendedProps?.content || "내용 없음"}
            </div>
        </div>
    );
}


