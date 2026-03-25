import Header from "../Header";
import { Outlet } from "react-router-dom";

export default function Container() {
    return (
        <div className="min-h-screen bg-[#0d0d12]">
            <Header />
            <Outlet />
        </div>
    );
}
