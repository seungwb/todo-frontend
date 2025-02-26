import React, {useEffect, useState} from 'react';
import {useCookies} from "react-cookie";
import {PostTodoResponseDto, UpdateTodoResponseDto} from "../../apis/response/todo";
import {ResponseDto} from "../../apis/response";
import {PostTodoRequestDto, UpdateTodoRequestDto} from "../../apis/request/todo";
import {postTodoRequest, updateTodoRequest} from "../../apis";

interface TodoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    initialData?: {
        id: number;
        title: string;
        content: string;
    }
}

// TodoModal 컴포넌트: + 버튼 클릭 시 모달 형태로 입력란 표시
const TodoModal: React.FC<TodoModalProps> = ({ isOpen, onSave, onClose, initialData }) =>{

    const [formData, setFormData] = useState({
        title: "",
        content: ""
    });
    const [cookies, setCookie] = useCookies();
    //          effect : 선택한 날짜, 시간 자동 반영          //
    useEffect(() => {
        if (initialData) {
            // 🔥 기존 데이터가 있으면 수정 모드
            setFormData({
                title: initialData.title || "",
                content: initialData.content || "",
            });
        } else{
            // 🔥 새로운 일정 추가 시
            setFormData((prevFormData) => ({
                ...prevFormData
            }));
        }
    }, [initialData]);
    //          event handler: 변경 이벤트 처리          //
    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const postTodoResponse = (responseBody: PostTodoResponseDto | ResponseDto | null) =>{
        if(!responseBody){
            alert('네트워크 이상입니다.')
            return;
        }
        const { code } = responseBody;
        if (code === 'DBE') alert('데이터베이스 오류입니다.');

        if (code === 'VF' || code === 'NU')  alert('로그인이 필요한 기능입니다.');

        if (code === 'AF') alert('인증에 실패하였습니다');
        if (code!=='SU') return;

        alert('할일이 추가 되었습니다.');
        onSave();
    }

    const onSubmitButtonHandler = () =>{
        const accessToken = cookies.accessToken;
        if(!accessToken){
            alert('로그인이 필요한 기능입니다.');
            onClose();
            return;
        }
        const requestBody: PostTodoRequestDto = {
            title: formData.title
            , content: formData.content
        };
        postTodoRequest(requestBody, accessToken).then(postTodoResponse);

        setFormData({
           title: ""
           , content: ""
        });
        onClose();
    }
    const updateTodoResponse = (responseBody: UpdateTodoResponseDto | ResponseDto | null)=>{
        if(!responseBody){
            alert('네트워크 이상입니다.')
            return;
        }
        const { code } = responseBody;
        if (code === 'DBE') alert('데이터베이스 오류입니다.');

        if (code === 'VF' || code === 'NU')  alert('로그인이 필요한 기능입니다.');

        if (code === 'AF') alert('인증에 실패하였습니다');
        if (code!=='SU') return;

        alert('할일이 수정 되었습니다.');
        onSave();
    }

    const onUpdateButtonHandler = () =>{
        const accessToken = cookies.accessToken;
        if(!accessToken){
            alert('로그인이 필요한 기능입니다.');
            onClose();
            return;
        }
        if(!initialData){
            alert('이미 삭제된 일정입니다.');
            return;
        } else{
            const requestBody: UpdateTodoRequestDto = {
                title: formData.title
                , content: formData.content
            };
            updateTodoRequest(initialData.id, requestBody, accessToken).then(updateTodoResponse);

        }
        onClose();
    }



    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-4">할일 추가하기</h2>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={onChangeHandler}
                    placeholder="제목"
                    className="border border-gray-300 p-3 w-full mb-4 rounded-lg focus:outline-none focus:border-gray-500 transition-colors" />
                <textarea
                    name="content"
                    value={formData.content}
                    onChange={onChangeHandler}
                    placeholder="내용"
                    className="border border-gray-300 p-3 w-full mb-4 rounded-lg focus:outline-none focus:border-gray-500 transition-colors"></textarea>
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors">취소</button>
                    <button onClick={initialData ? onUpdateButtonHandler : onSubmitButtonHandler}
                            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">{initialData ? "수정" : "추가"}</button>
                </div>
            </div>
        </div>
    );
};

export default TodoModal