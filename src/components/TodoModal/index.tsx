import type React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2 } from "lucide-react"
import { useCookies } from "react-cookie"
import type { PostTodoResponseDto, UpdateTodoResponseDto } from "../../apis/response/todo"
import type { ResponseDto } from "../../apis/response"
import type { PostTodoRequestDto, UpdateTodoRequestDto } from "../../apis/request/todo"
import { postTodoRequest, updateTodoRequest } from "../../apis"
import ResponseCode from "../../types/enum/response-code.enum"

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
    const [formData, setFormData] = useState({ title: "", content: "" })
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState("")
    const [cookies] = useCookies()

    useEffect(() => {
        if (initialData) {
            setFormData({ title: initialData.title || "", content: initialData.content || "" })
        } else {
            setFormData({ title: "", content: "" })
        }
        setError("")
    }, [initialData, onClose])

    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        if (name === "title" && value.trim()) setError("")
    }

    const postTodoResponse = (responseBody: PostTodoResponseDto | ResponseDto | null) => {
        setIsSaving(false)
        if (!responseBody) { alert("네트워크 이상입니다."); return }
        const { code } = responseBody
        if (code === ResponseCode.DATABASE_ERROR) alert("데이터베이스 오류입니다.")
        if (code === ResponseCode.VALIDATION_FAILED || code === ResponseCode.NOT_EXISTED_USER) alert("로그인이 필요한 기능입니다.")
        if (code !== ResponseCode.SUCCESS) return

        alert("할일이 추가 되었습니다.")
        onSave()
        onClose()
    }

    const onSubmitButtonHandler = () => {
        if (!formData.title.trim()) { setError("제목을 입력해주세요"); return }
        setIsSaving(true)
        const accessToken = cookies.accessToken
        if (!accessToken) { alert("로그인이 필요한 기능입니다."); onClose(); return }
        const requestBody: PostTodoRequestDto = { title: formData.title, content: formData.content }
        postTodoRequest(requestBody, accessToken).then(postTodoResponse)
    }

    const updateTodoResponse = (responseBody: UpdateTodoResponseDto | ResponseDto | null) => {
        setIsSaving(false)
        if (!responseBody) { alert("네트워크 이상입니다."); return }
        const { code } = responseBody
        if (code === ResponseCode.DATABASE_ERROR) alert("데이터베이스 오류입니다.")
        if (code === ResponseCode.VALIDATION_FAILED || code === ResponseCode.NOT_EXISTED_USER) alert("로그인이 필요한 기능입니다.")
        if (code === ResponseCode.NOT_EXISTED_TODO) alert("삭제 된 할일입니다.")
        if (code !== ResponseCode.SUCCESS) return

        alert("할일이 수정 되었습니다.")
        onSave()
        onClose()
    }

    const onUpdateButtonHandler = () => {
        if (!formData.title.trim()) { setError("제목을 입력해주세요"); return }
        setIsSaving(true)
        const accessToken = cookies.accessToken
        if (!accessToken) { alert("로그인이 필요한 기능입니다."); onClose(); return }
        if (!initialData) { alert("이미 삭제된 일정입니다."); return }
        const requestBody: UpdateTodoRequestDto = { title: formData.title, content: formData.content }
        updateTodoRequest(initialData.id, requestBody, accessToken).then(updateTodoResponse)
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    {/* 오버레이 클릭 닫기 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0"
                    />

                    {/* 모달 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-[#13131a] border border-white/[0.08] rounded-2xl p-6 shadow-[0_8px_48px_rgba(0,0,0,0.6)] overflow-hidden"
                    >
                        {/* 헤더 */}
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-base font-semibold text-slate-100">
                                {initialData ? "할일 수정하기" : "새 할일 추가"}
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* 폼 */}
                        <div className="space-y-4">
                            {/* 제목 */}
                            <div className="space-y-1.5">
                                <label htmlFor="title" className="block text-xs font-medium text-slate-400">
                                    제목
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={onChangeHandler}
                                    placeholder="할일 제목을 입력하세요"
                                    className={`w-full bg-white/[0.04] border rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-indigo-500/10 ${
                                        error
                                            ? "border-red-500/50 focus:border-red-500/50"
                                            : "border-white/[0.08] focus:border-indigo-500/50"
                                    }`}
                                />
                                {error && <p className="text-xs text-red-400">{error}</p>}
                            </div>

                            {/* 내용 */}
                            <div className="space-y-1.5">
                                <label htmlFor="content" className="block text-xs font-medium text-slate-400">
                                    내용 <span className="text-slate-600">(선택)</span>
                                </label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={formData.content}
                                    onChange={onChangeHandler}
                                    placeholder="상세 내용을 입력하세요"
                                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 resize-none h-32"
                                />
                            </div>
                        </div>

                        {/* 버튼 */}
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={onClose}
                                className="flex-1 bg-white/[0.06] hover:bg-white/[0.10] text-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
                            >
                                취소
                            </button>
                            <button
                                onClick={initialData ? onUpdateButtonHandler : onSubmitButtonHandler}
                                disabled={isSaving}
                                className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        {initialData ? "수정 중..." : "추가 중..."}
                                    </>
                                ) : initialData ? "수정하기" : "추가하기"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default TodoModal
