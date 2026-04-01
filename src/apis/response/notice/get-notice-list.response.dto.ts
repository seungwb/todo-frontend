import ResponseDto from '../response.dto';
import { NoticeListItem } from '../../../types/interface';

export default interface GetNoticeListResponseDto extends ResponseDto {
    noticeList: NoticeListItem[];
}
