import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, message, Modal, Drawer, Form, Input, DatePicker, Button as AntButton } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchMedicos, createMedico, updateMedico, deleteMedico } from '../services';
import dayjs from 'dayjs';

const Medicos = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingMedico, setEditingMedico] = useState(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: medicos, isLoading, isError, error } = useQuery({
        queryKey: ['medicos'],
        queryFn: fetchMedicos
    });

    const onMutationSuccess = (successMessage) => {
        message.success(successMessage);
        setIsDrawerOpen(false);
        setEditingMedico(null);
        form.resetFields();
        queryClient.invalidateQueries({ queryKey: ['medicos'] });
    };

    const createMutation = useMutation({
        mutationFn: createMedico,
        onSuccess: () => onMutationSuccess('Médico criado com sucesso!'),
        onError: (err) => message.error(`Erro ao criar médico: ${err.message}`),
    });

    const updateMutation = useMutation({
        mutationFn: updateMedico,
        onSuccess: () => onMutationSuccess('Médico atualizado com sucesso!'),
        onError: (err) => message.error(`Erro ao atualizar médico: ${err.message}`),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteMedico,
        onSuccess: () => onMutationSuccess('Médico deletado com sucesso!'),
        onError: (err) => message.error(`Erro ao deletar médico: ${err.message}`),
    });

    const handleAdd = () => {
        setEditingMedico(null);
        form.resetFields();
        setIsDrawerOpen(true);
    };

    const handleEdit = (record) => {
        setEditingMedico(record);
        form.setFieldsValue({
            ...record,
            data_nascimento: record.data_nascimento ? dayjs(record.data_nascimento) : null,
        });
        setIsDrawerOpen(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Você tem certeza que quer deletar este médico?',
            content: `Nome: ${record.nome_medico}\nCPF: ${record.cpf_medico}`,
            okText: 'Sim, deletar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: () => {
                deleteMutation.mutate(record.cpf_medico);
            },
        });
    };

    const onDrawerClose = () => {
        setIsDrawerOpen(false);
        setEditingMedico(null);
        form.resetFields();
    };

    const onFormSubmit = (values) => {
        const medicoData = {
            ...values,
            data_nascimento: values.data_nascimento.format('YYYY-MM-DD'),
        };

        if (editingMedico) {
            updateMutation.mutate({ ...medicoData, cpf_medico: editingMedico.cpf_medico });
        } else {
            createMutation.mutate(medicoData);
        }
    };

    const columns = [
        {
            title: 'Nome do Médico', dataIndex: 'nome_medico', key: 'nome_medico',
        },
        {
            title: 'CRM', dataIndex: 'crm_medico', key: 'crm_medico',
        },
        {
            title: 'CPF', dataIndex: 'cpf_medico', key: 'cpf_medico',
        },
        {
            title: 'Data de Nascimento', dataIndex: 'data_nascimento', key: 'data_nascimento', render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '',
        },
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
                <h1 className="text-xl md:text-3xl font-semibold text-gray-800">Médicos</h1>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-[#1D8BCC] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#3693c9] transition-colors">
                    <PlusOutlined />
                    <span>Novo Médico</span>
                </button>
            </header>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <Table columns={columns} dataSource={medicos} loading={isLoading} rowKey="cpf_medico" />
            </div>

            <Drawer
                title={editingMedico ? 'Editar Médico' : 'Adicionar Novo Médico'}
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
                    <Form.Item
                        name="nome_medico"
                        label="Nome Completo"
                        rules={[{ required: true, message: 'Por favor, insira o nome do médico' }]}
                    >
                        <Input placeholder="Insira o nome completo" />
                    </Form.Item>

                    <Form.Item
                        name="crm_medico"
                        label="CRM"
                        rules={[
                            { required: true, message: 'Por favor, insira o CRM' },
                            {
                                pattern: /^\d{5}[a-zA-Z]{2}$/,
                                message: 'O CRM deve ter 5 números e 2 letras (ex: 12345SP)'
                            }
                        ]}
                    >
                        <Input placeholder="Insira o CRM no formato 12345SP" />
                    </Form.Item>

                    <Form.Item
                        name="cpf_medico"
                        label="CPF"
                        rules={[
                            { required: true, message: 'Por favor, insira o CPF' },
                            {
                                pattern: /^\d{11}$/,
                                message: 'O CPF deve conter 11 dígitos numéricos'
                            }
                        ]}
                    >
                        <Input placeholder="Insira os 11 dígitos do CPF" disabled={!!editingMedico} />
                    </Form.Item>

                    <Form.Item
                        name="data_nascimento"
                        label="Data de Nascimento"
                        rules={[{ required: true, message: 'Por favor, selecione a data de nascimento' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    );
}

export default Medicos;