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
    const [filter, setFilter] = useState<"all" | "active" | "done">("all")

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

    const filteredTodos = todos.filter(todo => {
        if (filter === "active") return !todo.state
        if (filter === "done") return todo.state
        return true
    })

    const completedCount = todos.filter(t => t.state).length
    const completionRate = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0

    return (
        <div className="min-h-screen bg-[#09090f] px-4 py-8">
            <div className="max-w-2xl mx-auto">

                {/* 헤더 */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-1">할일 목록</h1>
                        {!isLoading && todos.length > 0 && (
                            <p className="text-sm text-slate-500">
                                {completedCount}/{todos.length}개 완료
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2.5 font-medium transition-all text-sm shadow-[0_0_16px_rgba(99,102,241,0.25)] hover:shadow-[0_0_24px_rgba(99,102,241,0.35)]"
                    >
                        <Plus size={15} strokeWidth={2.5} />
                        새 할일
                    </button>
                </div>

                {/* 진행률 바 */}
                {!isLoading && todos.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 bg-[#111118] border border-white/[0.07] rounded-2xl p-4"
                    >
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                            <span>전체 진행률</span>
                            <span className="font-medium text-slate-400">{completionRate}%</span>
                        </div>
                        <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${completionRate}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                        </div>
                    </motion.div>
                )}

                {/* 필터 탭 */}
                {!isLoading && todos.length > 0 && (
                    <div className="flex gap-1 mb-5 bg-[#111118] border border-white/[0.07] rounded-xl p-1">
                        {([
                            { key: "all", label: "전체", count: todos.length },
                            { key: "active", label: "미완료", count: todos.filter(t => !t.state).length },
                            { key: "done", label: "완료", count: completedCount },
                        ] as const).map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                    filter === tab.key
                                        ? "bg-white/[0.08] text-slate-100"
                                        : "text-slate-500 hover:text-slate-300"
                                }`}
                            >
                                {tab.label}
                                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                                    filter === tab.key ? "bg-indigo-500/25 text-indigo-400" : "bg-white/[0.05] text-slate-600"
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                <TodoModal isOpen={isModalOpen} onSave={fetchEvents} onClose={() => setIsModalOpen(false)} />

                {/* 목록 */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-24">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-700" />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {filteredTodos.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-24 text-center"
                            >
                                <div className="w-14 h-14 bg-[#111118] border border-white/[0.07] rounded-2xl flex items-center justify-center mb-4">
                                    <ClipboardList size={24} className="text-slate-700" />
                                </div>
                                <h3 className="text-sm font-medium text-slate-400 mb-1.5">
                                    {filter === "all" ? "아직 할일이 없어요" : filter === "active" ? "미완료 할일이 없어요" : "완료된 할일이 없어요"}
                                </h3>
                                <p className="text-xs text-slate-600 mb-6">
                                    {filter === "all" ? "새로운 할일을 추가해서 시작해보세요" : ""}
                                </p>
                                {filter === "all" && (
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2.5 font-medium transition-all text-sm"
                                    >
                                        <Plus size={15} />
                                        할일 추가하기
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col gap-2"
                            >
                                {filteredTodos.map((todo, index) => (
                                    <motion.div
                                        key={todo.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: index * 0.04 }}
                                    >
                                        <TodoListItem todo={todo} onSave={fetchEvents} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}
