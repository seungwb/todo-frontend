import React from "react";

const notices = [
    { id: 1, title: "서비스 점검 안내", date: "2025-02-07", views: 120 },
    { id: 2, title: "신규 기능 업데이트", date: "2025-02-05", views: 98 },
    { id: 3, title: "이벤트 공지", date: "2025-02-03", views: 76 },
    { id: 4, title: "고객센터 운영 시간 변경", date: "2025-02-01", views: 50 },
];

export default function Notice() {
    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-indigo-600">📢 공지사항</h2>
            <table className="w-full border-collapse border border-gray-200">
                <thead>
                <tr className="bg-indigo-100 text-gray-700">
                    <th className="p-3 border border-gray-200">번호</th>
                    <th className="p-3 border border-gray-200 text-left">제목</th>
                    <th className="p-3 border border-gray-200">날짜</th>
                    <th className="p-3 border border-gray-200">조회수</th>
                </tr>
                </thead>
                <tbody>
                {notices.map((notice, index) => (
                    <tr
                        key={notice.id}
                        className="border-b hover:bg-gray-100 cursor-pointer"
                        onClick={() => alert(`공지사항 ${notice.id} 클릭!`)}
                    >
                        <td className="p-3 text-center">{index + 1}</td>
                        <td className="p-3">{notice.title}</td>
                        <td className="p-3 text-center">{notice.date}</td>
                        <td className="p-3 text-center">{notice.views}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}