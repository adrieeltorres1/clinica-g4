import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// NOVO: Importado o InputNumber para o campo de preço
import { Table, message, Modal, Drawer, Form, Input, Button as AntButton, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchPlanos, createPlano, updatePlano, deletePlano } from '../services';

const Planos = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingPlano, setEditingPlano] = useState(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: planos, isLoading, isError, error } = useQuery({
        queryKey: ['planos'],
        queryFn: fetchPlanos
    });

    const onMutationSuccess = (successMessage) => {
        message.success(successMessage);
        setIsDrawerOpen(false);
        setEditingPlano(null);
        form.resetFields();
        queryClient.invalidateQueries({ queryKey: ['planos'] });
    };

    const createMutation = useMutation({
        mutationFn: createPlano,
        onSuccess: () => onMutationSuccess('Plano criado com sucesso!'),
        onError: (err) => message.error(err.response?.data?.message || 'Erro ao criar plano, esse plano já existe!'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updatePlano(id, data),
        onSuccess: () => onMutationSuccess('Plano atualizado com sucesso!'),
        onError: (err) => message.error(err.response?.data?.message || 'Erro ao atualizar plano.'),
    });

    const deleteMutation = useMutation({
        mutationFn: deletePlano,
        onSuccess: () => onMutationSuccess('Plano deletado com sucesso!'),
        onError: (err) => message.error(err.response?.data?.error || 'Erro ao deletar plano.'),
    });

    const handleAdd = () => {
        setEditingPlano(null);
        form.resetFields();
        setIsDrawerOpen(true);
    };

    // ALTERADO: Agora preenche o formulário com todos os dados do registro, incluindo o preço
    const handleEdit = (record) => {
        setEditingPlano(record);
        form.setFieldsValue(record); // Preenche nome_plano e preco automaticamente
        setIsDrawerOpen(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Você tem certeza que quer deletar este plano?',
            content: `Plano: ${record.nome_plano}`,
            okText: 'Sim, deletar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: () => {
                deleteMutation.mutate(record.nome_plano);
            },
        });
    };

    const onDrawerClose = () => {
        setIsDrawerOpen(false);
        setEditingPlano(null);
        form.resetFields();
    };

    const onFormSubmit = (values) => {
        // A conversão do preço para número é feita automaticamente pelo InputNumber
        const dataToSend = {
            ...values,
            preco: parseFloat(values.preco) || 0, // Garante que é um número
        }

        if (editingPlano) {
            updateMutation.mutate({ id: editingPlano.id_plano, data: dataToSend });
        } else {
            createMutation.mutate(dataToSend);
        }
    };

    // ALTERADO: Adicionada a coluna de Preço
    const columns = [
        { title: 'ID', dataIndex: 'id_plano', key: 'id_plano', width: '10%' },
        { title: 'Nome do Plano', dataIndex: 'nome_plano', key: 'nome_plano' },
        {
            title: 'Preço',
            dataIndex: 'preco',
            key: 'preco',
            // Formata o número para o formato de moeda R$
            render: (preco) =>
                new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                }).format(preco || 0),
        },
        {
            title: 'Ações',
            key: 'acoes',
            width: '15%',
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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Planos</h1>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-[#1D8BCC] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#3693c9] transition-colors">
                    <PlusOutlined />
                    <span>Novo Plano</span>
                </button>
            </header>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <Table columns={columns} dataSource={planos} loading={isLoading} rowKey="id_plano" />
            </div>

            <Drawer
                title={editingPlano ? 'Editar Plano' : 'Adicionar Novo Plano'}
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
                        name="nome_plano"
                        label="Nome do Plano"
                        rules={[{ required: true, message: 'Por favor, insira o nome do plano' }]}
                    >
                        <Input placeholder="Insira o nome do plano" />
                    </Form.Item>

                    {/* NOVO: Adicionado o campo de preço no formulário */}
                    <Form.Item
                        name="preco"
                        label="Preço (R$)"
                        rules={[{ required: true, message: 'Por favor, insira o preço' }]}
                    >
                        <InputNumber
                            prefix="R$ "
                            style={{ width: '100%' }}
                            precision={2}
                            step="0.10"
                            placeholder="Ex: 89.90"
                        />
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    );
}

export default Planos;