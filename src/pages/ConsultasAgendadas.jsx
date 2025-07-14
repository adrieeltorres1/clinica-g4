import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const ConsultasAgendadas = () => {
  const { data: consultas, isLoading } = useQuery({
    queryKey: ['consultas'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8000/consultas');
      return res.data;
    }
  });

  const formatarData = (iso) => {
    return new Date(iso).toLocaleDateString('pt-BR');
  };

  const formatarHora = (iso) => {
    const hora = new Date(iso).getHours().toString().padStart(2, '0');
    const minuto = new Date(iso).getMinutes().toString().padStart(2, '0');
    return `${hora}:${minuto}`;
  };

  if (isLoading) {
    return <p className="text-center text-gray-600">Carregando consultas...</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-blue-600 mb-6">Consultas Agendadas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consultas.map((c) => (
          <div key={c.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{c.paciente?.nome_paciente || 'Paciente não informado'}</h3>
            <p><strong>Especialidade:</strong> {c.medico?.especialidade?.nome_especialidade || '—'}</p>
            <p><strong>Médico:</strong> {c.medico?.nome_medico || '—'}</p>
            <p><strong>Data:</strong> {formatarData(c.data_hora)}</p>
            <p><strong>Horário:</strong> {formatarHora(c.data_hora)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsultasAgendadas;
