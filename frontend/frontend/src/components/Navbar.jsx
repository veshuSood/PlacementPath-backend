import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { token, username, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={styles.nav}>
            <Link to="/dashboard" style={styles.brand}>
                🎯 PlacementPath AI
            </Link>
            <div style={styles.right}>
                {token ? (
                    <>
                        <span style={styles.username}>👤 {username}</span>
                        <button onClick={handleLogout} style={styles.btn}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login"    style={styles.link}>Login</Link>
                        <Link to="/register" style={styles.link}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 32px',
        backgroundColor: '#1e1e2e',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    },
    brand: {
        color: '#7c3aed',
        textDecoration: 'none',
        fontSize: '20px',
        fontWeight: 'bold',
    },
    right: { display: 'flex', alignItems: 'center', gap: '16px' },
    username: { color: '#a0aec0', fontSize: '14px' },
    link: { color: '#e2e8f0', textDecoration: 'none', fontSize: '14px' },
    btn: {
        backgroundColor: '#7c3aed',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
    },
};