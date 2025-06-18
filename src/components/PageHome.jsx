import { NavLink, Outlet } from "react-router-dom";

const PageHome = () => {
    return (
        <div className="h-screen flex gap-4 p-4 bg-[#ccd3e0]">
            <header className="w-[270px] bg-white rounded-md p-4 shadow-sm border border-[#E0E0E0] text-base">
                <div className="flex justify-center">
                    <img src="imgs/logo_saude.png" alt="" className="w-[100px]" />
                </div>
                <nav className="grid gap-3 mt-6 *:leading-[40px] *:border *:border-[#E0E0E0] *:pl-4 *:rounded *:text-[#424242] *:duration-150 *:font-semibold">
                    <NavLink end className="hover:bg-[#1D8BCC] hover:text-white hover:border-[#1A7CBB] [&.active]:bg-[#1D8BCC] [&.active]:text-white" to="/medicos">Médicos</NavLink>
                    <NavLink end className="hover:bg-[#1D8BCC] hover:text-white hover:border-[#1A7CBB] [&.active]:bg-[#1D8BCC] [&.active]:text-white" to="/pacientes">Pacientes</NavLink>
                    <NavLink end className="hover:bg-[#1D8BCC] hover:text-white hover:border-[#1A7CBB] [&.active]:bg-[#1D8BCC] [&.active]:text-white" to="/planos">Planos</NavLink>
                </nav>
                <footer className="flex mt-[560px] w-full text-center text-[#757575]">
                    <span>&copy; 2025 - Todos os direitos reservados.</span>
                </footer>
            </header>
            <div className="flex-1 p-4 bg-white rounded-md overflow-auto shadow-sm border border-[#E0E0E0] text-base">
                <Outlet />
            </div>
        </div>
    );
}

export default PageHome;