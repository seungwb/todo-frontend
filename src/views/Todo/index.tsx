import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Loader2, ClipboardList } from "lucide-react"
import TodoListItem from "../../components/TodoListItem"
import TodoModal from "../../components/TodoModal"
import { useCookies } from "react-cookie"
import { getTodoRequest } from "../../apis"
import type { GetTodoResponseDto } from "../../apis/response/todo"
import type { ResponseDto } from "../../apis/response"
import type { TodoListItems } from "../../types/interface"
import ResponseCode from "../../types/enum/response-code.enum"

export default function Todo() {
    const [cookies] = useCookies()
    const [todos, setTodos] = useState<TodoListItems[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const getTodoResponse = (responseBody: GetTodoResponseDto | ResponseDto | null) => {
        if (!responseBody) { alert("네트워크 이상입니다."); return }
        const { code } = responseBody
        if (code === ResponseCode.DATABASE_ERROR) alert("데이터베이스 오류입니다.")
        if (code === ResponseCode.VALIDATION_FAILED || code === ResponseCode.NOT_EXISTED_USER) alert("로그인이 필요한 기능입니다.")
        if (code !== ResponseCode.SUCCESS) return
        return responseBody
    }

    useEffect(() => {
        fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchEvents = async () => {
        setIsLoading(true)
        const accessToken = cookies.accessToken
        const responseBody = await getTodoRequest(accessToken).then(getTodoResponse)

        if (!responseBody || !("todoListItems" in responseBody)) {
            setIsLoading(false)
            return
        }

        setTodos(responseBody.todoListItems)
        setIsLoading(false)
    }

    return (
        <div className="min-h-screen bg-[#0d0d12] px-4 py-8">
            <div className="max-w-3xl mx-auto">
                {/* 헤더 */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-100">할일 목록</h1>
                        {!isLoading && (
                            <span className="bg-indigo-500/15 text-indigo-400 rounded-lg px-2 py-0.5 text-xs font-medium">
                                {todos.length}개
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl px-4 py-2.5 font-medium transition-all text-sm"
                    >
                        <Plus size={16} />
                        새 할일 추가
                    </button>
                </header>

                <TodoModal isOpen={isModalOpen} onSave={fetchEvents} onClose={() => setIsModalOpen(false)} />

                {/* 목록 */}
                <div className="max-w-2xl mx-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-24">
                            <Loader2 className="h-7 w-7 animate-spin text-slate-600" />
                        </div>
                    ) : (
                        <AnimatePresence>
                            {todos.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center py-24 text-center"
                                >
                                    <div className="w-16 h-16 bg-[#1c1c28] border border-white/[0.06] rounded-2xl flex items-center justify-center mb-4">
                                        <ClipboardList size={28} className="text-slate-600" />
                                    </div>
                                    <h3 className="text-base font-medium text-slate-400 mb-1">아직 할일이 없어요</h3>
                                    <p className="text-sm text-slate-600 mb-6">새로운 할일을 추가해서 시작해보세요</p>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl px-4 py-2.5 font-medium transition-all text-sm"
                                    >
                                        <Plus size={15} />
                                        할일 추가하기
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {todos.map((todo, index) => (
                                        <motion.div
                                            key={todo.id}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -16 }}
                                            transition={{ delay: index * 0.04 }}
                                        >
                                            <TodoListItem key={todo.id} todo={todo} onSave={fetchEvents} />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    )
}
