import React, {useEffect, useState} from 'react';
import {postScheduleRequest} from "../../apis";
import {PostScheduleRequestDto} from "../../apis/request/schedule";
import {useCookies} from "react-cookie";
import {PostScheduleResponseDto} from "../../apis/response/schedule";
import {ResponseDto} from "../../apis/response";

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: string;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, onSave, selectedDate  }) => {
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        location: "",
        startDate: "",
        endDate: "",
    });
    const [cookies, setCookie] = useCookies();
    

    //          effect : 선택한 날짜, 시간 자동 반영          //
    useEffect(() => {
        if (selectedDate) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                startDate: selectedDate, // 🟢 선택한 날짜 + 시간 자동 반영
                endDate: selectedDate,   // 기본값은 동일한 시간
            }));
        }
    }, [selectedDate]); // 🟢 selectedDate가 바뀔 때마다 초기값 업데이트

    //          event handler: 변경 이벤트 처리          //
    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    //          state: 에러 상태          //
    const scheduleResponse = (responseBody: PostScheduleResponseDto | ResponseDto | null) =>{
        if(!responseBody){
            alert('네트워크 이상입니다.')
        }
        return;
        const { code } = responseBody;
        if (code === 'DBE') alert('데이터베이스 오류입니다.')

        if (code === 'VF' || code === 'NU')  alert('로그인이 필요한 기능입니다.')

        if (code === 'AF') alert('인증에 실패하였습니다')
        if (code!=='SU') return;
        onSave();
        alert('일정이 추가 되었습니다!');

    }
//          event handler: 작성 버튼 이벤트 처리          //
    const onSubmitButtonHandler = async () => {
        const accessToken = cookies.accessToken;
        if(!accessToken) {
            alert('로그인이 필요한 기능입니다.');
            onClose();
            return;
        }
        const requestBody: PostScheduleRequestDto = {
            title : formData.title
            , content : formData.content
            , location: formData.location
            , startDate: new Date(formData.startDate)
            , endDate: new Date(formData.endDate)
        };
        await postScheduleRequest(requestBody, accessToken).then(scheduleResponse);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
            <div className="bg-white p-6 rounded-lg shadow-md w-96 z-50">
                <h2 className="text-xl font-bold mb-4">일정 추가</h2>
                <input type="text" name="title" placeholder="제목" className="w-full p-2 border rounded mb-2"
                       onChange={onChangeHandler}/>
                <textarea name="content" placeholder="내용" className="w-full p-2 border rounded mb-2"
                          onChange={onChangeHandler}/>
                <input type="text" name="location" placeholder="장소" className="w-full p-2 border rounded mb-2"
                       onChange={onChangeHandler}/>
                <input
                    type="datetime-local"
                    name="startDate"
                    className="w-full p-2 border rounded mb-2"
                    onChange={onChangeHandler}
                    value={formData.startDate}
                />
                <input
                    type="datetime-local"
                    name="endDate"
                    className="w-full p-2 border rounded mb-2"
                    onChange={onChangeHandler}
                    value={formData.endDate}
                />
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">취소</button>
                    <button onClick={onSubmitButtonHandler} className="bg-indigo-500 text-white px-4 py-2 rounded">저장</button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleModal;
