import { DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

const ConsultasAgendadas = () => {
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('');
  const [filtroMedico, setFiltroMedico] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const queryClient = useQueryClient();

  const { data: consultas, isLoading, isError } = useQuery({
    queryKey: ['consultas'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8000/disponibilidades/consultas');
      return res.data;
    }
  });

  const excluirConsulta = useMutation({
    mutationFn: async (id_consulta) => {
      await axios.delete(`http://localhost:8000/disponibilidades/consultas/${id_consulta}`);

    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] });
      alert('Consulta excluída com sucesso!');
    },
    onError: () => {
      alert('Erro ao excluir a consulta.');
    }
  });

  const formatarData = (iso) => new Date(iso).toLocaleDateString('pt-BR');

  const formatarHora = (iso) => {
    const data = new Date(iso);
    return `${data.getHours().toString().padStart(2, '0')}:${data.getMinutes().toString().padStart(2, '0')}`;
  };

  const consultasFiltradas = Array.isArray(consultas)
    ? consultas.filter((c) => {
      const especialidadeOK = filtroEspecialidade
        ? c.medicos?.especialidade?.nome_especialidade === filtroEspecialidade
        : true;
      const medicoOK = filtroMedico
        ? c.medicos?.nome_medico === filtroMedico
        : true;
      const dataOK = filtroData
        ? new Date(c.data_consulta).toISOString().slice(0, 10) === filtroData
        : true;
      return especialidadeOK && medicoOK && dataOK;
    })
    : [];

  if (isLoading) {
    return <p className="text-center text-gray-600">Carregando consultas...</p>;
  }

  if (isError) {
    return <p className="text-center text-red-600">Erro ao carregar as consultas.</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-blue-600 mb-6">Consultas Agendadas</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="date"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
          className="px-4 py-2 border rounded-md w-full md:w-auto"
        />

        <select
          value={filtroMedico}
          onChange={(e) => setFiltroMedico(e.target.value)}
          className="px-4 py-2 border rounded-md w-full md:w-auto"
        >
          <option value="">Filtrar por médico</option>
          {Array.isArray(consultas) &&
            [...new Set(consultas.map(c => c.medicos?.nome_medico).filter(Boolean))].map((nome) => (
              <option key={nome} value={nome}>{nome}</option>
            ))}
        </select>

        <select
          value={filtroEspecialidade}
          onChange={(e) => setFiltroEspecialidade(e.target.value)}
          className="px-4 py-2 border rounded-md w-full md:w-auto"
        >
          <option value="">Filtrar por especialidade</option>
          {Array.isArray(consultas) &&
            [...new Set(consultas.map(c => c.medicos?.especialidade?.nome_especialidade).filter(Boolean))].map((nome) => (
              <option key={nome} value={nome}>{nome}</option>
            ))}
        </select>
      </div>

      {consultasFiltradas.length === 0 ? (
        <p className="text-center text-gray-500">Nenhuma consulta encontrada com esses filtros.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultasFiltradas.map((c) => (
            <div
              key={c.id_consulta}
              className="bg-white rounded-lg shadow-md p-4 border-l-4"
              style={{ borderColor: '#1D8BCC' }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {c.pacientes?.nome_paciente || 'Paciente não informado'}
              </h3>
              <p><strong>Especialidade:</strong> {c.medicos?.especialidade?.nome_especialidade || '—'}</p>
              <p><strong>Médico:</strong> {c.medicos?.nome_medico || '—'}</p>
              <p><strong>Data:</strong> {formatarData(c.data_consulta)}</p>
              <p><strong>Horário:</strong> {formatarHora(c.data_consulta)}</p>
              <div className='flex justify-end'>
                   <button
                onClick={() => {
                  const confirmar = window.confirm('Tem certeza que deseja excluir esta consulta?');
                  if (confirmar) excluirConsulta.mutate(c.id_consulta);
                }}
                className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
              >
                <DeleteOutlined/>
              </button>

              </div>
             
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsultasAgendadas;

// DeleteOutlined