import ResponseDto from '../response.dto';

export default interface GetNoticeResponseDto extends ResponseDto {
    id: number;
    title: string;
    content: string;
    memberId: number;
    viewCount: number;
    regDate: string;
}
