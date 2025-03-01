import { useState } from "react"
import { motion } from "framer-motion"
import { Edit, Trash2, Check, ChevronDown, Loader2 } from "lucide-react"
import type { DeleteTodoResponseDto, UpdateStateTodoResponseDto } from "../../apis/response/todo"
import type { ResponseDto } from "../../apis/response"
import { useCookies } from "react-cookie"
import type { UpdateStateTodoRequestDto } from "../../apis/request/todo"
import { deleteTodoRequest, updateStateTodoRequest } from "../../apis"
import TodoModal from "../TodoModal"

export default function TodoListItem({ todo, onSave }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [updateData, setUpdateData] = useState({
        id: 0,
        title: "",
        content: "",
    })
    const [updateState, setUpdateState] = useState(todo.state)
    const [cookies] = useCookies()

    const updateStateTodoResponse = (responseBody: UpdateStateTodoResponseDto | ResponseDto | null) => {
        if (!responseBody) {
            alert("네트워크 이상입니다.")
            return
        }
        const { code } = responseBody
        if (code === "DBE") alert("데이터베이스 오류입니다.")
        if (code === "VF" || code === "NU") alert("로그인이 필요한 기능입니다.")
        if (code === "NT") alert("삭제 된 할일입니다.")
        if (code !== "SU") return
    }

    const onToggleHandler = (e) => {
        if (isModalOpen) return
        if (e.target.tagName === "BUTTON") return
        if (e.target.closest(".action-buttons")) return

        const newState = !updateState
        const accessToken = cookies.accessToken

        const requestBody: UpdateStateTodoRequestDto = {
            state: newState,
        }

        updateStateTodoRequest(todo.id, requestBody, accessToken).then(updateStateTodoResponse)
        setUpdateState(newState)
    }

    const onUpdateButtonHandler = (todo) => {
        setUpdateData({
            id: todo.id,
            title: todo.title,
            content: todo.content,
        })
        setIsModalOpen(true)
    }

    const deleteTodoResponse = (responseBody: DeleteTodoResponseDto | ResponseDto | null) => {
        if (!responseBody) {
            alert("네트워크 이상입니다.")
            return
        }
        const { code } = responseBody
        if (code === "DBE") alert("데이터베이스 오류입니다.")
        if (code === "VF" || code === "NU") alert("로그인이 필요한 기능입니다.")
        if (code === "NT") alert("이미 삭제된 일정입니다.")
        if (code !== "SU") return

        alert("삭제 되었습니다.")
        setIsDeleting(false)
        onSave()
    }

    const onDeleteButtonHandler = () => {
        setIsDeleting(true)
        const id = todo.id
        const accessToken = cookies.accessToken
        deleteTodoRequest(id, accessToken).then(deleteTodoResponse)
    }

    const formatDate = (dateString) => {
        if (!dateString) return ""

        const date = new Date(dateString)
        return new Intl.DateTimeFormat("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date)
    }

    return (
        <div
            className={`bg-white rounded-lg shadow-sm border-l-4 transition-all hover:shadow-md overflow-hidden ${
                updateState ? "border-violet-500" : "border-slate-300 opacity-70"
            }`}
        >
            <div className="p-5" onClick={onToggleHandler}>
                <div className="flex items-start gap-3">
                    <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center mt-1 cursor-pointer transition-colors ${
                            updateState ? "border-slate-300 bg-white text-white" : "border-slate-300 bg-violet-500 text-white"
                        }`}
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggleHandler(e)
                        }}
                    >
                        {!updateState && <Check size={14} />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation()
                                setIsExpanded(!isExpanded)
                            }}
                        >
                            <h3
                                className={`font-medium text-lg transition-all ${
                                    updateState ? "text-slate-900" : "text-slate-500 line-through"
                                }`}
                            >
                                {todo.title}
                            </h3>
                            <ChevronDown
                                size={18}
                                className={`text-slate-400 transition-transform duration-200 ${
                                    isExpanded ? "transform rotate-180" : ""
                                }`}
                            />
                        </div>

                        <p className="text-sm text-slate-500 mt-1">등록일: {formatDate(todo.regDate)}</p>

                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-3 text-slate-600"
                            >
                                {todo.content}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="action-buttons flex justify-end gap-2 p-3 pt-0 border-t border-slate-100">
                        {updateState && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onUpdateButtonHandler(todo)
                                }}
                                className="bg-amber-500 text-white py-1.5 px-4 rounded-md hover:bg-amber-600 transition-colors text-sm font-medium flex items-center"
                            >
                                <Edit size={14} className="mr-1.5" /> 수정
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onDeleteButtonHandler()
                            }}
                            disabled={isDeleting}
                            className="bg-red-500 text-white py-1.5 px-4 rounded-md hover:bg-red-600 transition-colors text-sm font-medium flex items-center disabled:opacity-70"
                        >
                            {isDeleting ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                    className="mr-1.5"
                                >
                                    <Loader2 size={14} />
                                </motion.div>
                            ) : (
                                <Trash2 size={14} className="mr-1.5" />
                            )}
                            삭제
                        </button>
                    </div>
                </motion.div>
            )}

            {isModalOpen && (
                <div className="isolate isolation-auto fixed z-50">
                    <TodoModal
                        isOpen={isModalOpen}
                        onSave={onSave}
                        onClose={() => setIsModalOpen(false)}
                        initialData={updateData}
                    />
                </div>
            )}
        </div>
    )
}
