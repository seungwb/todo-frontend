import type React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, CheckSquare } from "lucide-react"
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
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-4">
                    {/* 오버레이 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />

                    {/* 모달 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 20 }}
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        className="relative w-full max-w-md bg-[#111118] border border-white/[0.09] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden"
                    >
                        {/* 상단 컬러 바 */}
                        <div className="h-px bg-gradient-to-r from-indigo-500/60 via-violet-500/60 to-transparent" />

                        <div className="p-5">
                            {/* 헤더 */}
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 bg-indigo-500/15 rounded-lg flex items-center justify-center">
                                        <CheckSquare size={14} className="text-indigo-400" />
                                    </div>
                                    <h2 className="text-sm font-semibold text-slate-100">
                                        {initialData ? "할일 수정" : "새 할일 추가"}
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
                                >
                                    <X size={15} />
                                </button>
                            </div>

                            {/* 폼 */}
                            <div className="space-y-3">
                                <div>
                                    <label htmlFor="title" className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
                                        제목 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={onChangeHandler}
                                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { initialData ? onUpdateButtonHandler() : onSubmitButtonHandler() } }}
                                        placeholder="할일 제목을 입력하세요"
                                        className={`w-full bg-white/[0.04] border rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-700 outline-none transition-all duration-200 ${
                                            error
                                                ? "border-red-500/40 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10"
                                                : "border-white/[0.08] focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10"
                                        }`}
                                        autoFocus
                                    />
                                    {error && (
                                        <p className="text-[11px] text-red-400 mt-1.5">{error}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="content" className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
                                        내용 <span className="text-slate-700">(선택)</span>
                                    </label>
                                    <textarea
                                        id="content"
                                        name="content"
                                        value={formData.content}
                                        onChange={onChangeHandler}
                                        placeholder="상세 내용을 입력하세요"
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-700 outline-none transition-all duration-200 focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 resize-none h-28"
                                    />
                                </div>
                            </div>

                            {/* 버튼 */}
                            <div className="flex gap-2 mt-5">
                                <button
                                    onClick={onClose}
                                    className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={initialData ? onUpdateButtonHandler : onSubmitButtonHandler}
                                    disabled={isSaving}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(99,102,241,0.25)]"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" />
                                            {initialData ? "수정 중..." : "추가 중..."}
                                        </>
                                    ) : initialData ? "수정하기" : "추가하기"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default TodoModal
