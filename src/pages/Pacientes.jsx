import InputMask from 'react-input-mask';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, message, Modal, Drawer, Form, Input, DatePicker, Button as AntButton, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchPacientes, createPaciente, updatePaciente, deletePaciente, fetchPlanos } from '../services';
import dayjs from 'dayjs';

const formatarCPF = (cpf) => {
    if (!cpf) return '';
    const apenasDigitos = cpf.replace(/\D/g, '');
    if (apenasDigitos.length !== 11) return cpf;
    return apenasDigitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const Pacientes = () => {
    const [drawerAberto, setDrawerAberto] = useState(false);
    const [pacienteEmEdicao, setPacienteEmEdicao] = useState(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: pacientes, isLoading: carregandoPacientes, isError: ocorreuErro, error: erro } = useQuery({
        queryKey: ['pacientes'],
        queryFn: fetchPacientes
    });

    const { data: planos, isLoading: carregandoPlanos } = useQuery({
        queryKey: ['planos'],
        queryFn: fetchPlanos
    });

    const aoMutarComSucesso = (mensagemDeSucesso) => {
        message.success(mensagemDeSucesso);
        setDrawerAberto(false);
        setPacienteEmEdicao(null);
        form.resetFields();
        queryClient.invalidateQueries({ queryKey: ['pacientes'] });
    };

    const mutacaoCriar = useMutation({
        mutationFn: createPaciente,
        onSuccess: () => aoMutarComSucesso('Paciente criado com sucesso!'),
        onError: (err) => message.error(err.response?.data?.message || 'Erro ao criar paciente'),
    });

    const mutacaoAtualizar = useMutation({
        mutationFn: updatePaciente,
        onSuccess: () => aoMutarComSucesso('Paciente atualizado com sucesso!'),
        onError: (err) => message.error(err.response?.data?.message || 'Erro ao atualizar paciente'),
    });

    const mutacaoDeletar = useMutation({
        mutationFn: deletePaciente,
        onSuccess: (dados) => aoMutarComSucesso(dados || 'Paciente deletado com sucesso!'),
        onError: (err) => message.error(err.response?.data?.message || 'Erro ao deletar paciente'),
    });

    const lidarComAdicionar = () => {
        setPacienteEmEdicao(null);
        form.resetFields();
        setDrawerAberto(true);
    };

    const lidarComEdicao = (registro) => {
        setPacienteEmEdicao(registro);
        form.setFieldsValue({
            ...registro,
            cpf_paciente: formatarCPF(registro.cpf_paciente),
            data_nascimento: registro.data_nascimento ? dayjs(registro.data_nascimento) : null,
        });
        setDrawerAberto(true);
    };

    const lidarComDelecao = (registro) => {
        Modal.confirm({
            title: 'Você tem certeza que quer deletar este paciente?',
            content: `Nome: ${registro.nome_paciente}\nCPF: ${formatarCPF(registro.cpf_paciente)}`,
            okText: 'Sim, deletar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: () => {
                const cpfLimpo = registro.cpf_paciente.replace(/\D/g, '');
                mutacaoDeletar.mutate(cpfLimpo);
            },
        });
    };

    const aoFecharDrawer = () => {
        setDrawerAberto(false);
        setPacienteEmEdicao(null);
        form.resetFields();
    };

    const aoSubmeterFormulario = (valores) => {
        const dadosDoPaciente = {
            ...valores,
            cpf_paciente: valores.cpf_paciente.replace(/\D/g, ''),
            data_nascimento: valores.data_nascimento ? valores.data_nascimento.format('YYYY-MM-DD') : null,
        };

        if (pacienteEmEdicao) {
            mutacaoAtualizar.mutate({ ...dadosDoPaciente, cpf_paciente: pacienteEmEdicao.cpf_paciente });
        } else {
            mutacaoCriar.mutate(dadosDoPaciente);
        }
    };

    const colunas = [
        { title: 'Nome do Paciente', dataIndex: 'nome_paciente', key: 'nome_paciente' },
        {
            title: 'CPF',
            dataIndex: 'cpf_paciente',
            key: 'cpf_paciente',
            render: (texto) => formatarCPF(texto)
        },
        { title: 'Plano de Saúde', dataIndex: 'plano_saude', key: 'plano_saude' },
        { title: 'Data de Nascimento', dataIndex: 'data_nascimento', key: 'data_nascimento', render: (texto) => texto ? dayjs(texto).format('DD/MM/YYYY') : '' },
        {
            title: 'Ações', key: 'acoes',
            render: (_, registro) => (
                <div className="flex items-center gap-4">
                    <button onClick={() => lidarComEdicao(registro)} className="text-[#1D8BCC] hover:text-blue-800"><EditOutlined className="text-xl" /></button>
                    <button onClick={() => lidarComDelecao(registro)} className="text-red-500 hover:text-red-700"><DeleteOutlined className="text-xl" /></button>
                </div>
            ),
        },
    ];

    if (ocorreuErro) {
        return <span>Erro ao carregar dados: {erro.message}</span>
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Pacientes</h1>
                <button onClick={lidarComAdicionar} className="flex items-center gap-2 bg-[#1D8BCC] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#3693c9] transition-colors">
                    <PlusOutlined />
                    <span>Novo Paciente</span>
                </button>
            </header>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <Table columns={colunas} dataSource={pacientes} loading={carregandoPacientes} rowKey="cpf_paciente" />
            </div>

            <Drawer
                title={pacienteEmEdicao ? 'Editar Paciente' : 'Adicionar Novo Paciente'}
                width={720}
                onClose={aoFecharDrawer}
                open={drawerAberto}
                bodyStyle={{ paddingBottom: 80 }}
                extra={
                    <div className="flex gap-2">
                        <AntButton onClick={aoFecharDrawer}>Cancelar</AntButton>
                        <AntButton onClick={() => form.submit()} type="primary" loading={mutacaoCriar.isPending || mutacaoAtualizar.isPending}>
                            Salvar
                        </AntButton>
                    </div>
                }
            >
                <Form layout="vertical" form={form} onFinish={aoSubmeterFormulario}>
                    <Form.Item name="nome_paciente" label="Nome Completo" rules={[{ required: true, message: 'Por favor, insira o nome do paciente' }]}>
                        <Input placeholder="Insira o nome completo" />
                    </Form.Item>

                    <Form.Item
                        name="cpf_paciente"
                        label="CPF"
                        rules={[
                            { required: true, message: 'Por favor, insira o CPF' },
                            {
                                pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                                message: 'O CPF está incompleto'
                            }
                        ]}
                    >
                        <InputMask
                            mask="999.999.999-99"
                            maskChar={null}
                            disabled={!!pacienteEmEdicao}
                        >
                            {(props) => <Input {...props} placeholder="000.000.000-00" />}
                        </InputMask>
                    </Form.Item>

                    <Form.Item name="plano_saude" label="Plano de Saúde" rules={[{ required: true, message: 'Por favor, selecione o plano de saúde' }]}>
                        <Select
                            placeholder="Selecione um plano de saúde"
                            loading={carregandoPlanos}
                        >
                            {planos?.map(plano => (
                                <Select.Option key={plano.id_plano} value={plano.nome_plano}>
                                    {plano.nome_plano}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="data_nascimento" label="Data de Nascimento" rules={[{ required: true, message: 'Por favor, selecione a data de nascimento' }]}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    );
}

export default Pacientes;