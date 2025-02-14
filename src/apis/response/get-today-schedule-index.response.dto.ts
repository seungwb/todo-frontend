import ScheduleListItems from "../../types/interface/schedule-list-items.interface";

export default interface GetTodayScheduleIndexResponseDto extends Response{
    todayScheduleListItems: ScheduleListItems[];
}