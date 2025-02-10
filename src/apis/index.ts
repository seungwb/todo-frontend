import {SignInRequestDto} from './request/auth';
import axios from 'axios';
import {SignInResponseDto, SignUpResponseDto} from './response/auth';
import {ResponseDto} from './response';
import {PostScheduleRequestDto} from "./request/calendar";
import {PostScheduleResponseDto} from "./response/calendar";

const DOMAIN = 'http://localhost:4000';

const API_DOMAIN = `${DOMAIN}/api`

const authorization = (accessToken: string) => {
    return { headers: { Authorization: `Bearer ${accessToken}` } }
};

const SIGN_IN_URL = () => `${API_DOMAIN}/auth/sign-in`;
const SIGN_UP_URL = () => `${API_DOMAIN}/auth/sign-up`;

const SCHEDULE_URL = () =>`${API_DOMAIN}/schedule`

export const signInRequest = async (requestBody: SignInRequestDto) =>{
    const result = await axios.post(SIGN_IN_URL(), requestBody)
        .then(response=>{
            const responseBody: SignInResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}


export const signUpRequest = async (requestBody: SignInRequestDto) => {
    const result = await axios.post(SIGN_UP_URL(), requestBody)
        .then(response => {
            const responseBody: SignUpResponseDto = response.data;
            return responseBody;
        }).catch(error => {
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const postScheduleRequest = async (requestBody: PostScheduleRequestDto, accessToken:string) => {
    const result = await axios.post(SCHEDULE_URL(), requestBody, authorization(accessToken))
        .then(response => {
            const responseBody: PostScheduleResponseDto = response.data;
            return responseBody;
        }).catch(error => {
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}