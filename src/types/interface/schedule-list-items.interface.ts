export default interface ScheduleListItems {
    id: number;
    name : string;
    title : string;
    content : string | null;
    startDate : Date;
    endDate : Date;
    regDate : Date;
    location : string | null;
}