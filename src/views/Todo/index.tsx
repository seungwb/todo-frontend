import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Loader2 } from "lucide-react"
import TodoListItem from "../../components/TodoListItem"
import TodoModal from "../../components/TodoModal"
import { useCookies } from "react-cookie"
import { getTodoRequest } from "../../apis"
import type { GetTodoResponseDto } from "../../apis/response/todo"
import type { ResponseDto } from "../../apis/response"

export default function Todo() {
    const [cookies] = useCookies()
    const [todos, setTodos] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const getTodoResponse = (responseBody: GetTodoResponseDto | ResponseDto | null) => {
        if (!responseBody) {
            alert("네트워크 이상입니다.")
            return
        }
        const { code } = responseBody
        if (code === "DBE") alert("데이터베이스 오류입니다.")
        if (code === "VF" || code === "NU") alert("로그인이 필요한 기능입니다.")
        if (code === "AF") alert("인증에 실패하였습니다")
        if (code !== "SU") return
        return responseBody
    }

    useEffect(() => {
        fetchEvents().then()
    }, [])

    const fetchEvents = async () => {
        setIsLoading(true)
        const accessToken = cookies.accessToken
        const responseBody = await getTodoRequest(accessToken).then(getTodoResponse)

        if (!responseBody) {
            setIsLoading(false)
            return
        }

        const { todoListItems } = responseBody
        setTodos(todoListItems)
        setIsLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-6 flex flex-col items-center">
            <div className="w-full max-w-2xl">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-2">
                        할일 목록 게시판
                    </h1>
                    <p className="text-slate-500">효율적인 일정 관리를 위한 공간</p>
                </header>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full mb-6 group relative overflow-hidden bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white shadow-md h-14 rounded-md flex items-center justify-center"
                >
          <span className="absolute inset-0 flex items-center justify-center w-full h-full transition-transform duration-300 ease-out transform group-hover:translate-y-full">
            <Plus size={24} className="mr-2" /> 새로운 할일 추가하기
          </span>
                    <span className="absolute inset-0 flex items-center justify-center w-full h-full transition-transform duration-300 ease-out transform -translate-y-full group-hover:translate-y-0">
            시작하기
          </span>
                </button>

                <TodoModal isOpen={isModalOpen} onSave={fetchEvents} onClose={() => setIsModalOpen(false)} />

                <div className="w-full grid gap-4 relative">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <AnimatePresence>
                            {todos.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-xl p-8 text-center shadow-sm border border-slate-100"
                                >
                                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <span className="text-2xl">📝</span>
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-700 mb-1">할일이 없습니다</h3>
                                    <p className="text-slate-500">새로운 할일을 추가해 보세요</p>
                                </motion.div>
                            ) : (
                                todos.map((todo, index) => (
                                    <motion.div
                                        key={todo.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <TodoListItem key={todo.id} todo={todo} onSave={fetchEvents} />
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    )
}
