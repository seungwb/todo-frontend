import ResponseDto from "../response.dto";
import TodoListItems from "../../../types/interface/todo-list-items.interface";

export default interface GetTodoResponseDto extends ResponseDto{
    todoListItems: TodoListItems[];
}