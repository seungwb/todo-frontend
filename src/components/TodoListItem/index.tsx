import React, { useState } from 'react';
import {DeleteTodoResponseDto, UpdateStateTodoResponseDto} from "../../apis/response/todo";
import {ResponseDto} from "../../apis/response";
import {useCookies} from "react-cookie";
import {UpdateStateTodoRequestDto} from "../../apis/request/todo";
import {deleteTodoRequest, updateStateTodoRequest} from "../../apis";
import TodoModal from "../TodoModal";
export default function TodoListItem({ todo, onSave }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updateData, setUpdateData] = useState({
        id: 0
        , title: ""
        , content: ""
    })

    const [updateState, setUpdateState] = useState(todo.state);

    const [cookies, setCookie] = useCookies();



    const updateStateTodoResponse = (responseBody: UpdateStateTodoResponseDto | ResponseDto | null) =>{
        if(!responseBody){
            alert('네트워크 이상입니다.')
            return;
        }
        const { code } = responseBody;
        if (code === 'DBE') alert('데이터베이스 오류입니다.');

        if (code === 'VF' || code === 'NU')  alert('로그인이 필요한 기능입니다.');

        if (code === 'AF') alert('인증에 실패하였습니다');
        if (code!=='SU') return;
    }

    const onToggleHandler = (e) =>{
        if (isModalOpen) return;
        if (e.target.tagName === 'BUTTON') return;

        const newState = !updateState;
        console.log(newState);

        const accessToken = cookies.accessToken;

        const requestBody : UpdateStateTodoRequestDto = {
            state: newState
        };

        updateStateTodoRequest(todo.id, requestBody, accessToken).then(updateStateTodoResponse);
        setUpdateState(newState);
    }

    const onUpdateButtonHandler = (todo) =>{
        setUpdateData({
            id: todo.id
            , title: todo.title
            , content: todo.content
        })
        setIsModalOpen(true);
    }
    const deleteTodoResponse = (responseBody: DeleteTodoResponseDto | ResponseDto | null) =>{
        if(!responseBody){
            alert('네트워크 이상입니다.')
            return;
        }
        const { code } = responseBody;
        if (code === 'DBE') alert('데이터베이스 오류입니다.');

        if (code === 'VF' || code === 'NU')  alert('로그인이 필요한 기능입니다.');

        if (code === 'AF') alert('인증에 실패하였습니다');
        if (code!=='SU') return;

        alert('삭제 되었습니다.')
        onSave();
    }
    const onDeleteButtonHandler = () =>{
        const id = todo.id;
        const accessToken = cookies.accessToken;

        deleteTodoRequest(id,accessToken).then(deleteTodoResponse);
    }



    return (
        <div onClick={onToggleHandler} className={`p-6 bg-white rounded-lg shadow-md border-l-4 border-blue-500 transition-all hover:shadow-lg relative cursor-pointer ${updateState ? '' : 'line-through opacity-50'}`}>
            <h2 className="text-2xl font-semibold text-gray-800">{todo.title}</h2>
            <p className="text-gray-600 mt-2">{todo.content}</p>
            <p className="text-sm text-gray-500">등록일: {todo.regDate}</p>
            <div className="absolute bottom-2 right-2 flex space-x-2">
                {updateState && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpdateButtonHandler(todo);
                        }}
                        className="bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600 transition-colors">
                        수정
                    </button>
                )}
                {isModalOpen && (
                    <div className="isolate isolation-auto fixed z-50 ">
                        <TodoModal
                            isOpen={isModalOpen}
                            onSave={onSave}
                            onClose={() => setIsModalOpen(false)}
                            initialData={updateData}
                        />
                    </div>
                )}
                <button
                    onClick={onDeleteButtonHandler}
                    className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition-colors">삭제</button>



            </div>
        </div>
    );
};