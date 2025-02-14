import React, {useState} from 'react';
import logo from '../../assets/logo.svg';
import loginLogo from '../../assets/login-logo.svg'
import {useNavigate} from "react-router-dom";
import {AUTH_PATH, CALENDAR_PATH, MAIN_PATH, NOTICE_PATH} from "../../constants";
import {deleteCookie, getCookie} from "../../utils/cookie";

export default function Header(){
    // 네비게이터 함수
    const navigator = useNavigate();

    const isLoggedIn = !!getCookie("accessToken");

    const handleAuthClick = () => {
        if (isLoggedIn) {
            // 로그아웃: 쿠키 삭제
            deleteCookie("accessToken");
            window.location.reload(); // 새로고침으로 UI 업데이트
        } else {
            // 로그인 페이지로 이동
            navigator(AUTH_PATH);
        }
    };

    return(
        <div className="flex flex-row p-12 justify-between items-center h-24 bg-indigo-300">
            <div className="flex flex-row gap-16 h-max">
                <div>
                    <img src={logo} className="w-24 h-24 object-contain"/>
                </div>
                <div
                    className="flex justify-between items-center text-white text-lg font-semibold cursor-pointer"
                    onClick={() => navigator(MAIN_PATH)}
                >
                    {'메인화면'}
                </div>
                <div
                    className="flex justify-between items-center text-white text-lg font-semibold cursor-pointer"
                    onClick={() => navigator(CALENDAR_PATH)}
                >
                    {'일정관리'}
                </div>
                <div
                    className="flex justify-between items-center text-white text-lg font-semibold cursor-pointer"
                    onClick={() => navigator(NOTICE_PATH)}
                >
                    {'공지사항'}
                </div>
            </div>
            <div className="flex flex-row">
                <button
                    className="px-4 py-2 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-indigo-500 transition-colors"
                    onClick={handleAuthClick}
                >
                    {isLoggedIn ? "로그아웃" : "로그인"}
                </button>
            </div>
            {/*<div className="flex flex-row">*/}
            {/*    <div className="flex justify-between items-center cursor-pointer">*/}
            {/*        <img src={loginLogo}*/}
            {/*             className="object-contain"*/}
            {/*             onClick={()=> navigator(AUTH_PATH)}/>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    )
}