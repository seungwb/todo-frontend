export default interface PostScheduleRequestDto{
    title: string;
    content: string | null;
    location: string | null;
    startDate: Date;
    endDate: Date;
}