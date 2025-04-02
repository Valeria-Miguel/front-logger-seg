import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import './Home.css';
import { getApiUrl } from '../config/apiConfig';

const Home = () => {
    const [systemInfo, setSystemInfo] = useState({
        nodeVersion: "",
        alumno: {
            nombreCompleto: "",
            grupo: ""
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const staticInfo = {
        alumno: {
            nombreCompleto: "Dulce Valeria Miguel Juan",
            grado: "8vo cuatrimestre",
            grupo: "IDGS11",
            carrera : "Ingeniería en Desarrollo de Software"
        },
        docente: {
            nombreCompleto: "M.C.C. Emmanuel Martínez Hernández",
            materia: "SEGURIDAD EN EL DESARROLLO DE APLICACIONES"
        },
        appDescription: "Esta aplicación es un sistema de gestión de logs en tiempo real con autenticación de dos factores (MFA). Permite monitorear y registrar todas las actividades del sistema de manera segura."
    };

    useEffect(() => {
        const fetchSystemInfo = async () => {
            try {
                const token = localStorage.getItem("token");
                
                if (!token) {
                    navigate("/login");
                    return;
                }
               
               const response = await axios.get(getApiUrl ('/api/getInfo'), {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Cache-Control': 'no-cache' 
                    },
                    timeout: 5000 
                });

                if (!response.data.studentInfo) {
                    throw new Error("Estructura de respuesta inválida");
                }
    
                setSystemInfo({
                    nodeVersion: response.data.nodeVersion,
                    alumno: {
                        nombreCompleto: response.data.studentInfo.fullName,
                        grupo: response.data.studentInfo.group
                    }
                });
            } catch (err) {
                console.error("Ocurrió un error. Inténtalo de nuevo más tarde.");
                
                if (err.response?.status === 401 || err.message.includes("token")) {
                    localStorage.removeItem("token");
                    navigate("/login");
                } else {
                    setError("Error al obtener la información del sistema. Intenta recargar la página.");
                }
            } finally {
                setLoading(false);
            }
        };
    
        fetchSystemInfo();
    }, [navigate]);


    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    if (loading) return <div className="loading">Cargando información del sistema...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="home-container">
            <header>
                <h1>Panel de Control- Proyecto Final</h1>
                <button onClick={handleLogout} className="logout-btn">
                    Cerrar Sesión
                </button>
            </header>

            
            <div className="info-grid">
              {/*  <div className="info-card">
                    <h2>Información del Alumno</h2>
                    <div className="info-content">
                        <p><strong>Nombre:</strong> {systemInfo.alumno.nombreCompleto}</p>
                        <p><strong>Grupo:</strong> {systemInfo.alumno.grupo}</p>
                        <p><strong>Grado:</strong> 5° Cuatrimestre</p>
                        <p><strong>Carrera:</strong> Ingeniería en Desarrollo de Software</p>
                    </div>
                </div>*/}
                {/* Tarjeta del Alumno */}
                <div className="info-card">
                    <h2>Información del Alumno</h2>
                    <div className="info-content">
                        <div className="info-row">
                            <span className="info-label">Nombre:</span>
                            <span className="info-value">{staticInfo.alumno.nombreCompleto}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Grado:</span>
                            <span className="info-value">{staticInfo.alumno.grado}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Grupo:</span>
                            <span className="info-value">{staticInfo.alumno.grupo}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Carrera:</span>
                            <span className="info-value">{staticInfo.alumno.carrera}</span>
                        </div>
                    </div>
                </div>

                <div className="info-card">
                    <h2>Información del Docente</h2>
                    <div className="info-content">
                        <div className="info-row">
                            <span className="info-label">Nombre:</span>
                            <span className="info-value">{staticInfo.docente.nombreCompleto}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Materia:</span>
                            <span className="info-value">{staticInfo.docente.materia}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="app-description">
                <h2>Acerca de la Aplicación</h2>
                <p>{staticInfo.appDescription}</p>
            </div>

            <div className="action-section">
                <Link to="/logs" className="logs-button">
                    <i className="fas fa-clipboard-list"></i> Ver Registros del Sistema
                </Link>
            </div>
        </div>
    );
};

export default Home;