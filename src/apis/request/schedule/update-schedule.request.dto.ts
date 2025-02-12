
export default interface UpdateScheduleRequestDto{
    title: string;
    content: string | null;
    location: string | null;
    startDate: Date;
    endDate: Date;
}