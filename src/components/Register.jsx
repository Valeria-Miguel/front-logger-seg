import React, { useState } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from '../config/apiConfig';
import './Home.css';

const Register = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [mfaUrl, setMfaUrl] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(getApiUrl ('/register'), {
                email: email.trim(),
                username: username.trim(),
                password: password.trim()
            }, {
                headers: { "Content-Type": "application/json" }
            });
            
            if (res.data.mfaUrl) {
                setMfaUrl(res.data.mfaUrl);
            } else {
                setError("No se recibió la URL MFA del servidor");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Error al registrar");
        }
    };
    
    return (
        <div className="auth-container">
            {!mfaUrl ? (
                <form onSubmit={handleRegister}>
                    <h2>Registro</h2>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Registrarse</button>
                    {error && <p className="error">{error}</p>}
                </form>
            ) : (
                <div className="mfa-setup">
                    <h3>Configura Autenticación en 2 Pasos</h3>
                    <QRCodeSVG value={mfaUrl} />
                    <p>Escanea este código con Google Authenticator</p>
                    <button onClick={() => navigate("/login")}>Continuar al Login</button>
                </div>
            )}
        </div>
    );
};

export default Register;