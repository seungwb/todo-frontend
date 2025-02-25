import React, { useState } from 'react';
export default function TodoListItem({ todo, toggleComplete, deleteTodo }) {

    const [updateData, setUpdateData] = useState({
        id: 0
        , title: ""
        , content: ""
        , state: true
        , regDate: ""
    })

    return (
        <div onClick={() => toggleComplete(todo.id)} className={`p-6 bg-white rounded-lg shadow-md border-l-4 border-blue-500 transition-all hover:shadow-lg relative cursor-pointer ${todo.state ? '' : 'line-through opacity-50'}`}>
            <h2 className="text-2xl font-semibold text-gray-800">{todo.title}</h2>
            <p className="text-gray-600 mt-2">{todo.content}</p>
            <p className="text-sm text-gray-500">등록일: {todo.regDate}</p>
            <div className="absolute bottom-2 right-2 flex space-x-2">
                <button onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }} className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition-colors">삭제</button>
                <button onClick={(e) => { e.stopPropagation();  deleteTodo(todo.id); }} className="bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600 transition-colors">수정</button>
            </div>
        </div>
    );
};