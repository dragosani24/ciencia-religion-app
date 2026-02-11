import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link href="/" className="logo">
          Jesus Ceballos Dosamantes - Ciencia y Religión del Porvenir
        </Link>

        <div className="auth-section">
          {status === "loading" ? (
            <span className="loading-text">Cargando...</span>
          ) : session ? (
            <div className="user-profile">
              <span className="user-name">{session.user?.name || session.user?.email}</span>
              {session.user?.image && (
                <img src={session.user.image} alt="Perfil" className="nav-avatar" />
              )}
              <button onClick={() => signOut()} className="logout-btn">
                Salir
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link href="/login" className="login-btn">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="register-btn">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>

        <style jsx>{`
          .navbar {
            background: #2c2c2c;
            color: white;
            padding: 0.8rem 0;
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          }
        .nav-content {
          max-width: 100%;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
        }
        .auth-section {
          display: flex;
          align-items: center;
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-name {
          font-size: 0.9rem;
          font-weight: 500;
        }
        .nav-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #d4af37;
        }
        .login-btn {
          background: white;
          color: #333;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: bold;
          transition: background 0.2s;
        }
        .login-btn:hover {
          background: #f0f0f0;
        }
        .google-icon {
          width: 18px;
        }
        .logout-btn {
          background: transparent;
          border: 1px solid #666;
          color: #ccc;
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        .logout-btn:hover {
          color: white;
          border-color: white;
        }
        .auth-buttons {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        `}</style>
        <style jsx global>{`
          .logo,
          .logo:link,
          .logo:visited,
          .logo:hover,
          .logo:active {
            font-family: 'Georgia', serif !important;
            font-weight: bold !important;
            font-size: 1.4rem !important;
            color: #f8f7f3ff !important;
            text-decoration: none !important;
          }
          
          .auth-buttons .login-btn,
          .auth-buttons .login-btn:link,
          .auth-buttons .login-btn:visited {
            background: transparent !important;
            color: white !important;
            border: 1px solid #666 !important;
            padding: 6px 16px !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            font-weight: 500 !important;
            font-size: 0.9rem !important;
            transition: all 0.2s !important;
            text-decoration: none !important;
            display: inline-flex !important;
            align-items: center !important;
          }
          
          .auth-buttons .login-btn:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: white !important;
            color: white !important;
          }
          
          .auth-buttons .register-btn,
          .auth-buttons .register-btn:link,
          .auth-buttons .register-btn:visited {
            background: #d4af37 !important;
            color: #1a1a1b !important;
            border: 1px solid #d4af37 !important;
            padding: 6px 16px !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            font-weight: 600 !important;
            font-size: 0.9rem !important;
            transition: all 0.2s !important;
            text-decoration: none !important;
            display: inline-flex !important;
            align-items: center !important;
          }
          
          .auth-buttons .register-btn:hover {
            background: #c19b2f !important;
            border-color: #c19b2f !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3) !important;
          }
        `}</style>
    </nav>
  );
}