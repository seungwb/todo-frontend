import { motion } from "framer-motion"
import { Bell, Eye, ChevronRight } from "lucide-react"

const notices = [
    { id: 1, title: "서비스 점검 안내", date: "2025-02-07", views: 120 },
    { id: 2, title: "신규 기능 업데이트", date: "2025-02-05", views: 98 },
    { id: 3, title: "이벤트 공지", date: "2025-02-03", views: 76 },
    { id: 4, title: "고객센터 운영 시간 변경", date: "2025-02-01", views: 50 },
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06 },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
}

export default function Notice() {
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
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-7 h-7 bg-amber-500/15 rounded-lg flex items-center justify-center">
                            <Bell size={14} className="text-amber-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">공지사항</h1>
                    </div>
                    <p className="text-slate-500 text-sm pl-9.5">서비스 관련 최신 공지를 확인하세요.</p>
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
                <motion.ul
                    className="space-y-1"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {notices.map((notice, index) => (
                        <motion.li
                            key={notice.id}
                            variants={itemVariants}
                            onClick={() => alert(`공지사항 ${notice.id} 클릭!`)}
                            className="group bg-[#111118] border border-white/[0.07] hover:border-white/[0.12] hover:bg-[#18181f] rounded-xl px-4 py-3.5 grid grid-cols-[2rem_1fr_5.5rem_4rem_1.5rem] gap-3 items-center cursor-pointer transition-all duration-200"
                        >
                            <span className="text-slate-700 text-xs text-center font-mono">{String(index + 1).padStart(2, "0")}</span>
                            <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors truncate">{notice.title}</span>
                            <span className="text-slate-600 text-xs text-center">{notice.date}</span>
                            <span className="text-slate-600 text-xs text-center">{notice.views.toLocaleString()}</span>
                            <ChevronRight size={13} className="text-slate-700 group-hover:text-slate-500 transition-colors justify-self-end" />
                        </motion.li>
                    ))}
                </motion.ul>
            </div>
        </div>
    )
}
