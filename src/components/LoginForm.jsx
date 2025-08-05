import React, { useState } from "react";
import "../css/LoginForm.css";

const LoginForm = () => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    // Validación simple de prueba
    if (user === "Admin" && password === "Lipoolcover55") {
      localStorage.setItem("user", user);
      window.location.href = "/dashboard"; // o usa navigate si tienes react-router
    } else {
      alert("Credenciales inválidas");
    }
  };

  return (
    <div className="login-form-container">
      <h2 className="login-title">Prices Calculator</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <label>USUARIO</label>
        <input
          type="text"
          placeholder="Ingrese su nombre de usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />

        <label>CONTRASEÑA</label>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Ingrese su contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="checkbox">
          <input
            type="checkbox"
            id="show"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          <label htmlFor="show">Mostrar contraseña</label>
        </div>

        <button type="submit" className="login-btn">
          INGRESAR
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
