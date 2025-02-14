import {SignInRequestDto} from './request/auth';
import axios from 'axios';
import {SignInResponseDto, SignUpResponseDto} from './response/auth';
import {GetTodayScheduleIndexResponseDto, GetWeeklyScheduleIndexResponseDto, ResponseDto} from './response';
import {PostScheduleRequestDto, UpdateScheduleRequestDto} from "./request/schedule";
import {
    DeleteScheduleResponseDto,
    GetScheduleResponseDto,
    PostScheduleResponseDto,
    UpdateScheduleResponseDto
} from "./response/schedule";

const DOMAIN = 'http://localhost:4000';

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
    console.log(today);
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