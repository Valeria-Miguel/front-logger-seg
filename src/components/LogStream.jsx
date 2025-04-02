import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/apiConfig';

const LogStream = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {

        const token = localStorage.getItem('token');
     
        const eventSource = new EventSource(`${getApiUrl('/api/logs/stream')}`, {
            headers: { Authorization: `Bearer ${token}` } 
        });

        eventSource.onmessage = (event) => {
            const newLog = JSON.parse(event.data);
            setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 49)]); 
        };

        return () => eventSource.close(); 
    }, []);

    return (
        <div>
            <h2>Logs en Tiempo Real</h2>
            <ul>
                {logs.map((log, index) => (
                    <li key={index}>
                        [{new Date(log.Timestamp).toLocaleString()}] {log.method} {log.path} - {log.status}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LogStream;