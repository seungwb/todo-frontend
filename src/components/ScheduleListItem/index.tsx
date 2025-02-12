import React, {useState} from "react";
import {ResponseDto} from "../../apis/response";
import {deleteScheduleRequest, updateScheduleRequest} from "../../apis";
import {useCookies} from "react-cookie";
import {DeleteScheduleResponseDto, UpdateScheduleResponseDto} from "../../apis/response/schedule";
import ScheduleModal from "../ScheduleModal";

// 날짜 포맷 변경 함수


//          component : Calendar List Item 컴포넌트          //
export default function ScheduleListItem({ event, onSave }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updateData, setUpdateData] = useState({
        id: 0,
        title: "",
        content: "",
        location: "",
        startDate: "",
        endDate: ""
    });
    const [cookies, setCookie] = useCookies();
    const deleteScheduleResponse = (responseBody: DeleteScheduleResponseDto | ResponseDto | null) =>{
        if(!responseBody){
            alert('네트워크 이상입니다.')
            return;
        }
        const { code } = responseBody;
        if (code === 'DBE') alert('데이터베이스 오류입니다.');

        if (code === 'VF' || code === 'NU')  alert('로그인이 필요한 기능입니다.');

        if (code === 'AF') alert('인증에 실패하였습니다');
        if (code!=='SU') return;

        alert('일정이 삭제 되었습니다.')
        onSave();
    }

    const onDeleteButtonHandler = () =>{
        const id = event.extendedProps.id
        const accessToken = cookies.accessToken;

        deleteScheduleRequest(id, accessToken).then(deleteScheduleResponse);
    }



    const onUpdateButtonHandler = (event) =>{
        setUpdateData({
            id: event.extendedProps.id
            , title: event.title
            , content: event.extendedProps.content
            , location: event.extendedProps.location
            , startDate: new Date(event.start).toISOString().slice(0, 16)
            ,endDate: new Date(event.end).toISOString().slice(0, 16)
        });
        setIsModalOpen(true);
    }


    return (
        <div className="w-2/3 p-6 bg-indigo-200 rounded-lg shadow-md text-gray-900">
            {/* 제목 및 삭제 버튼 */}
            <div className="flex justify-between items-center border-b border-gray-400 pb-2">
                <div className="text-lg font-bold">{event.title}</div>
                <div className="flex gap-2">
                    {/* 수정 버튼 */}
                    <button
                        onClick={() => onUpdateButtonHandler(event)}
                        className="text-blue-500 hover:text-blue-700 text-sm font-semibold cursor-pointer"
                    >
                        수정
                    </button>
                    <ScheduleModal isOpen={isModalOpen}
                                   onClose={() => setIsModalOpen(false)}
                                   initialData = {updateData}
                                   onSave={onSave}
                                   />
                    {/* 삭제 버튼 */}
                    <button
                        onClick={() => onDeleteButtonHandler()}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold cursor-pointer"
                    >
                        삭제
                    </button>
                </div>
            </div>

            {/* 작성자 & 작성일 */}
            <div className="flex justify-between text-sm text-indigo-900 mt-3">
                <div className="font-semibold">작성자: {event.extendedProps.name}</div>
                <div className="font-semibold">작성일: {new Date(event.extendedProps.regDate).toLocaleString()}</div>
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


