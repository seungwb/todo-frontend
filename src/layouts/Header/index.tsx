"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu } from "lucide-react"
import { AUTH_PATH, CALENDAR_PATH, MAIN_PATH, TODO_PATH } from "../../constants"
import { deleteCookie, getCookie } from "../../utils/cookie"
import logo from "../../assets/logo.svg"

export default function Header() {
    const navigate = useNavigate()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const isLoggedIn = !!getCookie("accessToken")

    const handleAuthClick = () => {
        if (isLoggedIn) {
            deleteCookie("accessToken")
            window.location.reload()
        } else {
            navigate(AUTH_PATH)
        }
    }

    const navItems = [
        { name: "메인화면", path: MAIN_PATH },
        { name: "일정관리", path: CALENDAR_PATH },
        { name: "할일 목록", path: TODO_PATH },
    ]

    return (
        <header className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
                    <div className="flex justify-start lg:w-0 lg:flex-1">
                        <Link to={MAIN_PATH}>
                            <img src={logo || "/placeholder.svg"} alt="Logo" className="h-12 w-auto sm:h-16" />
                        </Link>
                    </div>
                    <div className="-mr-2 -my-2 md:hidden">
                        <button
                            type="button"
                            className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <span className="sr-only">Open menu</span>
                            <Menu className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <nav className="hidden md:flex space-x-10">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className="text-base font-medium text-white hover:text-gray-200 transition duration-150 ease-in-out"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                    <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
                        <button
                            className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            onClick={handleAuthClick}
                        >
                            {isLoggedIn ? "로그아웃" : "로그인"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-gray-200 hover:bg-indigo-600 transition duration-150 ease-in-out"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
                <div className="pt-4 pb-3 border-t border-indigo-700">
                    <div className="px-2">
                        <button
                            className="block w-full px-5 py-3 text-center font-medium text-indigo-600 bg-white rounded-md hover:bg-gray-100"
                            onClick={() => {
                                handleAuthClick()
                                setIsMenuOpen(false)
                            }}
                        >
                            {isLoggedIn ? "로그아웃" : "로그인"}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

