import { signIn, signOut, useSession } from "next-auth/react";
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
              <span className="user-name">{session.user?.name}</span>
              {session.user?.image && (
                <img src={session.user.image} alt="Perfil" className="nav-avatar" />
              )}
              <button onClick={() => signOut()} className="logout-btn">
                Salir
              </button>
            </div>
          ) : (
            <button onClick={() => signIn("google")} className="login-btn">
              <img src="https://www.svgrepo.com/show/355037/google.svg" alt="" className="google-icon" />
              Entrar con Google
            </button>
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
      `}</style>
    </nav>
  );
}