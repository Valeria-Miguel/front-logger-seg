import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { getApiUrl, getApiUrlDos } from '../config/apiConfig';
import './Logs.css';
import LogsCharts from './LogsCharts';

const Logs = () => {
    const [server1Logs, setServer1Logs] = useState([]);
    const [server2Logs, setServer2Logs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState({
        logLevel: 'all',
        method: 'all',
        status: 'all',
        minResponseTime: '',
        maxResponseTime: '',
        searchTerm: ''
    });
    const [activeTab, setActiveTab] = useState('server1');
    const [showCharts, setShowCharts] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        
        // Obtener logs iniciales de ambos servidores
        const fetchInitialLogs = async () => {
            try {
                const server1Request = axios.get(getApiUrl('/api/logs'), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const server2Request = axios.get(getApiUrlDos('/api/logs'), {
                    headers: { Authorization: `Bearer ${token}` }
                });
        
                const [res1, res2] = await Promise.all([server1Request, server2Request]);
                
                setServer1Logs(res1.data);
                setServer2Logs(res2.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || "Error al obtener logs");
                setLoading(false);
            }
        };
    
        fetchInitialLogs();
       
        // Configurar SSE para ambos servidores
        const eventSource1 = new EventSource(`${getApiUrl('/api/logs/stream')}?token=${token}`);
        const eventSource2 = new EventSource(`${getApiUrlDos('/api/logs/stream')}?token=${token}`);
    
        const handleNewLog = (setLogsFunction) => (e) => {
            try {
                const newLog = JSON.parse(e.data);
                setLogsFunction(prevLogs => {
                    const updatedLogs = [newLog, ...prevLogs];
                    return updatedLogs.length > 100 ? updatedLogs.slice(0, 100) : updatedLogs;
                });
            } catch (error) {
                console.error("Error procesando nuevo log:", error);
            }
        };
    
        eventSource1.addEventListener('newLog', handleNewLog(setServer1Logs));
        eventSource2.addEventListener('newLog', handleNewLog(setServer2Logs));
    
        const handleError = (eventSource) => () => {
            console.error("Error en SSE");
            eventSource.close();
        };
    
        eventSource1.onerror = handleError(eventSource1);
        eventSource2.onerror = handleError(eventSource2);
    
        return () => {
            eventSource1.close();
            eventSource2.close();
        };
    }, []);

    useEffect(() => {
        console.log("Server 1 Logs sample:", server1Logs.slice(0, 3));
        console.log("Server 2 Logs sample:", server2Logs.slice(0, 3));
      }, []);
    const applyFilters = (logs) => {
        return logs.filter(log => {
            // Filtro por nivel de log
            if (filters.logLevel !== 'all' && log.logLevel !== filters.logLevel) {
                return false;
            }
            
            // Filtro por método HTTP
            if (filters.method !== 'all' && log.method !== filters.method) {
                return false;
            }
            
            // Filtro por status code
            if (filters.status !== 'all' && log.status !== parseInt(filters.status)) {
                return false;
            }
            
            // Filtro por tiempo de respuesta mínimo
            if (filters.minResponseTime && log.responseTime < parseInt(filters.minResponseTime)) {
                return false;
            }
            
            // Filtro por tiempo de respuesta máximo
            if (filters.maxResponseTime && log.responseTime > parseInt(filters.maxResponseTime)) {
                return false;
            }
            
            // Filtro por término de búsqueda
            if (filters.searchTerm) {
                const searchTerm = filters.searchTerm.toLowerCase();
                const logString = JSON.stringify(log).toLowerCase();
                if (!logString.includes(searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const currentLogs = activeTab === 'server1' ? server1Logs : server2Logs;
    const filteredLogs = applyFilters(currentLogs);

    if (loading) return <div className="loading">Cargando logs...</div>;
    if (error) return <div className="error">{error}</div>;


    return (
        <div className="logs-container">
            <h1>Monitor de Logs</h1>
            
            <div className="controls">
                <div className="server-tabs">
                    <button  onClick={() => setActiveTab('server1')} className={`tab-button ${activeTab === 'server1' ? 'active' : ''}`}>
                        Servidor 1 (Con Rate Limit)
                    </button>
                    <button onClick={() => setActiveTab('server2')} className={`tab-button ${activeTab === 'server2' ? 'active' : ''}`}>
                        Servidor 2 (Sin Rate Limit)
                    </button>
                </div>
                <button onClick={() => setShowCharts(!showCharts)} className="toggle-charts">
                    {showCharts ? 'Ocultar Gráficas' : 'Mostrar Gráficas'}
                </button>
            </div>

            {showCharts && (
  <LogsCharts 
    server1Logs={server1Logs} 
    server2Logs={server2Logs}
    timeRange="hour" // Valor inicial
    onTimeRangeChange={(range) => console.log('Cambio de rango:', range)} // Manejador básico
  />
)}
            
            <div className="filters-section">
                <h3>Filtros</h3>
                <div className="filter-grid">
                    <div className="filter-group">
                        <label>Nivel de Log:</label>
                        <select name="logLevel" value={filters.logLevel} onChange={handleFilterChange}>
                            <option value="all">Todos</option>
                            <option value="error">Error</option>
                            <option value="warn">Warning</option>
                            <option value="info">Info</option>
                            <option value="debug">Debug</option>
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label>Método HTTP:</label>
                        <select name="method" value={filters.method} onChange={handleFilterChange}>
                            <option value="all">Todos</option>
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="PATCH">PATCH</option>
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label>Status Code:</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange}>
                            <option value="all">Todos</option>
                            <option value="200">200 (OK)</option>
                            <option value="201">201 (Created)</option>
                            <option value="400">400 (Bad Request)</option>
                            <option value="401">401 (Unauthorized)</option>
                            <option value="404">404 (Not Found)</option>
                            <option value="500">500 (Server Error)</option>
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label>Tiempo Resp. Mín (ms):</label>
                        <input 
                            type="number" 
                            name="minResponseTime" 
                            value={filters.minResponseTime}
                            onChange={handleFilterChange}
                            placeholder="Mínimo"
                        />
                    </div>
                    
                    <div className="filter-group">
                        <label>Tiempo Resp. Máx (ms):</label>
                        <input 
                            type="number" 
                            name="maxResponseTime" 
                            value={filters.maxResponseTime}
                            onChange={handleFilterChange}
                            placeholder="Máximo"
                        />
                    </div>
                    
                    <div className="filter-group search-group">
                        <label>Buscar:</label>
                        <input 
                            type="text" 
                            name="searchTerm" 
                            value={filters.searchTerm}
                            onChange={handleFilterChange}
                            placeholder="Término de búsqueda"
                        />
                    </div>
                </div>
            </div>
            
            <div className="logs-count">
                Mostrando {filteredLogs.length} de {currentLogs.length} logs
            </div>
            
            <div className="logs-list">
                {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, index) => (
                        <div key={index} className={`log-item log-${log.logLevel}`}>
                            <div className="log-header">
                                <span className="log-timestamp">
                                    {new Date(log.timestamp).toLocaleString()}
                                </span>
                                <span className={`log-level ${log.logLevel}`}>
                                    {log.logLevel.toUpperCase()}
                                </span>
                                <span className="log-method">{log.method}</span>
                                <span className="log-status" data-status={log.status}>
                                    {log.status}
                                </span>
                                <span className="log-response-time">{log.responseTime}ms</span>
                            </div>
                            <div className="log-body">
                                <div className="log-path">{log.path}</div>
                                <div className="log-details-grid">
                                    <div className="detail-item">
                                        <strong>Hostname:</strong> {log.hostname}
                                    </div>
                                    <div className="detail-item">
                                        <strong>IP:</strong> {log.ip}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Protocol:</strong> {log.protocol}
                                    </div>
                                    <div className="detail-item">
                                        <strong>URL:</strong> {log.url}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Environment:</strong> {log.environment}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Node Version:</strong> {log.nodeVersion}
                                    </div>
                                    <div className="detail-item">
                                        <strong>PID:</strong> {log.pid}
                                    </div>
                                    {log.params && Object.keys(log.params).length > 0 && (
                                        <div className="detail-item">
                                            <strong>Params:</strong> 
                                            <pre>{JSON.stringify(log.params, null, 2)}</pre>
                                        </div>
                                    )}
                                    {log.query && Object.keys(log.query).length > 0 && (
                                        <div className="detail-item">
                                            <strong>Query:</strong>
                                            <pre>{JSON.stringify(log.query, null, 2)}</pre>
                                        </div>
                                    )}
                                    <div className="detail-item full-width">
                                        <strong>User Agent:</strong> {log.userAgent}
                                    </div>
                                    {log.system && (
                                        <div className="detail-item full-width">
                                            <strong>System Info:</strong>
                                            <pre>{JSON.stringify(log.system, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-logs">No se encontraron logs con los filtros actuales</div>
                )}
            </div>
        </div>
    );
};

export default Logs;