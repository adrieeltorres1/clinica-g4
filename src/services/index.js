import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

export const API = axios.create({
    baseURL: "http://localhost:8000"
})

export const queryClient = new QueryClient();


export const fetchMedicos = async () => {
    const { data } = await API.get('/medicos'); 
    return data;
};

export const createMedico = async (medicoData) => {
    const { data } = await API.post('/medicos/criarmedico', medicoData);
    return data;
};

export const updateMedico = async (medicoData) => {
    const { data } = await API.put('/medicos/editarMedico', medicoData);
    return data;
};

export const deleteMedico = async (cpf) => {
    const { data } = await API.delete('/medicos/deletarmedico', { data: { cpf_medico: cpf } });
    return data;
};


export const fetchPacientes = async () => {
    const { data } = await API.get('/pacientes');
    return data;
};

export const createPaciente = async (pacienteData) => {
    const { data } = await API.post('/pacientes', pacienteData);
    return data;
};

export const updatePaciente = async (pacienteData) => {
    const { data } = await API.put('/pacientes/editarpacientes', pacienteData);
    return data;
};

export const deletePaciente = async (cpf) => {
    const { data } = await API.delete('/pacientes/deletarpaciente', { 
        data: { cpf_paciente: cpf } 
    });
    return data;
};

export const fetchPlanos = async () => {
    const {data} = await API.get('/planos');
    return data;
}

export const createPlano = async (planoData) => {
    const {data} = await API.post('/planos/criarplano', planoData);
    return data;
}


export const updatePlano = async (id, planoData) => {
    const {data} = await API.put(`/planos/editarplanos/${id}`, planoData);
    return data;
}

export const deletePlano = async (nome_plano) => {
    const {data} = await API.delete('/planos/deletarplanos', {
        data: {
            nome_plano
        }
    });
    return data;
}