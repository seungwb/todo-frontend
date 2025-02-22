import React, { useState } from 'react';

const TodoBoard = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState({ title: '', content: '', state: 'TODO', memberId: '' });

    const handleChange = (e) => {
        setNewTodo({ ...newTodo, [e.target.name]: e.target.value });
    };

    const addTodo = () => {
        setTodos([...todos, { ...newTodo, id: Date.now(), reg_date: new Date().toLocaleDateString() }]);
        setNewTodo({ title: '', content: '', state: 'TODO', memberId: '' });
    };

    const updateTodo = (id, updatedTodo) => {
        setTodos(todos.map(todo => (todo.id === id ? updatedTodo : todo)));
    };

    const deleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center">
            <h1 className="text-4xl font-bold mb-6 text-gray-800">할일 목록 게시판</h1>
            <div className="w-full max-w-xl mb-6 p-4 bg-white rounded-lg shadow-md border border-gray-200">
                <input type="text" name="title" value={newTodo.title} onChange={handleChange} placeholder="제목" className="border border-gray-300 p-3 w-full mb-4 rounded-lg focus:outline-none focus:border-gray-500 transition-colors" />
                <input type="text" name="content" value={newTodo.content} onChange={handleChange} placeholder="내용" className="border border-gray-300 p-3 w-full mb-4 rounded-lg focus:outline-none focus:border-gray-500 transition-colors" />
                <input type="text" name="memberId" value={newTodo.memberId} onChange={handleChange} placeholder="멤버 ID" className="border border-gray-300 p-3 w-full mb-4 rounded-lg focus:outline-none focus:border-gray-500 transition-colors" />
                <button onClick={addTodo} className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">추가하기</button>
            </div>
            <div className="w-full max-w-xl grid gap-4">
                {todos.map(todo => (
                    <div key={todo.id} className="p-6 bg-white rounded-lg shadow-md border-l-4 border-blue-500 transition-all hover:shadow-lg">
                        <h2 className="text-2xl font-semibold text-gray-800">{todo.title}</h2>
                        <p className="text-gray-600 leading-relaxed">{todo.content}</p>
                        <p className="text-sm text-gray-500">상태: {todo.state}</p>
                        <p className="text-sm text-gray-500">등록일: {todo.reg_date}</p>
                        <p className="text-sm text-gray-500">멤버 ID: {todo.memberId}</p>
                        <button onClick={() => deleteTodo(todo.id)} className="mt-4 bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition-colors">삭제</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TodoBoard;
