import React, {ChangeEvent, KeyboardEvent, useRef, useState} from 'react';
import InputBox from '../../components/InputBox';
import {SignInRequestDto, SignUpRequestDto} from '../../apis/request/auth';
import {signInRequest, signUpRequest} from '../../apis';
import {SignInResponseDto, SignUpResponseDto} from '../../apis/response/auth';
import {ResponseDto} from '../../apis/response';
import {useCookies} from 'react-cookie';
import {useNavigate} from 'react-router-dom';
import {CALENDAR_PATH, MAIN_PATH} from '../../constants';

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
        //          state: 에러 상태          //
        //function : sign in response 처리 함수
        const signInResponse = (responseBody: SignInResponseDto | ResponseDto | null) =>{
            if(!responseBody){
                alert('네트워크 이상입니다.')
                return;
            }
            const {code} = responseBody;
            if(code ==='DBE') alert('데이터베이스 오류입니다.');

            if(code==='SF' || code==='VF') alert('로그인 정보를 확인해주세요.');

            if(code!=='SU') return;

            const {token, expirationTime} = responseBody as SignInResponseDto;
            const now = new Date().getTime();
            const expires = new Date(now + expirationTime * 1000);
            setCookie('accessToken', token, {expires, path: MAIN_PATH});
            navigator(CALENDAR_PATH);

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
        const onSignInButtonClickHandler = () =>{
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
            onSignInButtonClickHandler();
        }

        //          render: sign in card 컴포넌트 렌더링          //
        return (
            <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
                <div className="text-2xl font-semibold text-center mb-4">로그인</div>
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
                        onClick={onSignInButtonClickHandler}
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
            </div>
        );
    };

    //          component: 회원가입 컴포넌트          //
    const SignUpCard = () => {
        //          state: 이름 요소 참조 상태          //
        const nameRef = useRef<HTMLInputElement | null>(null);
        //          state: 이메일 요소 참조 상태          //
        const emailRef = useRef<HTMLInputElement | null>(null);
        //          state: 패스워드 요소 참조 상태          //
        const passwordRef = useRef<HTMLInputElement | null>(null);
        //          state: 패스워드 확인 요소 참조 상태          //
        const passwordCheckRef = useRef<HTMLInputElement | null>(null);
        //          state: 휴대폰 번호 요소 참조 상태          //
        const phoneRef = useRef<HTMLInputElement | null>(null);
        //          state: 이름 상태          //
        const [name, setName] = useState<string>('');
        //          state: 이메일 상태          //
        const [email, setEmail] = useState<string>('');
        //          state: 패스워드 상태          //
        const [password, setPassword] = useState<string>('');
        //          state: 패스워드 확인 상태          //
        const [passwordCheck, setPasswordCheck] = useState<string>('');
        //          state: 휴대폰번호 상태          //
        const [phone, setPhone] = useState<string>('');
        //          event handler: 이름 변경 이벤트 처리          //
        const onNameChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;
            setName(value);
        }
        //          event handler: 이메일 변경 이벤트 처리          //
        const onEmailChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;
            setEmail(value);
        }
        //          event handler: 비밀번호 변경 이벤트 처리          //
        const onPasswordChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;
            setPassword(value);
        }
        //          event handler: 비밀번호 확인 변경 이벤트 처리          //
        const onPasswordCheckChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;
            setPasswordCheck(value);
        }
        //          event handler: 휴대번호 변경 이벤트 처리          //
        const onPhoneChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;
            setPhone(value);
        }
        //          event handler: 이름 키 다운 이벤트 처리          //
        const onNameKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => {
            if(e.key !== 'Enter') return;
            if(!emailRef.current) return;
            emailRef.current?.focus();
        }
        //          event handler: 이메일 키 다운 이벤트 처리          //
        const onEmailKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => {
            if(e.key !== 'Enter') return;
            if(!passwordRef.current) return;
            passwordRef.current?.focus();
        }
        //          event handler: 비밀번호 키 다운 이벤트 처리          //
        const onPasswordKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => {
            if(e.key !== 'Enter') return;
            if(!passwordCheckRef.current) return;
            passwordCheckRef.current?.focus();
        }
        //          event handler: 비밀번호 확인 키 다운 이벤트 처리          //
        const onPasswordCheckKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => {
            if(e.key !== 'Enter') return;
            if(!phoneRef.current) return;
            phoneRef.current?.focus();
        }
        //          event handler: 전화번호 키 다운 이벤트 처리          //
        const onPhoneKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) =>{
            if(e.key !== 'Enter') return;
            onSignUpButtonClickHandler();
        }
        const signUpResponse = (responseBody: SignUpResponseDto | ResponseDto | null) => {
            if (!responseBody) {
                alert('네트워크 이상입니다.')
                return;
            }
            const {code} = responseBody;
            console.log(code);
            if (code === 'DBE') {
                alert('데이터베이스 오류입니다.');
                return;
            }

            if (code === 'SF' || code === 'VF') alert('회원가입 정보를 확인해주세요.');

            if (code ==='DE') alert('동일한 이메일이 회원가입되어 있습니다.');


            if (code !== 'SU') return;
            alert('회원가입에 성공하였습니다! \n 로그인 해주세요.');

           setView('sign-in');

        }
        //          event handler: 회원가입 버튼 클릭 핸들러          //
        const onSignUpButtonClickHandler = ()=> {
            const requestBody: SignUpRequestDto = {name, email, password, phone};
            signUpRequest(requestBody).then(signUpResponse);
        }




            //          render: sign up card 렌더링          //
        return (
            <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
                <div className="text-2xl font-semibold text-center mb-4">로그인</div>
                <InputBox
                    ref={nameRef}
                    label="이름"
                    type="text"
                    placeholder={'성함을 입력해주세요.'}
                    value={name}
                    onChange={onNameChangeHandler}
                    onKeyDown={onNameKeyDownHandler}
                    errorMessage={'유효한 이름을 입력하세요.'}
                    error={true}
                    onValidate={(value) => value.length >= 2}
                />
                <InputBox
                    ref={emailRef}
                    label="이메일 주소"
                    type="text"
                    placeholder={'이메일을 입력해주세요.'}
                    value={email}
                    onChange={onEmailChangeHandler}
                    onKeyDown={onEmailKeyDownHandler}
                    errorMessage={'이메일 형식을 입력하세요.'}
                    error={true}
                    onValidate={(value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)}
                />
                <InputBox
                    ref={passwordRef}
                    label="비밀번호"
                    type="password"
                    placeholder={'비밀번호를 입력해주세요.'}
                    value={password}
                    onChange={onPasswordChangeHandler}
                    onKeyDown={onPasswordKeyDownHandler}
                    errorMessage={'비밀번호는 8자 이상이어야 합니다.'}
                    error={true}
                    onValidate={(value) => value.length >= 8}
                />
                <InputBox
                    ref={passwordCheckRef}
                    label="비밀번호 확인"
                    type="password"
                    placeholder={'비밀번호를 재입력해주세요.'}
                    value={passwordCheck}
                    onChange={onPasswordCheckChangeHandler}
                    onKeyDown={onPasswordCheckKeyDownHandler}
                    errorMessage={'비밀번호가 같지 않습니다'}
                    error={true}
                    onValidate={(value) => value === password.valueOf()}
                />
                <InputBox
                    ref={phoneRef}
                    label="휴대전화번호"
                    type="text"
                    placeholder={'전화번호를 입력해주세요. ex)01012345678'}
                    value={phone}
                    onChange={onPhoneChangeHandler}
                    onKeyDown={onPhoneKeyDownHandler}
                    errorMessage={'유효한 전화번호를 입력해주세요.'}
                    error={true}
                    onValidate={(value) => /^[0-9]{11,13}$/.test(value)}
                />
                <div
                    onClick={onSignUpButtonClickHandler}
                    className="w-full bg-blue-500 justify-center items-center hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4"
                >
                    회원가입
                </div>
                <p className="text-center text-sm mt-4">
                    이미 계정이 있으신가요?{" "}
                    <span className="text-blue-500 cursor-pointer" onClick={() => setView("sign-in")}>
                            로그인
                        </span>
                </p>
            </div>
        );
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            {view === "sign-in" ? <SignInCard/> : <SignUpCard/>}
        </div>
    );
}
