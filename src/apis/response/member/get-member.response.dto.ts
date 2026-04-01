import ResponseDto from '../response.dto';

export default interface GetMemberResponseDto extends ResponseDto {
    name: string;
    email: string;
    phone: string;
    joinDate: string;
}
