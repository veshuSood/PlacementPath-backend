import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
    const [form, setForm]       = useState({ username: '', password: '' });
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);
    const { login }             = useAuth();
    const navigate              = useNavigate();

   const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
        const res = await api.post('/api/auth/login', form);
        
        // ← VERIFY THIS LINE — must pass both token AND username
        login(res.data.token, res.data.username);
        
        navigate('/dashboard');
    } catch (err) {
        setError(err.response?.data || 'Login failed. Check credentials.');
    } finally {
        setLoading(false);
    }
};

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.title}>Welcome Back 👋</h2>
                <p style={styles.sub}>Login to your PlacementPath account</p>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <input
                        style={styles.input}
                        placeholder="Username"
                        value={form.username}
                        onChange={e => setForm({...form, username: e.target.value})}
                        required
                    />
                    <input
                        style={styles.input}
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={e => setForm({...form, password: e.target.value})}
                        required
                    />
                    <button 
                        style={styles.btn} 
                        type="submit" 
                        disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={styles.footer}>
                    No account?{' '}
                    <Link to="/register" style={styles.link}>Register here</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    page:  { display:'flex', justifyContent:'center', alignItems:'center',
              minHeight:'90vh', backgroundColor:'#0f0f1a' },
    card:  { backgroundColor:'#1e1e2e', padding:'40px', borderRadius:'12px',
              width:'100%', maxWidth:'400px', boxShadow:'0 4px 24px rgba(0,0,0,0.4)' },
    title: { color:'#e2e8f0', marginBottom:'4px', textAlign:'center' },
    sub:   { color:'#718096', fontSize:'14px', textAlign:'center', marginBottom:'24px' },
    input: { width:'100%', padding:'12px', marginBottom:'16px', borderRadius:'8px',
              border:'1px solid #2d2d3f', backgroundColor:'#0f0f1a', color:'white',
              fontSize:'14px', boxSizing:'border-box' },
    btn:   { width:'100%', padding:'12px', backgroundColor:'#7c3aed', color:'white',
              border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer',
              opacity: 1 },
    error: { backgroundColor:'#2d1f1f', color:'#fc8181', padding:'12px',
              borderRadius:'8px', marginBottom:'16px', fontSize:'14px' },
    footer:{ color:'#718096', textAlign:'center', marginTop:'20px', fontSize:'14px' },
    link:  { color:'#7c3aed' },
};