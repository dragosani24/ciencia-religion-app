import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

interface RegisterFormProps {
  onClose?: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterForm({ onClose, onSwitchToLogin }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Calcular ancho de la barra de scroll
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Establecer variable CSS
    document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    
    // Agregar clase para bloquear scroll
    document.body.classList.add('modal-open');
    
    return () => {
      document.body.classList.remove('modal-open');
      document.documentElement.style.removeProperty('--scrollbar-width');
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Error al registrar usuario");
        return;
      }

      // Auto login después del registro
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Usuario creado pero error al iniciar sesión");
      } else {
        router.push("/");
        onClose?.();
      }
    } catch (err) {
      setError("Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google");
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2>Crear Cuenta</h2>
        
        <button onClick={handleGoogleSignIn} className="google-btn">
          <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" />
          Continuar con Google
        </button>

        <div className="divider">
          <span>o</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Repite tu contraseña"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <div className="switch-auth">
          ¿Ya tienes cuenta?{" "}
          <button onClick={onSwitchToLogin} className="link-btn">
            Inicia sesión
          </button>
        </div>

        <style jsx>{`
          .auth-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }

          .auth-modal {
            background: #1a1a1b;
            border-radius: 12px;
            padding: 2rem;
            width: 90%;
            max-width: 400px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          }

          .close-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: transparent;
            border: none;
            color: #ccc;
            font-size: 2rem;
            cursor: pointer;
            line-height: 1;
            transition: color 0.2s;
          }

          .close-btn:hover {
            color: white;
          }

          h2 {
            color: white;
            margin-bottom: 1.5rem;
            font-size: 1.5rem;
          }

          .google-btn {
            width: 100%;
            background: white;
            color: #333;
            border: none;
            padding: 12px;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-weight: 600;
            transition: background 0.2s;
            margin-bottom: 1rem;
          }

          .google-btn:hover {
            background: #f0f0f0;
          }

          .google-btn img {
            width: 20px;
            height: 20px;
          }

          .divider {
            text-align: center;
            margin: 1.5rem 0;
            position: relative;
          }

          .divider::before {
            content: "";
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: #343536;
          }

          .divider span {
            background: #1a1a1b;
            padding: 0 1rem;
            position: relative;
            color: #818384;
          }

          .form-group {
            margin-bottom: 1rem;
          }

          label {
            display: block;
            color: #d7dadc;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
          }

          input {
            width: 100%;
            padding: 10px;
            background: #272729;
            border: 1px solid #343536;
            border-radius: 6px;
            color: white;
            font-size: 1rem;
          }

          input:focus {
            outline: none;
            border-color: #d4af37;
          }

          .error-message {
            background: #ff4444;
            color: white;
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 1rem;
            font-size: 0.9rem;
          }

          .submit-btn {
            width: 100%;
            background: #d4af37;
            color: #1a1a1b;
            border: none;
            padding: 12px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            font-size: 1rem;
            transition: background 0.2s;
          }

          .submit-btn:hover:not(:disabled) {
            background: #c19b2f;
          }

          .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .switch-auth {
            margin-top: 1.5rem;
            text-align: center;
            color: #818384;
            font-size: 0.9rem;
          }

          .link-btn {
            background: transparent;
            border: none;
            color: #d4af37;
            cursor: pointer;
            font-weight: 600;
            text-decoration: underline;
          }

          .link-btn:hover {
            color: #c19b2f;
          }
        `}</style>
      </div>
    </div>
  );
}
