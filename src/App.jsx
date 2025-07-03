import { ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { BrowserRouter, Route, Routes } from "react-router-dom"; 
import PageHome from "./components/PageHome";
import Medicos from "./pages/Medicos";
import Pacientes from "./pages/Pacientes";
import Planos from "./pages/Planos";
import Relatorios from './pages/relatorios';
import Agendamentos from './pages/Agendamentos';

dayjs.locale('pt-br');

const App = () => {
  return (
    <ConfigProvider locale={ptBR}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PageHome />}>
            <Route path="/medicos" element={<Medicos />} />
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/planos" element={<Planos />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/agendamentos" element={<Agendamentos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;