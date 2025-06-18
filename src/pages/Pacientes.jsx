import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, message, Modal, Drawer, Form, Input, DatePicker, Button as AntButton } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchPacientes, createPaciente, updatePaciente, deletePaciente } from '../services';
import dayjs from 'dayjs';

const Pacientes = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingPaciente, setEditingPaciente] = useState(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: pacientes, isLoading, isError, error } = useQuery({
        queryKey: ['pacientes'],
        queryFn: fetchPacientes
    });

    const onMutationSuccess = (successMessage) => {
        message.success(successMessage);
        setIsDrawerOpen(false);
        setEditingPaciente(null);
        form.resetFields();
        queryClient.invalidateQueries({ queryKey: ['pacientes'] });
    };

    const createMutation = useMutation({
        mutationFn: createPaciente,
        onSuccess: () => onMutationSuccess('Paciente criado com sucesso!'),
        onError: (err) => message.error(`Erro ao criar paciente: ${err.message}`),
    });

    const updateMutation = useMutation({
        mutationFn: updatePaciente,
        onSuccess: () => onMutationSuccess('Paciente atualizado com sucesso!'),
        onError: (err) => message.error(`Erro ao atualizar paciente: ${err.message}`),
    });

    const deleteMutation = useMutation({
        mutationFn: deletePaciente,
        onSuccess: (data) => onMutationSuccess(data || 'Paciente deletado com sucesso!'),
        onError: (err) => message.error(`Erro ao deletar paciente: ${err.message}`),
    });

    const handleAdd = () => {
        setEditingPaciente(null);
        form.resetFields();
        setIsDrawerOpen(true);
    };

    const handleEdit = (record) => {
        setEditingPaciente(record);
        form.setFieldsValue({
            ...record,
            data_nascimento: record.data_nascimento ? dayjs(record.data_nascimento) : null,
        });
        setIsDrawerOpen(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Você tem certeza que quer deletar este paciente?',
            content: `Nome: ${record.nome_paciente}\nCPF: ${record.cpf_paciente}`,
            okText: 'Sim, deletar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: () => {
                deleteMutation.mutate(record.cpf_paciente);
            },
        });
    };

    const onDrawerClose = () => {
        setIsDrawerOpen(false);
        setEditingPaciente(null);
        form.resetFields();
    };

    const onFormSubmit = (values) => {
        const pacienteData = {
            ...values,
            data_nascimento: values.data_nascimento.format('YYYY-MM-DD'),
        };

        if (editingPaciente) {
            updateMutation.mutate({ ...pacienteData, cpf_paciente: editingPaciente.cpf_paciente });
        } else {
            createMutation.mutate(pacienteData);
        }
    };

    const columns = [
        { title: 'Nome do Paciente', dataIndex: 'nome_paciente', key: 'nome_paciente' },
        { title: 'CPF', dataIndex: 'cpf_paciente', key: 'cpf_paciente' },
        { title: 'Plano de Saúde', dataIndex: 'plano_saude', key: 'plano_saude' },
        { title: 'Data de Nascimento', dataIndex: 'data_nascimento', key: 'data_nascimento', render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '' },
        {
            title: 'Ações', key: 'acoes',
            render: (_, record) => (
                <div className="flex items-center gap-4">
                    <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-800"><EditOutlined className="text-xl" /></button>
                    <button onClick={() => handleDelete(record)} className="text-red-500 hover:text-red-700"><DeleteOutlined className="text-xl" /></button>
                </div>
            ),
        },
    ];

    if (isError) {
        return <span>Erro ao carregar dados: {error.message}</span>
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Pacientes</h1>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-[#1D8BCC] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#3693c9] transition-colors">
                    <PlusOutlined />
                    <span>Novo Paciente</span>
                </button>
            </header>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <Table columns={columns} dataSource={pacientes} loading={isLoading} rowKey="cpf_paciente" />
            </div>

            <Drawer
                title={editingPaciente ? 'Editar Paciente' : 'Adicionar Novo Paciente'}
                width={720}
                onClose={onDrawerClose}
                open={isDrawerOpen}
                bodyStyle={{ paddingBottom: 80 }}
                extra={
                    <div className="flex gap-2">
                        <AntButton onClick={onDrawerClose}>Cancelar</AntButton>
                        <AntButton onClick={() => form.submit()} type="primary" loading={createMutation.isPending || updateMutation.isPending}>
                            Salvar
                        </AntButton>
                    </div>
                }
            >
                <Form layout="vertical" form={form} onFinish={onFormSubmit}>
                    <Form.Item name="nome_paciente" label="Nome Completo" rules={[{ required: true, message: 'Por favor, insira o nome do paciente' }]}>
                        <Input placeholder="Insira o nome completo" />
                    </Form.Item>
                    <Form.Item name="cpf_paciente" label="CPF" rules={[{ required: true, message: 'Por favor, insira o CPF' }, { pattern: /^\d{11}$/, message: 'O CPF deve conter exatamente 11 dígitos numéricos' }]}>
                        <Input placeholder="Insira os 11 dígitos do CPF" disabled={!!editingPaciente} />
                    </Form.Item>
                    <Form.Item name="plano_saude" label="Plano de Saúde" rules={[{ required: true, message: 'Por favor, insira o plano de saúde' }]}>
                        <Input placeholder="Insira o nome do plano de saúde" />
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