import ScheduleListItems from "../../types/interface/schedule-list-items.interface";

export default interface GetWeeklyScheduleIndexResponseDto extends Response{
    weeklyScheduleListItems: ScheduleListItems[];
}