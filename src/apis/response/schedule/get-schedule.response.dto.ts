import ResponseDto from "../response.dto";
import ScheduleListItems from "../../../types/interface/schedule-list-items.interface";

export default interface GetScheduleResponseDto extends ResponseDto{
    scheduleListItems: ScheduleListItems[];
}