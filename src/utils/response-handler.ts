import ResponseCode from '../types/enum/response-code.enum';
import type { ResponseDto } from '../apis/response';

/**
 * API 응답의 공통 에러 처리 유틸리티
 * @returns 성공(SU)이면 true, 그 외 false
 */
export function handleResponse(responseBody: ResponseDto | null): boolean {
    if (!responseBody) {
        alert('네트워크 이상입니다.');
        return false;
    }
    const { code } = responseBody;
    if (code === ResponseCode.DATABASE_ERROR) {
        alert('데이터베이스 오류입니다.');
    }
    if (code === ResponseCode.VALIDATION_FAILED || code === ResponseCode.NOT_EXISTED_USER) {
        alert('로그인이 필요한 기능입니다.');
    }
    return code === ResponseCode.SUCCESS;
}
