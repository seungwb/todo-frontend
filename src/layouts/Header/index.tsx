"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { AUTH_PATH, CALENDAR_PATH, MAIN_PATH, TODO_PATH } from "../../constants"
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
        { name: "메인화면", path: MAIN_PATH, requireAuth: false },
        { name: "일정관리", path: CALENDAR_PATH, requireAuth: true },
        { name: "할일 목록", path: TODO_PATH, requireAuth: true },
    ]

    const isActivePath = (path: string) => location.pathname === path

    return (
        <header
            className={`sticky top-0 z-50 bg-[#0d0d12]/90 backdrop-blur-xl border-b border-white/[0.06] transition-all duration-200 ${
                isScrolled ? "shadow-[0_4px_24px_rgba(0,0,0,0.4)]" : ""
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to={MAIN_PATH} className="flex items-center gap-2 shrink-0">
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                            TodoApp
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const to = item.requireAuth && !isLoggedIn ? AUTH_PATH : item.path
                            const active = isActivePath(item.path)
                            return (
                                <Link
                                    key={item.name}
                                    to={to}
                                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        active
                                            ? "text-white bg-white/[0.08]"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                    }`}
                                >
                                    {item.name}
                                    {active && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Desktop auth button */}
                    <div className="hidden md:flex items-center">
                        <button
                            onClick={handleAuthClick}
                            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 transition-all duration-200 shadow-[0_2px_12px_rgba(99,102,241,0.3)]"
                        >
                            {isLoggedIn ? "로그아웃" : "로그인"}
                        </button>
                    </div>

                    {/* Mobile menu toggle */}
                    <div className="md:hidden">
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                            aria-label="메뉴 열기"
                        >
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-200 ${
                    isMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="px-4 pt-2 pb-4 border-t border-white/[0.06] space-y-1">
                    {navItems.map((item) => {
                        const to = item.requireAuth && !isLoggedIn ? AUTH_PATH : item.path
                        const active = isActivePath(item.path)
                        return (
                            <Link
                                key={item.name}
                                to={to}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    active
                                        ? "text-white bg-white/[0.08]"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {item.name}
                            </Link>
                        )
                    })}
                    <div className="pt-2">
                        <button
                            onClick={handleAuthClick}
                            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 transition-all duration-200"
                        >
                            {isLoggedIn ? "로그아웃" : "로그인"}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}
