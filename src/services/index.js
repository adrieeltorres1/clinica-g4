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

export const fetchPacientesPorPlano = async () => {
    const { data } = await API.get('/relatorios/pacientes-por-plano');
    return data;
};

export const fetchNovosPacientesPorMes = async () => {
  console.log('Buscando dados de novos pacientes por mês...');
  const response = await fetch('http://localhost:8000/relatorios/novos-pacientes-mes'); 
  if (!response.ok) {
    console.error('Erro na resposta da API:', response.status);
    throw new Error('Erro ao buscar dados de novos pacientes por mês');
  }
  const data = await response.json();
  console.log('Resposta da API:', data);
  return data;
};

export const fetchResumoIdades = async () => {
  console.log('Buscando resumo de idades...');
  const response = await fetch('/relatorios/resumo-idades');
  if (!response.ok) {
    throw new Error('Erro ao buscar resumo de idades');
  }
  const data = await response.json();
  console.log('Resumo de idades recebido:', data);
  return data;
};


export const deletePlano = async (nome_plano) => {
    const {data} = await API.delete('/planos/deletarplanos', {
        data: {
            nome_plano
        }
    });
    return data;
}

export const fetchEspecialidades = async () => {
    const { data } = await API.get('/especialidades');
    return data;
};

export const createEspecialidade = async (especialidadeData) => {
    const { data } = await API.post('/especialidades', especialidadeData);
    return data;
};

export const updateEspecialidade = async ({ id, data }) => {
    const response = await API.put(`/especialidades/${id}`, data);
    return response.data;
};

export const deleteEspecialidade = async (id) => {
    const { data } = await API.delete(`/especialidades/${id}`);
    return data;
};