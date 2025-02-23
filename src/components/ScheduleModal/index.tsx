import React, {useEffect, useState} from 'react';
import {postScheduleRequest, updateScheduleRequest} from "../../apis";
import {PostScheduleRequestDto, UpdateScheduleRequestDto} from "../../apis/request/schedule";
import {useCookies} from "react-cookie";
import {PostScheduleResponseDto, UpdateScheduleResponseDto} from "../../apis/response/schedule";
import {ResponseDto} from "../../apis/response";

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate?: string;
    onSave: () => void;
    initialData?: {
        id: number;
        title: string;
        content: string;
        location: string;
        startDate: string;
        endDate: string;
    };
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, onSave,selectedDate, initialData  }) => {
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        location: "",
        startDate: "",
        endDate: ""
    });
    const [cookies, setCookie] = useCookies();
    

    //          effect : 선택한 날짜, 시간 자동 반영          //
    useEffect(() => {
        if (initialData) {
            // 🔥 기존 데이터가 있으면 수정 모드
            setFormData({
                title: initialData.title || "",
                content: initialData.content || "",
                location: initialData.location || "",
                startDate: initialData.startDate,
                endDate: initialData.endDate
            });
        } else if (selectedDate) {
            // 🔥 새로운 일정 추가 시
            setFormData((prevFormData) => ({
                ...prevFormData,
                startDate: selectedDate,
                endDate: selectedDate,
            }));
        }
    }, [initialData, selectedDate]);

    //          event handler: 변경 이벤트 처리          //
    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    //          state: 에러 상태          //
    const scheduleResponse = (responseBody: PostScheduleResponseDto | ResponseDto | null) =>{
        if(!responseBody){
            alert('네트워크 이상입니다.')
            return;
        }
        const { code } = responseBody;
        if (code === 'DBE') alert('데이터베이스 오류입니다.');

        if (code === 'VF' || code === 'NU')  alert('로그인이 필요한 기능입니다.');

        if (code === 'AF') alert('인증에 실패하였습니다');
        if (code!=='SU') return;
        alert('일정이 추가 되었습니다!');
        onSave();

    }


//          event handler: 작성 버튼 이벤트 처리          //
    const onSubmitButtonHandler =  () => {
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
        postScheduleRequest(requestBody, accessToken).then(scheduleResponse);

        setFormData({
            title: "",
            content: "",
            location: "",
            startDate: "",
            endDate: ""
        })
        onClose();
    };

    const updateScheduleResponse = (responseBody: UpdateScheduleResponseDto | ResponseDto | null) =>{
        if(!responseBody){
            alert('네트워크 이상입니다.')
            return;
        }
        const { code } = responseBody;
        if (code === 'DBE') alert('데이터베이스 오류입니다.');

        if (code === 'VF' || code === 'NU')  alert('로그인이 필요한 기능입니다.');

        if (code === 'AF') alert('인증에 실패하였습니다');
        if (code!=='SU') return;

        alert('일정이 수정 되었습니다.')
        onSave();
    }

    const onUpdateButtonHandler =() =>{
        const accessToken = cookies.accessToken;
        if(!accessToken) {
            alert('로그인이 필요한 기능입니다.');
            onClose();
            return;
        }
        if (!initialData){
            alert('이미 삭제된 일정입니다.');
            return;
        }else {
            const requestBody: UpdateScheduleRequestDto = {
                title: formData.title
                , content: formData.content
                , location: formData.location
                , startDate: new Date(formData.startDate)
                , endDate: new Date(formData.endDate)
            };
            updateScheduleRequest(initialData.id, requestBody, accessToken).then(updateScheduleResponse);
        }
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
            <div className="bg-white p-6 rounded-lg shadow-md w-96 z-50">
                <h2 className="text-xl font-bold mb-4">{initialData ? "일정 수정" : "일정 추가"}</h2>
                <input type="text"
                       name="title"
                       placeholder="제목"
                       className="w-full p-2 border rounded mb-2"
                       value={formData.title}
                       onChange={onChangeHandler}/>
                <textarea name="content"
                          placeholder="내용"
                          className="w-full p-2 border rounded mb-2"
                          value={formData.content}
                          onChange={onChangeHandler}/>
                <input type="text"
                       name="location"
                       placeholder="장소"
                       className="w-full p-2 border rounded mb-2"
                       value={formData.location}
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
                    <button onClick={initialData ? onUpdateButtonHandler : onSubmitButtonHandler}
                            className="bg-indigo-500 text-white px-4 py-2 rounded">{initialData ? "일정 수정" : "일정 추가"}</button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleModal;
