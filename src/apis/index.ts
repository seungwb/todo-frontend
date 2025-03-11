import {FindIdRequestDto, SignInRequestDto} from './request/auth';
import axios from 'axios';
import {FindIdResponseDto, SignInResponseDto, SignUpResponseDto} from './response/auth';
import {GetTodayScheduleIndexResponseDto, GetWeeklyScheduleIndexResponseDto, ResponseDto} from './response';
import {PostScheduleRequestDto, UpdateScheduleRequestDto} from "./request/schedule";
import {
    DeleteScheduleResponseDto,
    GetScheduleResponseDto,
    PostScheduleResponseDto,
    UpdateScheduleResponseDto
} from "./response/schedule";
import {PostTodoRequestDto, UpdateStateTodoRequestDto, UpdateTodoRequestDto} from "./request/todo";
import {
    DeleteTodoResponseDto,
    GetTodoResponseDto,
    PostTodoResponseDto,
    UpdateStateTodoResponseDto,
    UpdateTodoResponseDto
} from "./response/todo";
import {FindPasswordRequestDto, VerifiedNumberRequestDto} from "./request/mail";
import {FindPasswordResponseDto, VerifiedNumberResponseDto} from "./response/mail";

const DOMAIN = import.meta.env.VITE_API_URL;

const API_DOMAIN = `${DOMAIN}/api`;

const WHETHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

const authorization = (accessToken: string) => {
    return { headers: { Authorization: `Bearer ${accessToken}` } }
};

const SIGN_IN_URL = () => `${API_DOMAIN}/auth/sign-in`;

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

const SIGN_UP_URL = () => `${API_DOMAIN}/auth/sign-up`;

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

const FIND_ID_URL = () => `${API_DOMAIN}/auth/find-id`;

export const findIdRequest = async (requestBody: FindIdRequestDto) => {
    const result = await axios.post(FIND_ID_URL(), requestBody)
        .then(response =>{
            const responseBody: FindIdResponseDto = response.data;
            return responseBody;
        }).catch(error => {
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

const FIND_PASSWORD_URL = () => `${API_DOMAIN}/mail/send`;

export const findPasswordRequest = async (requestBody: FindPasswordRequestDto) => {
    const result = await axios.post(FIND_PASSWORD_URL(), requestBody)
        .then(response => {
            const responseBody: FindPasswordResponseDto = response.data;
            return responseBody;
        }).catch(error => {
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

const VERIFIED_NUMBER_URL = () => `${API_DOMAIN}/mail/verified`;

export const verifiedNumberRequest = async (requestBody: VerifiedNumberRequestDto) => {
    const result = await axios.post(VERIFIED_NUMBER_URL(), requestBody)
        .then(response => {
            const responseBody: VerifiedNumberResponseDto = response.data;
            return responseBody;
        }).catch(error => {
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

const SCHEDULE_URL = () =>`${API_DOMAIN}/schedule`;

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

const SCHEDULE_ID_URL = (id) =>`${API_DOMAIN}/schedule/${id}`;

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

export const updateScheduleRequest = async (id: number, requestBody: UpdateScheduleRequestDto, accessToken: string) =>{
    const result = await axios.put(SCHEDULE_ID_URL(id), requestBody, authorization(accessToken))
        .then(response =>{
            const responseBody: UpdateScheduleResponseDto = response.data;
            return responseBody
        }).catch(error =>{
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}
const TODAY_SCHEDULE_URL = (today) =>`${API_DOMAIN}/schedule/today?today=${today}`;

export const getTodayScheduleRequest = async (today:string, accessToken:string) => {
    const result = await axios.get(TODAY_SCHEDULE_URL(today), authorization(accessToken))
        .then(response => {
            const responseBody: GetTodayScheduleIndexResponseDto = response.data;
            return responseBody;
        }).catch(error => {
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}
const WEEKLY_SCHEDULE_URL = (start, end) =>`${API_DOMAIN}/schedule/weekly?start=${start}&end=${end}`;
export const getWeeklyScheduleRequest = async (start: string, end: string, accessToken:string) => {
    const result = await axios.get(WEEKLY_SCHEDULE_URL(start, end), authorization(accessToken))
        .then(response => {
            const responseBody: GetWeeklyScheduleIndexResponseDto = response.data;
            return responseBody;
        }).catch(error => {
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

const GET_WEATHER_URL = () =>`https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=${WHETHER_API_KEY}&units=metric&lang=kr`

export const getWeatherRequest = async ()=>{
    try {
        const response = await axios.get(GET_WEATHER_URL());
        return response.data; // ✅ JSON 데이터만 반환
    } catch (error) {
        console.error("날씨 정보를 불러오지 못했습니다.", error);
        return null; // 에러 발생 시 null 반환
    }
}

const TODO_URL = () => `${API_DOMAIN}/todo`;

export const postTodoRequest = async(requestBody: PostTodoRequestDto, accessToken: string) =>{
    const result = await axios.post(TODO_URL(), requestBody, authorization(accessToken))
        .then(response => {
            const responseBody: PostTodoResponseDto = response.data;
            return responseBody;
        }).catch(error => {
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const getTodoRequest = async (accessToken: string) =>{
    const result = await axios.get(TODO_URL(), authorization(accessToken))
        .then(response => {
            const responseBody: GetTodoResponseDto = response.data;
            return responseBody;
        }).catch(error => {
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

const TODO_UPDATE_STATE_URL = (id) => `${API_DOMAIN}/todo/toggle/${id}`;
export const updateStateTodoRequest = async (id: number, requestBody: UpdateStateTodoRequestDto, accessToken: string)=>{
    const result = await axios.put(TODO_UPDATE_STATE_URL(id), requestBody, authorization(accessToken))
        .then(response =>{
            const responseBody: UpdateStateTodoResponseDto = response.data;
            return responseBody;
        }).catch(error=>{
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

const TODO_UPDATE_URL = (id) => `${API_DOMAIN}/todo/${id}`;

export const updateTodoRequest = async (id: number, requestBody: UpdateTodoRequestDto, accessToken: string)=>{
    const result = await axios.put(TODO_UPDATE_URL(id), requestBody, authorization(accessToken))
        .then(response =>{
            const responseBody: UpdateTodoResponseDto = response.data;
            return responseBody;
        }).catch(error=>{
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

const TODO_DELETE_URL = (id) => `${API_DOMAIN}/todo/${id}`;

export const deleteTodoRequest = async (id: number, accessToken: string) =>{
    const result = await axios.delete(TODO_DELETE_URL(id), authorization(accessToken))
        .then(response =>{
            const responseBody: DeleteTodoResponseDto = response.data;
            return responseBody;
        }).catch(error=>{
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}