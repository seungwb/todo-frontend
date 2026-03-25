import ResponseDto from "./response.dto";
import ScheduleListItems from "../../types/interface/schedule-list-items.interface";

export default interface GetTodayScheduleIndexResponseDto extends ResponseDto {
    todayScheduleListItems: ScheduleListItems[];
}