"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, CheckSquare, LogIn, LogOut, User } from "lucide-react"
import { AUTH_PATH, CALENDAR_PATH, MAIN_PATH, MYPAGE_PATH, TODO_PATH } from "../../constants"
import { deleteCookie, getCookie } from "../../utils/cookie"

export default function Header() {
    const navigate = useNavigate()
    const location = useLocation()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    const isLoggedIn = !!getCookie("accessToken")

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 8)
        }
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleAuthClick = () => {
        if (isLoggedIn) {
            deleteCookie("accessToken")
            navigate(MAIN_PATH)
            window.location.reload()
        } else {
            navigate(AUTH_PATH)
        }
        setIsMenuOpen(false)
    }

    const navItems = [
        { name: "홈", path: MAIN_PATH, requireAuth: false },
        { name: "일정관리", path: CALENDAR_PATH, requireAuth: true },
        { name: "할일 목록", path: TODO_PATH, requireAuth: true },
        { name: "마이페이지", path: MYPAGE_PATH, requireAuth: true },
    ]

    const isActivePath = (path: string) => location.pathname === path

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? "bg-[#09090f]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)]"
                    : "bg-[#09090f]/80 backdrop-blur-md border-b border-white/[0.04]"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">

                    {/* Logo */}
                    <Link to={MAIN_PATH} className="flex items-center gap-2.5 shrink-0 group">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_0_12px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_18px_rgba(99,102,241,0.5)] transition-all duration-300">
                            <CheckSquare size={14} className="text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-[15px] font-semibold text-slate-100 tracking-tight">
                            Todo<span className="text-indigo-400">App</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-0.5">
                        {navItems.map((item) => {
                            const to = item.requireAuth && !isLoggedIn ? AUTH_PATH : item.path
                            const active = isActivePath(item.path)
                            return (
                                <Link
                                    key={item.name}
                                    to={to}
                                    className={`relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        active
                                            ? "text-white bg-white/[0.08]"
                                            : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]"
                                    }`}
                                >
                                    {item.name}
                                    {active && (
                                        <span className="absolute bottom-0 left-3.5 right-3.5 h-px rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 opacity-70" />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Desktop auth button */}
                    <div className="hidden md:flex items-center gap-2">
                        {isLoggedIn && (
                            <Link
                                to={MYPAGE_PATH}
                                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                                    isActivePath(MYPAGE_PATH)
                                        ? "bg-indigo-500/20 text-indigo-400"
                                        : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]"
                                }`}
                                title="마이페이지"
                            >
                                <User size={15} />
                            </Link>
                        )}
                        <button
                            onClick={handleAuthClick}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isLoggedIn
                                    ? "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                                    : "text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_14px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                            }`}
                        >
                            {isLoggedIn
                                ? <><LogOut size={14} />로그아웃</>
                                : <><LogIn size={14} />로그인</>
                            }
                        </button>
                    </div>

                    {/* Mobile menu toggle */}
                    <div className="md:hidden">
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-all duration-200"
                            aria-label="메뉴 열기"
                        >
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-250 ${
                    isMenuOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="px-4 pt-2 pb-4 border-t border-white/[0.05] space-y-0.5">
                    {navItems.map((item) => {
                        const to = item.requireAuth && !isLoggedIn ? AUTH_PATH : item.path
                        const active = isActivePath(item.path)
                        return (
                            <Link
                                key={item.name}
                                to={to}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    active
                                        ? "text-white bg-white/[0.08]"
                                        : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]"
                                }`}
                            >
                                {item.name}
                            </Link>
                        )
                    })}
                    <div className="pt-2">
                        <button
                            onClick={handleAuthClick}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isLoggedIn
                                    ? "text-slate-400 hover:text-slate-200 bg-white/[0.04] hover:bg-white/[0.08]"
                                    : "text-white bg-indigo-600 hover:bg-indigo-500"
                            }`}
                        >
                            {isLoggedIn
                                ? <><LogOut size={14} />로그아웃</>
                                : <><LogIn size={14} />로그인</>
                            }
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}
