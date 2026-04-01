"use client"

import { useEffect, useState } from "react"
import { useCookies } from "react-cookie"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Eye, ChevronRight, Plus, X, Pencil, Trash2 } from "lucide-react"
import {
    getNoticeListRequest,
    getNoticeRequest,
    postNoticeRequest,
    updateNoticeRequest,
    deleteNoticeRequest,
} from "../../apis"
import type { GetNoticeResponseDto, PostNoticeResponseDto, UpdateNoticeResponseDto, DeleteNoticeResponseDto } from "../../apis/response/notice"
import type { ResponseDto } from "../../apis/response"
import type { NoticeListItem } from "../../types/interface"
import ResponseCode from "../../types/enum/response-code.enum"

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
}

// 날짜 포맷 헬퍼
function formatDate(dateStr: string) {
    if (!dateStr) return ""
    return dateStr.replace("T", " ").slice(0, 10)
}

// ─── 공지 작성/수정 모달 ───────────────────────────────────────────
interface NoticeModalProps {
    mode: "create" | "edit"
    initialTitle?: string
    initialContent?: string
    onClose: () => void
    onSubmit: (title: string, content: string) => void
}

function NoticeModal({ mode, initialTitle = "", initialContent = "", onClose, onSubmit }: NoticeModalProps) {
    const [title, setTitle] = useState(initialTitle)
    const [content, setContent] = useState(initialContent)

    const handleSubmit = () => {
        if (!title.trim()) { alert("제목을 입력해주세요."); return }
        if (!content.trim()) { alert("내용을 입력해주세요."); return }
        onSubmit(title, content)
    }

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                className="relative w-full max-w-lg bg-[#111118] border border-white/[0.1] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.7)] overflow-hidden"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-bold text-slate-100">
                            {mode === "create" ? "공지사항 작성" : "공지사항 수정"}
                        </h2>
                        <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="mb-4">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wider">제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="공지 제목을 입력하세요"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-100 placeholder-slate-700 text-sm focus:outline-none focus:ring-2 focus:border-indigo-500/40 focus:ring-indigo-500/10 transition-all"
                        />
                    </div>

                    <div className="mb-5">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wider">내용</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="공지 내용을 입력하세요"
                            rows={6}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-100 placeholder-slate-700 text-sm focus:outline-none focus:ring-2 focus:border-indigo-500/40 focus:ring-indigo-500/10 transition-all resize-none"
                        />
                    </div>

                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
                        >
                            {mode === "create" ? "등록" : "수정"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

// ─── 공지 상세 모달 ────────────────────────────────────────────────
interface NoticeDetailModalProps {
    notice: GetNoticeResponseDto
    isLoggedIn: boolean
    onClose: () => void
    onEdit: () => void
    onDelete: () => void
}

function NoticeDetailModal({ notice, isLoggedIn, onClose, onEdit, onDelete }: NoticeDetailModalProps) {
    const isOwner = isLoggedIn

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                className="relative w-full max-w-lg bg-[#111118] border border-white/[0.1] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.7)] overflow-hidden"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                <div className="h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <h2 className="text-base font-bold text-slate-100 leading-snug">{notice.title}</h2>
                        <button onClick={onClose} className="shrink-0 text-slate-600 hover:text-slate-300 transition-colors mt-0.5">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 mb-5">
                        <span className="text-[11px] text-slate-600">{formatDate(notice.regDate)}</span>
                        <span className="text-white/10 text-xs">·</span>
                        <span className="text-[11px] text-slate-600 flex items-center gap-1">
                            <Eye size={10} /> {notice.viewCount.toLocaleString()}
                        </span>
                    </div>

                    <div className="mb-5 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
                    </div>

                    {isOwner && (
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={onEdit}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all"
                            >
                                <Pencil size={12} /> 수정
                            </button>
                            <button
                                onClick={onDelete}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                                <Trash2 size={12} /> 삭제
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}

// ─── 메인 공지사항 페이지 ──────────────────────────────────────────
export default function Notice() {
    const [cookies] = useCookies(["accessToken"])
    const accessToken: string | undefined = cookies.accessToken

    const [noticeList, setNoticeList] = useState<NoticeListItem[]>([])
    const [selectedNotice, setSelectedNotice] = useState<GetNoticeResponseDto | null>(null)

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)

    const isLoggedIn = !!accessToken

    const loadNoticeList = () => {
        getNoticeListRequest().then((res) => {
            if (!res || res.code !== ResponseCode.SUCCESS) return
            const { noticeList } = res as { noticeList: NoticeListItem[]; code: string }
            setNoticeList(noticeList)
        })
    }

    useEffect(() => {
        loadNoticeList()
    }, [])

    const onNoticeClickHandler = (id: number) => {
        getNoticeRequest(id).then((res: GetNoticeResponseDto | ResponseDto) => {
            if (!res || res.code !== ResponseCode.SUCCESS) return
            setSelectedNotice(res as GetNoticeResponseDto)
        })
    }

    const onCreateSubmitHandler = (title: string, content: string) => {
        if (!accessToken) return
        postNoticeRequest({ title, content }, accessToken).then((res: PostNoticeResponseDto | ResponseDto) => {
            if (!res || res.code !== ResponseCode.SUCCESS) { alert("공지 등록에 실패했습니다."); return }
            setShowCreateModal(false)
            loadNoticeList()
        })
    }

    const onEditSubmitHandler = (title: string, content: string) => {
        if (!accessToken || !selectedNotice) return
        updateNoticeRequest(selectedNotice.id, { title, content }, accessToken).then((res: UpdateNoticeResponseDto | ResponseDto) => {
            if (!res || res.code !== ResponseCode.SUCCESS) { alert("공지 수정에 실패했습니다."); return }
            setShowEditModal(false)
            setSelectedNotice(null)
            loadNoticeList()
        })
    }

    const onDeleteHandler = () => {
        if (!accessToken || !selectedNotice) return
        if (!confirm("공지사항을 삭제하시겠습니까?")) return
        deleteNoticeRequest(selectedNotice.id, accessToken).then((res: DeleteNoticeResponseDto | ResponseDto) => {
            if (!res || res.code !== ResponseCode.SUCCESS) { alert("공지 삭제에 실패했습니다."); return }
            setSelectedNotice(null)
            loadNoticeList()
        })
    }

    return (
        <div className="min-h-screen bg-[#09090f] px-4 py-8 md:px-8">
            <div className="max-w-3xl mx-auto">
                {/* 페이지 헤더 */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2.5 mb-1">
                                <div className="w-7 h-7 bg-amber-500/15 rounded-lg flex items-center justify-center">
                                    <Bell size={14} className="text-amber-400" />
                                </div>
                                <h1 className="text-2xl font-bold text-slate-100 tracking-tight">공지사항</h1>
                            </div>
                            <p className="text-slate-500 text-sm pl-9.5">서비스 관련 최신 공지를 확인하세요.</p>
                        </div>
                        {isLoggedIn && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-[0_0_16px_rgba(99,102,241,0.3)]"
                            >
                                <Plus size={14} /> 공지 작성
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* 테이블 헤더 */}
                <div className="grid grid-cols-[2rem_1fr_5.5rem_4rem_1.5rem] gap-3 items-center px-4 py-2.5 mb-1">
                    <span className="text-[11px] font-medium text-slate-700 uppercase tracking-wider text-center">#</span>
                    <span className="text-[11px] font-medium text-slate-700 uppercase tracking-wider">제목</span>
                    <span className="text-[11px] font-medium text-slate-700 uppercase tracking-wider text-center">날짜</span>
                    <span className="text-[11px] font-medium text-slate-700 uppercase tracking-wider text-center flex items-center justify-center gap-1">
                        <Eye size={10} /> 조회수
                    </span>
                    <span />
                </div>

                {/* 공지 목록 */}
                {noticeList.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 text-slate-700 text-sm"
                    >
                        등록된 공지사항이 없습니다.
                    </motion.div>
                ) : (
                    <motion.ul
                        className="space-y-1"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {noticeList.map((notice, index) => (
                            <motion.li
                                key={notice.id}
                                variants={itemVariants}
                                onClick={() => onNoticeClickHandler(notice.id)}
                                className="group bg-[#111118] border border-white/[0.07] hover:border-white/[0.12] hover:bg-[#18181f] rounded-xl px-4 py-3.5 grid grid-cols-[2rem_1fr_5.5rem_4rem_1.5rem] gap-3 items-center cursor-pointer transition-all duration-200"
                            >
                                <span className="text-slate-700 text-xs text-center font-mono">{String(index + 1).padStart(2, "0")}</span>
                                <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors truncate">{notice.title}</span>
                                <span className="text-slate-600 text-xs text-center">{formatDate(notice.regDate)}</span>
                                <span className="text-slate-600 text-xs text-center">{notice.viewCount.toLocaleString()}</span>
                                <ChevronRight size={13} className="text-slate-700 group-hover:text-slate-500 transition-colors justify-self-end" />
                            </motion.li>
                        ))}
                    </motion.ul>
                )}
            </div>

            {/* 모달들 */}
            <AnimatePresence>
                {selectedNotice && !showEditModal && (
                    <NoticeDetailModal
                        key="detail"
                        notice={selectedNotice}
                        isLoggedIn={isLoggedIn}
                        onClose={() => setSelectedNotice(null)}
                        onEdit={() => setShowEditModal(true)}
                        onDelete={onDeleteHandler}
                    />
                )}
                {showEditModal && selectedNotice && (
                    <NoticeModal
                        key="edit"
                        mode="edit"
                        initialTitle={selectedNotice.title}
                        initialContent={selectedNotice.content}
                        onClose={() => setShowEditModal(false)}
                        onSubmit={onEditSubmitHandler}
                    />
                )}
                {showCreateModal && (
                    <NoticeModal
                        key="create"
                        mode="create"
                        onClose={() => setShowCreateModal(false)}
                        onSubmit={onCreateSubmitHandler}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
