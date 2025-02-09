export default interface ScheduleRequestDto{
    title: string;
    content: string | null;
    location: string | null;
    startDate: Date;
    endDate: Date;
}