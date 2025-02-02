import React from 'react';

//          component : Calendar List Item 컴포넌트          //
export default function CalendarListItem(){

    //          render : Calendar List Item 컴포넌트 렌더링         //
    return(
        <div className = "flex flex-col p-12 gap-16 border-2 rounded-md border-rose-500">
            <div className = "flex flex-row justify-between">
                <div>
                    {'작성자'}
                </div>
                <div>
                    {'작성일'}
                </div>
            </div>
            <div>
                <div>
                    {'제목'}
                </div>
            </div>
            <div className = "flex flex-row justify-between">
                <div>
                    {'시작일'}
                </div>
                <div>
                    {'마감일'}
                </div>
            </div>
            <div>
                <div>
                    {'장소'}
                </div>
            </div>
            <div>
                <div>
                    {'내용'}
                </div>
            </div>
            <div>
                <div>
                    {'이미지'}
                </div>
            </div>

        </div>
    )
}