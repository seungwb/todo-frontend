import {SignInRequestDto} from './request/auth';
import axios from 'axios';
import {SignInResponseDto, SignUpResponseDto} from './response/auth';
import {ResponseDto} from './response';
import {PostScheduleRequestDto} from "./request/schedule";
import {
    DeleteScheduleResponseDto,
    GetScheduleResponseDto,
    PostScheduleResponseDto,
    UpdateScheduleResponseDto
} from "./response/schedule";

const DOMAIN = 'http://localhost:4000';

const API_DOMAIN = `${DOMAIN}/api`

const authorization = (accessToken: string) => {
    return { headers: { Authorization: `Bearer ${accessToken}` } }
};

const SIGN_IN_URL = () => `${API_DOMAIN}/auth/sign-in`;
const SIGN_UP_URL = () => `${API_DOMAIN}/auth/sign-up`;

const SCHEDULE_URL = () =>`${API_DOMAIN}/schedule`

const SCHEDULE_ID_URL = (id) =>`${API_DOMAIN}/schedule/${id}`

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

export const getScheduleRequest = async (accessToken:string) => {
    const result = await axios.get(SCHEDULE_URL(), authorization(accessToken))
        .then(response => {
            const responseBody: GetScheduleResponseDto = response.data;
            return responseBody;
        }).catch(error => {
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const deleteScheduleRequest = async (id: number, accessToken: string)=>{
    const result = await axios.delete(SCHEDULE_ID_URL(id), authorization(accessToken))
        .then(response =>{
            const responseBody: DeleteScheduleResponseDto = response.data;
            return responseBody
        }).catch(error =>{
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const updateScheduleRequest = async (id: number, accessToken: string) =>{
    const result = await axios.put(SCHEDULE_ID_URL(id), authorization(accessToken))
        .then(response =>{
            const responseBody: UpdateScheduleResponseDto = response.data;
            return responseBody
        }).catch(error =>{
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}