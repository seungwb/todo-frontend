import React, {useEffect, useState} from 'react';
import {useCookies} from "react-cookie";

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
const TodoModal: React.FC<TodoModalProps> = ({ isOpen, closeModal, addTodo, title, content, initialData }) =>{

    const [formData, setFormData] = useState({
        title: "",
        content: ""
    });
    const [cookies, setCookie] = useCookies();

    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewTodo({ ...newTodo, [e.target.name]: e.target.value });
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-4">할일 추가하기</h2>
                <input type="text" name="title" value={title} onChange={onChangeHandler} placeholder="제목" className="border border-gray-300 p-3 w-full mb-4 rounded-lg focus:outline-none focus:border-gray-500 transition-colors" />
                <textarea name="content" value={content} onChange={onChangeHandler} placeholder="내용" className="border border-gray-300 p-3 w-full mb-4 rounded-lg focus:outline-none focus:border-gray-500 transition-colors"></textarea>
                <div className="flex justify-end space-x-2">
                    <button onClick={closeModal} className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors">취소</button>
                    <button onClick={addTodo} className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">추가하기</button>
                </div>
            </div>
        </div>
    );
};

export default TodoModal