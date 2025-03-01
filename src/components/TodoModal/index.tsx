import type React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2 } from "lucide-react"
import { useCookies } from "react-cookie"
import type { PostTodoResponseDto, UpdateTodoResponseDto } from "../../apis/response/todo"
import type { ResponseDto } from "../../apis/response"
import type { PostTodoRequestDto, UpdateTodoRequestDto } from "../../apis/request/todo"
import { postTodoRequest, updateTodoRequest } from "../../apis"

interface TodoModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: () => void
    initialData?: {
        id: number
        title: string
        content: string
    }
}

const TodoModal: React.FC<TodoModalProps> = ({ isOpen, onSave, onClose, initialData }) => {
    const [formData, setFormData] = useState({
        title: "",
        content: "",
    })
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState("")
    const [cookies] = useCookies()

    useEffect(() => {
        if (initialData) {
            // 기존 데이터가 있으면 수정 모드
            setFormData({
                title: initialData.title || "",
                content: initialData.content || "",
            })
        } else {
            // 새로운 일정 추가 시
            setFormData({
                title: "",
                content: "",
            })
        }
        setError("")
    }, [initialData])

    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        if (name === "title" && value.trim()) setError("")
    }

    const postTodoResponse = (responseBody: PostTodoResponseDto | ResponseDto | null) => {
        setIsSaving(false)
        if (!responseBody) {
            alert("네트워크 이상입니다.")
            return
        }
        const { code } = responseBody
        if (code === "DBE") alert("데이터베이스 오류입니다.")
        if (code === "VF" || code === "NU") alert("로그인이 필요한 기능입니다.")
        if (code !== "SU") return

        alert("할일이 추가 되었습니다.")
        onSave()
        onClose()
    }

    const onSubmitButtonHandler = () => {
        if (!formData.title.trim()) {
            setError("제목을 입력해주세요")
            return
        }

        setIsSaving(true)
        const accessToken = cookies.accessToken
        if (!accessToken) {
            alert("로그인이 필요한 기능입니다.")
            onClose()
            return
        }
        const requestBody: PostTodoRequestDto = {
            title: formData.title,
            content: formData.content,
        }
        postTodoRequest(requestBody, accessToken).then(postTodoResponse)
    }

    const updateTodoResponse = (responseBody: UpdateTodoResponseDto | ResponseDto | null) => {
        setIsSaving(false)
        if (!responseBody) {
            alert("네트워크 이상입니다.")
            return
        }
        const { code } = responseBody
        if (code === "DBE") alert("데이터베이스 오류입니다.")
        if (code === "VF" || code === "NU") alert("로그인이 필요한 기능입니다.")
        if (code === "NT") alert("삭제 된 할일입니다.")
        if (code !== "SU") return

        alert("할일이 수정 되었습니다.")
        onSave()
        onClose()
    }

    const onUpdateButtonHandler = () => {
        if (!formData.title.trim()) {
            setError("제목을 입력해주세요")
            return
        }

        setIsSaving(true)
        const accessToken = cookies.accessToken
        if (!accessToken) {
            alert("로그인이 필요한 기능입니다.")
            onClose()
            return
        }
        if (!initialData) {
            alert("이미 삭제된 일정입니다.")
            return
        } else {
            const requestBody: UpdateTodoRequestDto = {
                title: formData.title,
                content: formData.content,
            }
            updateTodoRequest(initialData.id, requestBody, accessToken).then(updateTodoResponse)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-slate-900">{initialData ? "할일 수정하기" : "새로운 할일"}</h2>
                            <button
                                onClick={onClose}
                                className="h-8 w-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                                        제목
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={onChangeHandler}
                                        placeholder="할일 제목을 입력하세요"
                                        className={`border ${error ? "border-red-500" : "border-slate-300"} p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors`}
                                    />
                                    {error && <p className="text-sm text-red-500">{error}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="content" className="block text-sm font-medium text-slate-700">
                                        내용
                                    </label>
                                    <textarea
                                        id="content"
                                        name="content"
                                        value={formData.content}
                                        onChange={onChangeHandler}
                                        placeholder="상세 내용을 입력하세요"
                                        className="border border-slate-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors min-h-[120px] resize-none"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="bg-slate-200 text-slate-700 py-2 px-4 rounded-md hover:bg-slate-300 transition-colors font-medium"
                            >
                                취소
                            </button>
                            <button
                                onClick={initialData ? onUpdateButtonHandler : onSubmitButtonHandler}
                                disabled={isSaving}
                                className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white py-2 px-4 rounded-md transition-colors font-medium disabled:opacity-70 flex items-center"
                            >
                                {isSaving ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                            className="mr-2"
                                        >
                                            <Loader2 size={16} />
                                        </motion.div>
                                        {initialData ? "수정 중..." : "추가 중..."}
                                    </>
                                ) : initialData ? (
                                    "수정"
                                ) : (
                                    "추가"
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default TodoModal