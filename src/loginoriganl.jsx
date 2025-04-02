import React,{ useState } from "react";
import axios from "axios";
//import 
import {QRCodeSVG} from "qrcode.react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [secretUrl, setSecretUrl] = useState("");
    const [opt, setOpt] = useState("");
    const [step, setStep] = useState("login");
    const handleRegister = async (e) => {
        e.preventDefault();
        const res = await axios.post("http://localhost:3001/register", {
            email, 
            password,
        });
        console.log("registroooo",res.data.secret);
        setSecretUrl(res.data.secret);
        setStep("qr");
    };

const handleLogin = async (e) => {
    e.preventDefault();
    const res = await axios.post("http://localhost:3001/login", {
         email, 
        password,
    });
    console.log("login ",res.data);
    if (res.data.requireMFA) setStep("otp");
}

const verifyOPT = async (e) => {
    e.preventDefault();
    const res = await axios.post("http://localhost:3001/verify-otp", {
        email, 
        token: opt,
    });
    alert(res.data.success ?"Authenticado ✌!" : "Codigo invalido👎")
};

return (
    <div>
        {step === "login" && (
            <form onSubmit ={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                <button type="submit">Login</button>
                <button onClick={handleRegister}>Registrar</button>
            </form>
        )}
        
        {step === "qr" && (
            <div>
                <QRCodeSVG value={secretUrl} /> 
                <p>Escanea este QR con goolge authenticator</p>
                <button onClick={() => setStep("login")}>Regresar</button>
            </div>
        )}

        {step=== "otp" && (
            <form onSubmit={verifyOPT}>
                <input
                type="text"
                placeholder="Código OPT"
                value={opt}
                onChange={(e) => setOpt(e.target.value)}
                />
                <button type="submit">Verificar</button>
            </form>
        )}
    </div>
    );
};

export default Login;