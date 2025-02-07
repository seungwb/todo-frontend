import React, {useState} from 'react';
import './index.css';
import Calendar from "./views/Calendar";
import Authentication from "./views/Authentication";
import {Routes, Route} from "react-router-dom";
import {AUTH_PATH, MAIN_PATH, NOTICE_PATH} from "./constants";
import Container from './layouts/Container'
import Notice from "./views/Notice";


//          component Application 컴포넌트          //
function App() {
    //          render: Application 컴포넌트 렌더링         //
    //          description: 메인 화면 '/index' -Main         //
    //          description: 로그인 + 회원가입 화면 '/auth' -Authentication         //
    //          description:          //
    return (
        <Routes>
            <Route element = {<Container />}>
                <Route path ={MAIN_PATH} element = {<Calendar/>}/>
                <Route path ={AUTH_PATH} element = {<Authentication/>}/>
                <Route path = {NOTICE_PATH} element= {<Notice/>}/>
            </Route>
        </Routes>
    );
}

export default App;

