import { BrowserRouter, Route, Routes } from "react-router";
import PageHome from "./components/PageHome";
import Medicos from "./pages/Medicos";
import Pacientes from "./pages/Pacientes";
import Planos from "./pages/Planos";

const App = () => {
  return (  
    <>
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageHome />}>
          <Route path="/medicos" element={<Medicos />}/>
          <Route path="/pacientes" element={<Pacientes />}/>
          <Route path="/planos" element={<Planos />}/>
        </Route>
      </Routes>
     </BrowserRouter>
    </>
  );
}
 
export default App;