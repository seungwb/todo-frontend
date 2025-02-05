import React, {ChangeEvent, KeyboardEvent, useRef, useState} from "react";
import InputBox from "../../components/InputBox";
import {SignInRequestDto} from "../../apis/request/auth";
import {signInRequest} from "../../apis";
import {SignInResponseDto} from "../../apis/response/auth";
import {ResponseDto} from "../../apis/response";
import {useCookies} from "react-cookie";
import {useNavigate} from "react-router-dom";
import {MAIN_PATH} from "../../constants";

export default function Authentication() {
    // ✅ 현재 화면 상태 (로그인 / 회원가입)
    const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-in');

    // 쿠키 상태
    const [cookies, setCookie] = useCookies();

    // 네비게이터 함수
    const navigator = useNavigate();

    // 🔹 로그인 폼
    const SignInCard = () => {
        //          state: 이메일 요소 참조 상태          //
        const emailRef = useRef<HTMLInputElement | null>(null);
        //          state: 비밀번호 요소 참조 상태          //
        const passwordRef = useRef<HTMLInputElement | null>(null);
        //          state: 이메일 상태          //
        const [email, setEmail] = useState<string>('');
        //          state: 비밀번호 상태          //
        const [password, setPassword] = useState<string>('');
        //function : sign in response 처리 함수
        const signInResponse = (responseBody: SignInResponseDto | ResponseDto | null) =>{
            if(!responseBody){
                alert('네트워크 이상입니다.')
                return;
            }
            const {code} = responseBody;
            if(code ==='DBE') alert('데이터베이스 오류입니다.');
            if(code==='SF' || code==='VF') alert('로그인 정보가 틀렸습니다');
            if(code!=='SU') return;

            const {token, expirationTime} = responseBody as SignInResponseDto;
            const now = new Date().getTime();
            console.log('now : '+now);
            console.log('token : '+token);
            console.log('expirationTime : ' + expirationTime);
            const expires = new Date(now + expirationTime * 1000);
            console.log(expires);
            setCookie('accessToken', token, {expires, path: MAIN_PATH});
            navigator(MAIN_PATH);

        }
        //          event handler:  이메일 변경 이벤트 처리          //
        const onEmailChangeHandler = (e: ChangeEvent<HTMLInputElement>) =>{
            const {value} = e.target;
            setEmail(value);
        }
        //          event handler:  비밀번호 변경 이벤트 처리          //
        const onPasswordChangeHandler = (e: ChangeEvent<HTMLInputElement>) =>{
            const {value} = e.target;
            setPassword(value);
        }
        //          event handler:  로그인 버튼 클릭 이벤트 처리          //
        const onSignIngButtonClickHandler = () =>{
            const requestBody: SignInRequestDto = {email, password};
            signInRequest(requestBody).then(signInResponse);
        }

        //          event handler: 이메일 인풋 키 다운 이벤트 처리          //
        const onEmailKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) =>{
            if(e.key !== 'Enter') return;
            if(!passwordRef.current) return;
            passwordRef.current?.focus();
        }

        //          event handler: 비밀번호 인풋 키 다운 이벤트 처리          //
        const onPasswordKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) =>{
            if(e.key !== 'Enter') return;
            onSignIngButtonClickHandler();
        }

        //          render: sign in card 컴포넌트 렌더링          //
        return (
            <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-center mb-4">로그인</h2>
                <form>
                    <InputBox
                        ref = {emailRef}
                        label = "이메일 주소"
                        type = "text"
                        placeholder={'이메일을 입력해주세요.'}
                        value={email}
                        onChange={onEmailChangeHandler}
                        onKeyDown={onEmailKeyDownHandler}
                        errorMessage={'비밀번호가 유효하지 않습니다'}
                        error={true}
                        onValidate={(value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)}
                    />
                    <InputBox
                        ref = {passwordRef}
                        label = "비밀번호"
                        type = "password"
                        placeholder={'비밀번호를 입력해주세요.'}
                        value={password}
                        onChange={onPasswordChangeHandler}
                        onKeyDown={onPasswordKeyDownHandler}
                        errorMessage={'비밀번호가 유효하지 않습니다'}
                        error={true}
                        onValidate={(value) => value.length >= 8}
                    />
                    <div
                        onClick={onSignIngButtonClickHandler}
                        className="w-full bg-blue-500 justify-center items-center hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4"
                    >
                        로그인
                    </div>
                    <p className="text-center text-sm mt-4">
                        아이디가 없다면?{" "}
                        <span className="text-blue-500 cursor-pointer" onClick={() => setView("sign-up")}>
                            회원가입
                        </span>
                    </p>
                </form>
            </div>
        );
    };

    // 🔹 회원가입 폼
    const SignUpCard = () => {
        return (
            <div></div>
        );
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            {view === "sign-in" ? <SignInCard /> : <SignUpCard />}
        </div>
    );
}
