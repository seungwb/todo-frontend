import React from 'react';

export default function Header(){
    return(
        <div className="flex flex-row p-12 justify-between items-center h-24 bg-indigo-300">
            <div className="flex flex-row gap-16">
                <div>
                    {'logo'}
                </div>
                <div>
                    { 'Caleader' }
                </div>
                <div>
                    {'Notice'}
                </div>
            </div>
            <div className="flex flex-row">
                <div>
                    login
                </div>
            </div>
        </div>
    )
}