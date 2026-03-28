import { type MouseEvent, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Edit, Trash2, Check, ChevronDown, Loader2 } from "lucide-react"
import type { DeleteTodoResponseDto, UpdateStateTodoResponseDto } from "../../apis/response/todo"
import type { ResponseDto } from "../../apis/response"
import { useCookies } from "react-cookie"
import type { UpdateStateTodoRequestDto } from "../../apis/request/todo"
import { deleteTodoRequest, updateStateTodoRequest } from "../../apis"
import TodoModal from "../TodoModal"
import type { TodoListItems } from "../../types/interface"
import ResponseCode from "../../types/enum/response-code.enum"

interface TodoListItemProps {
    todo: TodoListItems
    onSave: () => void
}

export default function TodoListItem({ todo, onSave }: TodoListItemProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [updateData, setUpdateData] = useState({ id: 0, title: "", content: "" })
    const [updateState, setUpdateState] = useState(todo.state)
    const [cookies] = useCookies()

    const updateStateTodoResponse = (responseBody: UpdateStateTodoResponseDto | ResponseDto | null) => {
        if (!responseBody) { alert("네트워크 이상입니다."); return }
        const { code } = responseBody
        if (code === ResponseCode.DATABASE_ERROR) alert("데이터베이스 오류입니다.")
        if (code === ResponseCode.VALIDATION_FAILED || code === ResponseCode.NOT_EXISTED_USER) alert("로그인이 필요한 기능입니다.")
        if (code === ResponseCode.NOT_EXISTED_TODO) alert("삭제 된 할일입니다.")
        if (code !== ResponseCode.SUCCESS) return
    }

    const onToggleHandler = (e: MouseEvent) => {
        if (isModalOpen) return
        if ((e.target as HTMLElement).tagName === "BUTTON") return
        if ((e.target as HTMLElement).closest(".action-buttons")) return

        const newState = !updateState
        const accessToken = cookies.accessToken
        const requestBody: UpdateStateTodoRequestDto = { state: newState }
        updateStateTodoRequest(todo.id, requestBody, accessToken).then(updateStateTodoResponse)
        setUpdateState(newState)
    }

    const onUpdateButtonHandler = (todo: TodoListItems) => {
        setUpdateData({ id: todo.id, title: todo.title, content: todo.content || "" })
        setIsModalOpen(true)
    }

    const deleteTodoResponse = (responseBody: DeleteTodoResponseDto | ResponseDto | null) => {
        if (!responseBody) { alert("네트워크 이상입니다."); return }
        const { code } = responseBody
        if (code === ResponseCode.DATABASE_ERROR) alert("데이터베이스 오류입니다.")
        if (code === ResponseCode.VALIDATION_FAILED || code === ResponseCode.NOT_EXISTED_USER) alert("로그인이 필요한 기능입니다.")
        if (code === ResponseCode.NOT_EXISTED_TODO) alert("이미 삭제된 할일입니다.")
        if (code !== ResponseCode.SUCCESS) return

        alert("삭제 되었습니다.")
        setIsDeleting(false)
        onSave()
    }

    const onDeleteButtonHandler = () => {
        setIsDeleting(true)
        const accessToken = cookies.accessToken
        deleteTodoRequest(todo.id, accessToken).then(deleteTodoResponse)
    }

    const formatDate = (dateString: Date | string) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(date)
    }

    return (
        <div className={`group bg-[#111118] border rounded-2xl overflow-hidden transition-all duration-200 ${
            isExpanded
                ? "border-white/[0.12] shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                : "border-white/[0.07] hover:border-white/[0.12]"
        }`}>
            <div
                className="p-4 cursor-pointer"
                onClick={onToggleHandler}
            >
                <div className="flex items-start gap-3">
                    {/* 커스텀 체크박스 */}
                    <div
                        className={`flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 cursor-pointer transition-all duration-200 ${
                            updateState
                                ? "bg-gradient-to-br from-indigo-500 to-violet-600 border-transparent shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                                : "border-white/[0.15] bg-transparent hover:border-white/30"
                        }`}
                        onClick={(e) => { e.stopPropagation(); onToggleHandler(e) }}
                    >
                        {updateState && (
                            <Check size={11} className="text-white" strokeWidth={3} />
                        )}
                    </div>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                        <div
                            className="flex items-center justify-between gap-2"
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded) }}
                        >
                            <h3 className={`font-medium text-sm leading-snug transition-all duration-200 ${
                                updateState
                                    ? "text-slate-600 line-through"
                                    : "text-slate-100"
                            }`}>
                                {todo.title}
                            </h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {todo.content && (
                                    <ChevronDown
                                        size={14}
                                        className={`text-slate-600 group-hover:text-slate-500 transition-all duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                    />
                                )}
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-700 mt-1">{formatDate(todo.regDate)}</p>

                        {/* 확장 내용 */}
                        <AnimatePresence>
                            {isExpanded && todo.content && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="overflow-hidden"
                                >
                                    <p className="mt-3 pt-3 border-t border-white/[0.06] text-slate-400 text-sm leading-relaxed">
                                        {todo.content}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* 액션 버튼 */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="action-buttons flex justify-end gap-1.5 px-4 pb-3 pt-1 border-t border-white/[0.05]">
                            {!updateState && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onUpdateButtonHandler(todo) }}
                                    className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-400 border border-white/[0.06] hover:border-indigo-500/20 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200"
                                >
                                    <Edit size={12} />
                                    수정
                                </button>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeleteButtonHandler() }}
                                disabled={isDeleting}
                                className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-red-500/10 text-slate-500 hover:text-red-400 border border-white/[0.06] hover:border-red-500/20 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : (
                                    <Trash2 size={12} />
                                )}
                                삭제
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isModalOpen && (
                <div className="isolate isolation-auto fixed z-50">
                    <TodoModal isOpen={isModalOpen} onSave={onSave} onClose={() => setIsModalOpen(false)} initialData={updateData} />
                </div>
            )}
        </div>
    )
}
