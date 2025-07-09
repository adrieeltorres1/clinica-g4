import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, message, Modal, Drawer, Form, Input, Button as AntButton } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchEspecialidades, createEspecialidade, updateEspecialidade, deleteEspecialidade } from '../services';

const Especialidades = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingEspecialidade, setEditingEspecialidade] = useState(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: especialidades, isLoading, isError, error } = useQuery({
        queryKey: ['especialidades'],
        queryFn: fetchEspecialidades,
    });

    const onMutationSuccess = (successMessage) => {
        message.success(successMessage);
        setIsDrawerOpen(false);
        setEditingEspecialidade(null);
        form.resetFields();
        queryClient.invalidateQueries({ queryKey: ['especialidades'] });
    };

    const createMutation = useMutation({
        mutationFn: createEspecialidade,
        onSuccess: () => onMutationSuccess('Especialidade criada com sucesso!'),
        onError: (err) => message.error(err.response?.data?.message || 'Erro ao criar especialidade.'),
    });

    const updateMutation = useMutation({
        mutationFn: updateEspecialidade,
        onSuccess: () => onMutationSuccess('Especialidade atualizada com sucesso!'),
        onError: (err) => message.error(err.response?.data?.message || 'Erro ao atualizar especialidade.'),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteEspecialidade,
        onSuccess: () => onMutationSuccess('Especialidade deletada com sucesso!'),
        onError: (err) => message.error(err.response?.data?.message || 'Erro ao deletar especialidade.'),
    });

    const handleAdd = () => {
        setEditingEspecialidade(null);
        form.resetFields();
        setIsDrawerOpen(true);
    };

    const handleEdit = (record) => {
        setEditingEspecialidade(record);
        form.setFieldsValue(record);
        setIsDrawerOpen(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Você tem certeza que quer deletar esta especialidade?',
            content: `Especialidade: ${record.nome_especialidade}`,
            okText: 'Sim, deletar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: () => {
                deleteMutation.mutate(record.id_especialidade);
            },
        });
    };

    const onDrawerClose = () => {
        setIsDrawerOpen(false);
        setEditingEspecialidade(null);
        form.resetFields();
    };

    const onFormSubmit = (values) => {
        if (editingEspecialidade) {
            updateMutation.mutate({ id: editingEspecialidade.id_especialidade, data: values });
        } else {
            createMutation.mutate(values);
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id_especialidade', key: 'id_especialidade', width: '20%' },
        { title: 'Nome da Especialidade', dataIndex: 'nome_especialidade', key: 'nome_especialidade' },
        {
            title: 'Ações',
            key: 'acoes',
            width: '20%',
            align: 'center',
            render: (_, record) => (
                <div className="flex items-center justify-center gap-4">
                    <button onClick={() => handleEdit(record)} className="text-[#1D8BCC] hover:text-blue-800">
                        <EditOutlined className="text-xl" />
                    </button>
                    <button onClick={() => handleDelete(record)} className="text-red-500 hover:text-red-700">
                        <DeleteOutlined className="text-xl" />
                    </button>
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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Especialidades</h1>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-[#1D8BCC] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#3693c9] transition-colors">
                    <PlusOutlined />
                    <span>Nova Especialidade</span>
                </button>
            </header>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <Table columns={columns} dataSource={especialidades} loading={isLoading} rowKey="id_especialidade" />
            </div>

            <Drawer
                title={editingEspecialidade ? 'Editar Especialidade' : 'Adicionar Nova Especialidade'}
                width={500}
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
                        name="nome_especialidade"
                        label="Nome da Especialidade"
                        rules={[{ required: true, message: 'Por favor, insira o nome da especialidade' }]}
                    >
                        <Input placeholder="Ex: Cardiologia" />
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    );
}

export default Especialidades;