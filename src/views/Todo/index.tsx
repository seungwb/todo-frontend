import React, { useState } from 'react';
import TodoListItem from "../../components/TodoListItem";
import TodoModal from "../../components/TodoModal";

export default function Todo(){
    const [todos, setTodos] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [state, setState] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleComplete = (id) => {
        setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
    };

    const deleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center">
            <h1 className="text-4xl font-bold mb-6 text-gray-800">할일 목록 게시판</h1>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white rounded-md w-full max-w-xl h-12 flex items-center justify-center text-2xl hover:bg-blue-700 transition-colors mb-6">+</button>
            <TodoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={setTitle} content = {setContent}/>
            <div className="w-full max-w-xl grid gap-4 relative z-10">
                {todos.map(todo => (
                    <TodoListItem key={todo.id} todo={todo} toggleComplete={toggleComplete} deleteTodo={deleteTodo} setNewTodo={setNewTodo} />
                ))}
            </div>
        </div>
    );
};



