import React from 'react';

//          component : Calendar List Item 컴포넌트          //
export default function CalendarListItem({ event }) {
    return (
        <div className="flex flex-col p-12 gap-4 border-2 rounded-md border-rose-500">
            {/* 작성자 (현재는 고정, 나중에 추가 가능) */}
            <div className="flex flex-row justify-between">
                <div>{'작성자: 관리자'}</div>
                <div>{new Date(event.start).toLocaleDateString()}</div> {/* 작성일 */}
            </div>

            {/* 제목 */}
            <div>
                <div className="font-bold text-lg">{event.title}</div>
            </div>

            {/* 시작일 & 마감일 */}
            <div className="flex flex-row justify-between">
                <div>시작일: {new Date(event.start).toLocaleString()}</div>
                <div>마감일: {new Date(event.end).toLocaleString()}</div>
            </div>

            {/* 장소 */}
            <div>
                <div>장소: {event.extendedProps?.location || "미정"}</div>
            </div>

            {/* 내용 */}
            <div>
                <div>내용: {event.extendedProps?.content || "내용 없음"}</div>
            </div>

            {/* 이미지 (추후 추가 가능) */}
            <div>
                <div>{'이미지: 없음'}</div>
            </div>
        </div>
    );
}