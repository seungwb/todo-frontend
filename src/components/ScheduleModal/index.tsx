import React, {useEffect, useState} from 'react';
import {scheduleRequest, signInRequest} from "../../apis";
import {ScheduleRequestDto} from "../../apis/request/calendar";
import {useCookies} from "react-cookie";

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

    useEffect(() => {
        if (selectedDate) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                startDate: selectedDate, // 🟢 선택한 날짜 + 시간 자동 반영
                endDate: selectedDate,   // 기본값은 동일한 시간
            }));
        }
    }, [selectedDate]); // 🟢 selectedDate가 바뀔 때마다 초기값 업데이트

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = () => {
        const accessToken = cookies.accessToken;
        if(!accessToken) return;
        const requestBody: ScheduleRequestDto = {
            title : formData.title
            , content : formData.content
            , location: formData.location
            , startDate: new Date(formData.startDate)
            , endDate: new Date(formData.endDate)
        };
        scheduleRequest(requestBody, accessToken).then();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
            <div className="bg-white p-6 rounded-lg shadow-md w-96 z-50">
                <h2 className="text-xl font-bold mb-4">일정 추가</h2>
                <input type="text" name="title" placeholder="제목" className="w-full p-2 border rounded mb-2"
                       onChange={handleChange}/>
                <textarea name="content" placeholder="내용" className="w-full p-2 border rounded mb-2"
                          onChange={handleChange}/>
                <input type="text" name="location" placeholder="장소" className="w-full p-2 border rounded mb-2"
                       onChange={handleChange}/>
                <input
                    type="datetime-local"
                    name="startDate"
                    className="w-full p-2 border rounded mb-2"
                    onChange={handleChange}
                    value={formData.startDate} // 🟢 자동 반영된 값 적용
                />
                <input
                    type="datetime-local"
                    name="endDate"
                    className="w-full p-2 border rounded mb-2"
                    onChange={handleChange}
                    value={formData.endDate} // 🟢 자동 반영된 값 적용
                />
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">취소</button>
                    <button onClick={handleSubmit} className="bg-indigo-500 text-white px-4 py-2 rounded">저장</button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleModal;
