import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { User, Stethoscope, Calendar, Clock, CheckCircle } from 'lucide-react';

export default function Agendamentos() {
    const [activeTab, setActiveTab] = useState(0);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    const tabs = [
        { id: 'patient', label: 'Pra quem é a consulta?', icon: User },
        { id: 'specialty', label: 'Que especialidade?', icon: Stethoscope },
        { id: 'date', label: 'Escolha a data', icon: Calendar },
        { id: 'time', label: 'Selecione o horário', icon: Clock },
        { id: 'confirm', label: 'Concluir agendamento', icon: CheckCircle }
    ];

    const { data: pacientes } = useQuery({
        queryKey: ['pacientes'],
        queryFn: async () => {
            const res = await axios.get('http://localhost:8000/pacientes');
            return res.data;
        }
    });

    const { data: especialidades } = useQuery({
        queryKey: ['especialidades'],
        queryFn: async () => {
            const res = await axios.get('http://localhost:8000/especialidades');
            return res.data;
        }
    });

    const { data: medicos } = useQuery({
        queryKey: ['medicosPorEspecialidade', selectedSpecialty],
        queryFn: async () =>
            selectedSpecialty
                ? axios.get(`http://localhost:8000/medicos?especialidade_id=${selectedSpecialty}`).then(res => res.data)
                : [],
        enabled: !!selectedSpecialty
    });

    const { data: disponibilidades } = useQuery({
        queryKey: ['disponibilidades', selectedDoctor],
        queryFn: async () =>
            selectedDoctor
                ? axios.get(`http://localhost:8000/disponibilidades?medico_id=${selectedDoctor}`).then(res => res.data)
                : [],
        enabled: !!selectedDoctor
    });

    const criarConsulta = useMutation({
        mutationFn: async () => {
            const data_hora = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
            return axios.post('http://localhost:8000/disponibilidades/consultas', {
                paciente_id: selectedPatient,
                medico_id: selectedDoctor,
                data_hora
            });
        },
        onSuccess: () => {
            alert("Consulta agendada com sucesso!");
        },
        onError: () => {
            alert("Erro ao agendar consulta.");
        }
    });


    const handleAgendarConsulta = () => {
        if (!selectedPatient || !selectedDoctor || !selectedDate || !selectedTime) {
            alert("Preencha todos os campos antes de agendar.");
            return;
        }

        criarConsulta.mutate();
    };


    const handleNext = () => {
        if (activeTab < tabs.length - 1 && canProceed(activeTab + 1)) {
            setActiveTab(activeTab + 1);
        }
    };

    const canProceed = (index) => {
        switch (index) {
            case 0: return true;
            case 1: return selectedPatient !== '';
            case 2: return selectedSpecialty !== '' && selectedDoctor !== '';
            case 3: return selectedDate !== '';
            case 4: return selectedTime !== '';
            default: return false;
        }
    };

    return (
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex">
                {tabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive = index === activeTab;
                    const isAvailable = canProceed(index);
                    return (
                        <div
                            key={tab.id}
                            className={`flex-1 px-4 py-4 text-center cursor-pointer transition-colors relative ${isActive
                                ? 'bg-[#1D8BCC] text-white'
                                : isAvailable
                                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            onClick={() => {
                                if (isAvailable) setActiveTab(index);
                            }}
                        >
                            <div className="flex justify-center mb-1">
                                <Icon size={20} />
                            </div>
                            <span className="text-sm font-medium">{tab.label}</span>
                        </div>
                    );
                })}
            </div>
            <div className="p-8 min-h-96">
                {activeTab === 0 && (
                    <>
                        <h2 className="text-3xl font-bold text-[#1D8BCC] mb-4">Quem é o beneficiário?</h2>
                        <select
                            value={selectedPatient}
                            onChange={(e) => setSelectedPatient(e.target.value)}
                            className="w-full px-4 py-3 border-2 rounded-lg text-lg"
                        >
                            <option value="">Selecione o paciente</option>
                            {pacientes?.map((p) => (
                                <option key={p.id} value={p.id}>{p.nome_paciente}</option>
                            ))}
                        </select>
                    </>
                )}
                {activeTab === 1 && (
                    <>
                        <h2 className="text-3xl font-bold text-[#1D8BCC] mb-4">Qual especialidade você precisa?</h2>
                        <select
                            value={selectedSpecialty}
                            onChange={(e) => {
                                setSelectedSpecialty(e.target.value);
                                setSelectedDoctor('');
                            }}
                            className="w-full px-4 py-3 border-2 rounded-lg text-lg mb-4"
                        >
                            <option value="">Selecione a especialidade</option>
                            {especialidades?.map((e) => (
                                <option key={e.id_especialidade} value={e.id_especialidade}>
                                    {e.nome_especialidade}
                                </option>
                            ))}
                        </select>
                        {selectedSpecialty && (
                            <select
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                className="w-full px-4 py-3 border-2 rounded-lg text-lg"
                            >
                                <option value="">Selecione o médico</option>
                                {medicos?.map((m) => (
                                    <option key={m.id} value={m.id}>{m.nome_medico}</option>
                                ))}
                            </select>
                        )}
                    </>
                )}
                {activeTab === 2 && (
                    <>
                        <h2 className="text-3xl font-bold text-[#1D8BCC] mb-4">Escolha a data da consulta</h2>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-4 py-3 border-2 rounded-lg text-lg"
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </>
                )}
                {activeTab === 3 && (
                    <>
                        <h2 className="text-3xl font-bold text-[#1D8BCC] mb-4">Selecione o horário</h2>
                        <div className="grid grid-cols-4 gap-4">
                            {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((h) => (
                                <button
                                    key={h}
                                    onClick={() => setSelectedTime(h)}
                                    className={`px-4 py-2 rounded-lg border-2 ${selectedTime === h ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}`}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    </>
                )}
                {activeTab === 4 && (
                    <>
                        <h2 className="text-3xl font-bold text-[#1D8BCC] mb-4">Confirmar agendamento</h2>
                        <div className="space-y-2 mb-4 bg-gray-50 p-4 rounded">
                            <p><strong>Paciente:</strong> {pacientes?.find(p => p.id === parseInt(selectedPatient))?.nome_paciente || 'Nome do paciente está faltando'}</p>
                            <p><strong>Especialidade:</strong> {especialidades?.find(e => e.id_especialidade === parseInt(selectedSpecialty))?.nome_especialidade}</p>
                            <p><strong>Médico:</strong> {medicos?.find(m => m.id === parseInt(selectedDoctor))?.nome_medico}</p>
                            <p><strong>Data:</strong> {selectedDate ? new Date(selectedDate).toLocaleDateString('pt-BR') : 'Data não selecionada'}</p>
                            <p><strong>Horário:</strong> {selectedTime || 'Horário não selecionado'}</p>
                        </div>

                        <button
                            onClick={handleAgendarConsulta}
                            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Confirmar agendamento
                        </button>
                    </>
                )}
                {activeTab < tabs.length - 1 && (
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleNext}
                            disabled={!canProceed(activeTab + 1)}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${canProceed(activeTab + 1)
                                ? 'bg-orange-500 hover:bg-orange-600 text-white font-semibold'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            Próximo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}