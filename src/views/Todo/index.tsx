import React, {useEffect, useState} from 'react';
import TodoListItem from "../../components/TodoListItem";
import TodoModal from "../../components/TodoModal";
import {useCookies} from "react-cookie";
import {getTodoRequest} from "../../apis";
import {GetTodoResponseDto} from "../../apis/response/todo";
import {ResponseDto} from "../../apis/response";
import TodoListItems from "../../types/interface/todo-list-items.interface";

export default function Todo(){
    const [cookies, setCookie] = useCookies();
    const [todos, setTodos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getTodoResponse = (responseBody: GetTodoResponseDto | ResponseDto | null) =>{
        if(!responseBody){
            alert('네트워크 이상입니다.');
            return;
        }
        const { code } = responseBody;
        if (code === 'DBE') alert('데이터베이스 오류입니다.');

        if (code === 'VF' || code === 'NU')  alert('로그인이 필요한 기능입니다.');

        if (code === 'AF') alert('인증에 실패하였습니다');
        if (code!=='SU') return;
        return responseBody;
    }

    useEffect(() => {

        fetchEvents().then();
    }, []);

    const fetchEvents = async () =>{
        const accessToken = cookies.accessToken;
        const responseBody = await getTodoRequest(accessToken).then(getTodoResponse);

        if(!responseBody) return;

        const { todoListItems } = responseBody as TodoListItems[];
        setTodos(todoListItems);
    }


    const deleteTodo = (id) => {
        /*setTodos(todos.filter(todo => todo.id !== id));*/
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center">
            <h1 className="text-4xl font-bold mb-6 text-gray-800">할일 목록 게시판</h1>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white rounded-md w-full max-w-xl h-12 flex items-center justify-center text-2xl hover:bg-blue-700 transition-colors mb-6">+</button>
            <TodoModal
                isOpen={isModalOpen}
                onSave = {fetchEvents}
                onClose={() => setIsModalOpen(false)}
            />
            <div className="w-full max-w-xl grid gap-4 relative">
                {todos.length === 0 ? (
                    <p className="text-gray-500 text-center">할일이 없습니다.</p>
                    ): (
                    todos.map(todo => (
                    <TodoListItem
                        key={todo.id}
                        todo={todo}
                        onSave = {fetchEvents}
                        deleteTodo={deleteTodo}/>
                    )
                ))}
            </div>
        </div>
    );
};



