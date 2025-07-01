import { NavLink, Outlet } from "react-router-dom";
import { MdPeopleAlt } from "react-icons/md";
import { MdMedicalServices } from "react-icons/md";
import { FaStethoscope } from "react-icons/fa";
import { IoStatsChartSharp } from "react-icons/io5";




const PageHome = () => {
    return (
        <div className="h-screen flex gap-4 p-4 bg-[#ccd3e0]">
            <header className="w-[270px] bg-white rounded-md p-4 shadow-sm border border-[#E0E0E0] text-base">
                <div className="flex justify-center">
                    <img src="imgs/logo_saude.png" alt="" className="w-[100px]" />
                </div>
                <nav className="grid gap-3 mt-6 *:leading-[40px]  *:pl-4 *:rounded *:text-[#424242] *:duration-150 *:font-semibold">
                    <NavLink
                        end
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-[#1D8BCC] hover:text-white [&.active]:bg-[#1D8BCC] [&.active]:text-white"
                        to="/relatorios"
                    >
                        <IoStatsChartSharp className="text-xl" />
                        Relatórios
                    </NavLink>
                    <NavLink
                        end
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-[#1D8BCC] hover:text-white [&.active]:bg-[#1D8BCC] [&.active]:text-white"
                        to="/medicos"
                    >
                        <FaStethoscope className="text-xl" />
                        Médicos
                    </NavLink>
                    <NavLink
                        end
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-[#1D8BCC] hover:text-white [&.active]:bg-[#1D8BCC] [&.active]:text-white"
                        to="/pacientes"
                    >
                        <MdPeopleAlt className="text-xl" />
                        Pacientes
                    </NavLink>
                    <NavLink
                        end
                        className="flex items-center  gap-2 px-4 py-2 text-gray-700 hover:bg-[#1D8BCC] hover:text-white [&.active]:bg-[#1D8BCC] [&.active]:text-white"
                        to="/planos"
                    >
                        <MdMedicalServices className="text-xl" />
                        Planos
                    </NavLink>
                </nav>
            </header>
            <div className="flex-1 p-4 bg-white rounded-md overflow-auto shadow-sm border border-[#E0E0E0] text-base">
                <Outlet />
            </div>
        </div>
    );
}

export default PageHome;


