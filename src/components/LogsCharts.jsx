import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import './LogsCharts.css';

Chart.register(...registerables);

const LogsCharts = ({ server1Logs, server2Logs }) => {
    const [timeRange, setTimeRange] = useState('hour');
    const [selectedMetric, setSelectedMetric] = useState('logLevel');
    const [timeData, setTimeData] = useState({ labels: [], datasets: [] });
    const [comparisonData, setComparisonData] = useState({ labels: [], datasets: [] });
    
    // Opciones de métricas para comparar
    const metricOptions = [
        { value: 'logLevel', label: 'Niveles de Log' },
        { value: 'method', label: 'Métodos HTTP' },
        { value: 'status', label: 'Códigos de Estado' },
        { value: 'responseTime', label: 'Tiempo de Respuesta' },
    ];

    // Procesar datos para gráfica temporal
    useEffect(() => {
        const processTimeData = () => {
            const now = new Date();
            let labels = [];
            let timeInterval;

            // Definir intervalos de tiempo según el rango seleccionado
            switch(timeRange) {
                case 'hour':
                    labels = Array.from({ length: 12 }, (_, i) => {
                        const date = new Date(now);
                        date.setMinutes(date.getMinutes() - (60 - i*5));
                        return date.toLocaleTimeString();
                    });
                    timeInterval = 5 * 60 * 1000; // 5 minutos
                    break;
                case 'day':
                    labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
                    timeInterval = 60 * 60 * 1000; // 1 hora
                    break;
                case 'week':
                    labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
                    timeInterval = 24 * 60 * 60 * 1000; // 1 día
                    break;
                default:
                    break;
            }

            const processServerData = (logs, serverName, colors) => {
                const levels = ['info', 'error', 'warn'];
                return levels.map((level, idx) => {
                    const data = labels.map((_, i) => {
                        const startTime = new Date(now.getTime() - (timeInterval * (labels.length - i)));
                        const endTime = new Date(startTime.getTime() + timeInterval);
                        
                        return logs.filter(log => {
                            const logTime = new Date(log.timestamp);
                            return log.logLevel === level && 
                                   logTime >= startTime && 
                                   logTime < endTime;
                        }).length;
                    });

                    return {
                        label: `${serverName} - ${level}`,
                        data,
                        borderColor: colors[idx],
                        backgroundColor: colors[idx],
                        tension: 0.3,
                        borderWidth: 2,
                        fill: false
                    };
                });
            };

            const server1Datasets = processServerData(
                server1Logs, 
                'Servidor 1', 
                ['#4bc0c0', '#ff6384', '#ffcd56']
            );
            
            const server2Datasets = processServerData(
                server2Logs, 
                'Servidor 2', 
                ['#36a2eb', '#ff9f40', '#9966ff']
            );

            setTimeData({
                labels,
                datasets: [...server1Datasets, ...server2Datasets]
            });
        };

        processTimeData();
    }, [server1Logs, server2Logs, timeRange]);

    // Procesar datos para gráfica de comparación
    useEffect(() => {
        const processComparisonData = () => {
            let labels = [];
            let server1Data = [];
            let server2Data = [];

            switch(selectedMetric) {
                case 'logLevel':
                    const levels = ['info', 'error', 'warn', 'debug'];
                    labels = levels;
                    server1Data = levels.map(l => 
                        server1Logs.filter(log => log.logLevel === l).length
                    );
                    server2Data = levels.map(l => 
                        server2Logs.filter(log => log.logLevel === l).length
                    );
                    break;
                
                case 'method':
                    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
                    labels = methods;
                    server1Data = methods.map(m => 
                        server1Logs.filter(log => log.method === m).length
                    );
                    server2Data = methods.map(m => 
                        server2Logs.filter(log => log.method === m).length
                    );
                    break;
                
                case 'status':
                    const statusGroups = ['2xx', '3xx', '4xx', '5xx'];
                    labels = statusGroups;
                    server1Data = statusGroups.map(s => 
                        server1Logs.filter(log => Math.floor(log.status/100) === parseInt(s[0])).length
                    );
                    server2Data = statusGroups.map(s => 
                        server2Logs.filter(log => Math.floor(log.status/100) === parseInt(s[0])).length
                    );
                    break;
                
                case 'responseTime':
                    const ranges = ['<100ms', '100-500ms', '500-1000ms', '>1000ms'];
                    labels = ranges;
                    server1Data = [
                        server1Logs.filter(log => log.responseTime < 100).length,
                        server1Logs.filter(log => log.responseTime >= 100 && log.responseTime < 500).length,
                        server1Logs.filter(log => log.responseTime >= 500 && log.responseTime < 1000).length,
                        server1Logs.filter(log => log.responseTime >= 1000).length
                    ];
                    server2Data = [
                        server2Logs.filter(log => log.responseTime < 100).length,
                        server2Logs.filter(log => log.responseTime >= 100 && log.responseTime < 500).length,
                        server2Logs.filter(log => log.responseTime >= 500 && log.responseTime < 1000).length,
                        server2Logs.filter(log => log.responseTime >= 1000).length
                    ];
                    break;
                
                default:
                    break;
            }

            setComparisonData({
                labels,
                datasets: [
                    {
                        label: 'Servidor 1',
                        data: server1Data,
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Servidor 2',
                        data: server2Data,
                        backgroundColor: 'rgba(255, 99, 132, 0.7)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            });
        };

        processComparisonData();
    }, [server1Logs, server2Logs, selectedMetric]);

    const timeChartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Frecuencia de Logs por Tipo y Servidor',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Tiempo'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Cantidad de Logs'
                },
                beginAtZero: true
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    const comparisonChartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: `Comparación de ${metricOptions.find(m => m.value === selectedMetric)?.label}`,
            },
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <div className="advanced-charts-container">
            <div className="chart-controls">
                <div className="control-group">
                    <label>Rango de tiempo:</label>
                    <select 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <option value="hour">Última hora</option>
                        <option value="day">Últimas 24 horas</option>
                        <option value="week">Última semana</option>
                    </select>
                </div>
                
                <div className="control-group">
                    <label>Métrica a comparar:</label>
                    <select 
                        value={selectedMetric} 
                        onChange={(e) => setSelectedMetric(e.target.value)}
                    >
                        {metricOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="charts-grid">
                <div className="chart-wrapper">
                    <h3>Distribución Temporal</h3>
                    <Line data={timeData} options={timeChartOptions} />
                </div>
                
                <div className="chart-wrapper">
                    <h3>Comparación Directa</h3>
                    <Bar data={comparisonData} options={comparisonChartOptions} />
                </div>
            </div>
        </div>
    );
};

export default LogsCharts;