import React from 'react';
import logo from '../../assets/logo.svg';
import loginLogo from '../../assets/login-logo.svg'
import {useNavigate} from "react-router-dom";
import {AUTH_PATH, NOTICE_PATH} from "../../constants";

export default function Header(){
    // 네비게이터 함수
    const navigator = useNavigate();

    return(
        <div className="flex flex-row p-12 justify-between items-center h-24 bg-indigo-300">
            <div className="flex flex-row gap-16 h-max">
                <div>
                    <img src={logo} className="w-24 h-24 object-contain"/>
                </div>
                <div
                    className="flex justify-between items-center text-white text-lg font-semibold cursor-pointer"
                    onClick={() => navigator("/")}
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
                <div className="flex justify-between items-center cursor-pointer">
                    <img src={loginLogo}
                         className="object-contain"
                         onClick={()=> navigator(AUTH_PATH)}/>
                </div>
            </div>
        </div>
    )
}