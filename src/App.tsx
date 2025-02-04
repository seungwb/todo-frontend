import React from 'react';
import './index.css';
import CalendarListItem from "./components/CalendarListItem";
import Header from "./layouts/Header";
import Calendar from "./views/Calendar";
import InputBox from "./components/InputBox";
import Authentication from "./views/Authentication";


//          component Application 컴포넌트          //
function App() {
    //          render: Application 컴포넌트 렌더링         //
    //          description: 메인 화면 '/index' -Main         //
    //          description: 로그인 + 회원가입 화면 '/auth' -Authentication         //
    //          description:          //
    return (
        <>
            <Authentication/>

        </>
    );
}

export default App;

