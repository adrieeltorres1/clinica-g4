import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Column, Pie, Line } from '@ant-design/charts';
import { Card, Spin, Row, Col } from 'antd';
import {
    fetchPlanos,
    fetchPacientesPorPlano,
    fetchNovosPacientesPorMes,
    fetchResumoIdades,
} from '../services';

const Relatorio = () => {
    const {
        data: planos,
        isLoading: carregandoPlanos,
    } = useQuery({
        queryKey: ['planos'],
        queryFn: fetchPlanos,
        select: (dadosRecebidos) =>
            dadosRecebidos.map((plano) => ({
                ...plano,
                preco: parseFloat(plano.preco),
            })),
    });

    const {
        data: dadosPizza,
        isLoading: carregandoPizza,
    } = useQuery({
        queryKey: ['pacientesPorPlano'],
        queryFn: fetchPacientesPorPlano,
    });

    const {
        data: dadosLinha,
        isLoading: carregandoLinha,
        isError: isLinhaError,
        error: linhaError,
    } = useQuery({
        queryKey: ['novosPacientesPorMes'],
        queryFn: fetchNovosPacientesPorMes,
    });
  const {
  data: resumoIdades,
  isLoading: carregandoResumo,
  isError: erroResumo,
  error: erroResumoDetalhe,
} = useQuery({
  queryKey: ['resumoIdades'],
  queryFn: fetchResumoIdades,
});


    const planosOrdenados = planos?.slice().sort((a, b) => a.preco - b.preco) || [];

        const configGraficoColunas = {
        data: planosOrdenados,
        xField: 'nome_plano',
        yField: 'preco',
        colorField: 'nome_plano', 
        label: {
            position: 'top',
            style: { fill: '#666' },
        },
        xAxis: {
            label: { autoHide: true, autoRotate: false },
        },
        meta: {
            nome_plano: { alias: 'Plano' },
            preco: {
                alias: 'Preço',
                formatter: (valor) => `R$ ${valor.toFixed(2)}`,
            },
        },
    };


    const configGraficoPizza = {
        data: dadosPizza || [],
        angleField: 'valor',
        colorField: 'tipo',
        radius: 0.8,
        tooltip: {
            title: (datum) => datum.tipo,
            formatter: (datum) => ({
                name: 'Quantidade',
                value: `${datum.valor} paciente(s)`,
            }),
        },

        interactions: [{ type: 'element-active' }],
    };
    const configGraficoLinha = {
        data: dadosLinha || [],
        xField: 'mes',
        yField: 'novos_pacientes',
        smooth: true,
        color: '#52c41a',
        point: {
            size: 5,
            shape: 'circle',
        },
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Relatórios</h1>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <Card title="Preços por Plano de Saúde" variant="borderless" className="shadow-md h-full">
                        {carregandoPlanos ? (
                            <div className="flex justify-center items-center h-96">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <Column {...configGraficoColunas} height={400} />
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="Distribuição de Pacientes por Plano" variant="borderless" className="shadow-md h-full">
                        {carregandoPizza ? (
                            <div className="flex justify-center items-center h-96">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <Pie {...configGraficoPizza} height={400} />
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    <Card title="Novos Pacientes por Mês" variant="borderless" className="shadow-md h-full">
                        {carregandoLinha ? (
                            <div className="flex justify-center items-center h-96">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <Line {...configGraficoLinha} height={400} />
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <div className="flex flex-col gap-4 h-full">
                        <Card variant="borderless" className="shadow-md text-center">
                            <h3 className="text-lg font-semibold text-gray-700">Médicos com mais de 50 anos</h3>
                            {carregandoResumo ? (
                                <Spin />
                            ) : erroResumo ? (
                                <p className="text-red-500">Erro ao carregar</p>
                            ) : (
                                <p className="text-2xl font-bold text-green-600">
                                    {typeof resumoIdades?.medicosAcima50 === 'number'
                                        ? resumoIdades.medicosAcima50
                                        : '—'}
                                </p>
                            )}
                        </Card>


                        <Card variant="borderless" className="shadow-md text-center">
                            <h3 className="text-lg font-semibold text-gray-700">Pacientes com mais de 18 anos</h3>
                            {carregandoResumo || resumoIdades === undefined ? (
                                <Spin />
                            ) : (
                                <p className="text-2xl font-bold text-blue-600">
                                    {typeof resumoIdades.pacientes18ouMais === 'number'
                                        ? resumoIdades.pacientes18ouMais
                                        : '—'}
                                </p>
                            )}
                        </Card>
                    </div>
                </Col>

            </Row>
        </div>
    );
};

export default Relatorio;


