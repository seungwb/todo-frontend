export default interface TodoListItems{
    id: number;
    title: string;
    content: string | null;
    regDate: Date;
    state: boolean;
    memberId: number;
}