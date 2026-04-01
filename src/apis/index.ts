import { FindIdRequestDto, ResetPasswordRequestDto, SignInRequestDto, SignUpRequestDto } from './request/auth';
import axios from 'axios';
import { FindIdResponseDto, ResetPasswordResponseDto, SignInResponseDto, SignUpResponseDto } from './response/auth';
import { GetTodayScheduleIndexResponseDto, GetWeeklyScheduleIndexResponseDto, ResponseDto } from './response';
import { PostScheduleRequestDto, UpdateScheduleRequestDto } from "./request/schedule";
import {
    DeleteScheduleResponseDto,
    GetScheduleResponseDto,
    PostScheduleResponseDto,
    UpdateScheduleResponseDto
} from "./response/schedule";
import { PostTodoRequestDto, UpdateStateTodoRequestDto, UpdateTodoRequestDto } from "./request/todo";
import {
    DeleteTodoResponseDto,
    GetTodoResponseDto,
    PostTodoResponseDto,
    UpdateStateTodoResponseDto,
    UpdateTodoResponseDto
} from "./response/todo";
import { FindPasswordRequestDto, VerifiedNumberRequestDto } from "./request/mail";
import { FindPasswordResponseDto, VerifiedNumberResponseDto } from "./response/mail";
import { PostNoticeRequestDto, UpdateNoticeRequestDto } from "./request/notice";
import { ChangePasswordRequestDto, UpdateMemberRequestDto, WithdrawRequestDto } from "./request/member";
import { GetMemberResponseDto } from "./response/member";
import { DeleteNoticeResponseDto, GetNoticeListResponseDto, GetNoticeResponseDto, PostNoticeResponseDto, UpdateNoticeResponseDto } from "./response/notice";

const DOMAIN = import.meta.env.VITE_API_URL;

const API_DOMAIN = `${DOMAIN}/api/v2`;

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

// axios 인스턴스: 공통 baseURL 설정
const apiClient = axios.create({
    baseURL: API_DOMAIN,
});

const authorization = (accessToken: string) => {
    return { headers: { Authorization: `Bearer ${accessToken}` } };
};

// 공통 API 호출 래퍼: 성공/실패 응답을 일관되게 처리
async function apiCall<T>(fn: () => Promise<T>): Promise<T | ResponseDto> {
    try {
        return await fn();
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return error.response.data as ResponseDto;
        }
        throw error;
    }
}

export const signInRequest = async (requestBody: SignInRequestDto): Promise<SignInResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.post('/auth/sign-in', requestBody);
        return response.data as SignInResponseDto;
    });
};

export const signUpRequest = async (requestBody: SignUpRequestDto): Promise<SignUpResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.post('/auth/sign-up', requestBody);
        return response.data as SignUpResponseDto;
    });
};

export const findIdRequest = async (requestBody: FindIdRequestDto): Promise<FindIdResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.post('/auth/find-id', requestBody);
        return response.data as FindIdResponseDto;
    });
};

export const findPasswordRequest = async (requestBody: FindPasswordRequestDto): Promise<FindPasswordResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.post('/mail/send', requestBody);
        return response.data as FindPasswordResponseDto;
    });
};

export const verifiedNumberRequest = async (requestBody: VerifiedNumberRequestDto): Promise<VerifiedNumberResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.post('/mail/verified', requestBody);
        return response.data as VerifiedNumberResponseDto;
    });
};

export const resetPasswordRequest = async (requestBody: ResetPasswordRequestDto): Promise<ResetPasswordResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.put('/auth/reset-password', requestBody);
        return response.data as ResetPasswordResponseDto;
    });
};

export const postScheduleRequest = async (requestBody: PostScheduleRequestDto, accessToken: string): Promise<PostScheduleResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.post('/schedule', requestBody, authorization(accessToken));
        return response.data as PostScheduleResponseDto;
    });
};

export const getScheduleRequest = async (accessToken: string): Promise<GetScheduleResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.get('/schedule', authorization(accessToken));
        return response.data as GetScheduleResponseDto;
    });
};

export const deleteScheduleRequest = async (id: number, accessToken: string): Promise<DeleteScheduleResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.delete(`/schedule/${id}`, authorization(accessToken));
        return response.data as DeleteScheduleResponseDto;
    });
};

export const updateScheduleRequest = async (id: number, requestBody: UpdateScheduleRequestDto, accessToken: string): Promise<UpdateScheduleResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.put(`/schedule/${id}`, requestBody, authorization(accessToken));
        return response.data as UpdateScheduleResponseDto;
    });
};

export const getTodayScheduleRequest = async (today: string, accessToken: string): Promise<GetTodayScheduleIndexResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.get(`/schedule/today?today=${today}`, authorization(accessToken));
        return response.data as GetTodayScheduleIndexResponseDto;
    });
};

export const getWeeklyScheduleRequest = async (start: string, end: string, accessToken: string): Promise<GetWeeklyScheduleIndexResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.get(`/schedule/weekly?start=${start}&end=${end}`, authorization(accessToken));
        return response.data as GetWeeklyScheduleIndexResponseDto;
    });
};

export const getWeatherRequest = async () => {
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=${WEATHER_API_KEY}&units=metric&lang=kr`
        );
        return response.data;
    } catch (error) {
        console.error("날씨 정보를 불러오지 못했습니다.", error);
        return null;
    }
};

export const postTodoRequest = async (requestBody: PostTodoRequestDto, accessToken: string): Promise<PostTodoResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.post('/todo', requestBody, authorization(accessToken));
        return response.data as PostTodoResponseDto;
    });
};

export const getTodoRequest = async (accessToken: string): Promise<GetTodoResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.get('/todo', authorization(accessToken));
        return response.data as GetTodoResponseDto;
    });
};

export const updateStateTodoRequest = async (id: number, requestBody: UpdateStateTodoRequestDto, accessToken: string): Promise<UpdateStateTodoResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.put(`/todo/toggle/${id}`, requestBody, authorization(accessToken));
        return response.data as UpdateStateTodoResponseDto;
    });
};

export const updateTodoRequest = async (id: number, requestBody: UpdateTodoRequestDto, accessToken: string): Promise<UpdateTodoResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.put(`/todo/${id}`, requestBody, authorization(accessToken));
        return response.data as UpdateTodoResponseDto;
    });
};

export const deleteTodoRequest = async (id: number, accessToken: string): Promise<DeleteTodoResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.delete(`/todo/${id}`, authorization(accessToken));
        return response.data as DeleteTodoResponseDto;
    });
};

export const getNoticeListRequest = async (): Promise<GetNoticeListResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.get('/notice');
        return response.data as GetNoticeListResponseDto;
    });
};

export const getNoticeRequest = async (id: number): Promise<GetNoticeResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.get(`/notice/${id}`);
        return response.data as GetNoticeResponseDto;
    });
};

export const postNoticeRequest = async (requestBody: PostNoticeRequestDto, accessToken: string): Promise<PostNoticeResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.post('/notice', requestBody, authorization(accessToken));
        return response.data as PostNoticeResponseDto;
    });
};

export const updateNoticeRequest = async (id: number, requestBody: UpdateNoticeRequestDto, accessToken: string): Promise<UpdateNoticeResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.put(`/notice/${id}`, requestBody, authorization(accessToken));
        return response.data as UpdateNoticeResponseDto;
    });
};

export const deleteNoticeRequest = async (id: number, accessToken: string): Promise<DeleteNoticeResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.delete(`/notice/${id}`, authorization(accessToken));
        return response.data as DeleteNoticeResponseDto;
    });
};

export const getMeRequest = async (accessToken: string): Promise<GetMemberResponseDto | ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.get('/member/me', authorization(accessToken));
        return response.data as GetMemberResponseDto;
    });
};

export const updateMeRequest = async (requestBody: UpdateMemberRequestDto, accessToken: string): Promise<ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.put('/member/me', requestBody, authorization(accessToken));
        return response.data as ResponseDto;
    });
};

export const changePasswordRequest = async (requestBody: ChangePasswordRequestDto, accessToken: string): Promise<ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.put('/member/password', requestBody, authorization(accessToken));
        return response.data as ResponseDto;
    });
};

export const withdrawRequest = async (requestBody: WithdrawRequestDto, accessToken: string): Promise<ResponseDto> => {
    return apiCall(async () => {
        const response = await apiClient.delete('/member/me', { ...authorization(accessToken), data: requestBody });
        return response.data as ResponseDto;
    });
};
