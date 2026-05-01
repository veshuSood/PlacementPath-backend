import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
    const [form, setForm] = useState({
        username: '', email: '', password: '',
        targetRole: '', currentLevel: 'Beginner'
    });
    const [error,   setError]   = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/api/auth/register', form);
            setSuccess('Registered! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.title}>Create Account 🚀</h2>
                <p style={styles.sub}>Start your placement journey today</p>

                {error   && <div style={styles.error}>{error}</div>}
                {success && <div style={styles.success}>{success}</div>}

                <form onSubmit={handleSubmit}>
                    {['username','email','password'].map(field => (
                        <input
                            key={field}
                            style={styles.input}
                            type={field === 'password' ? 'password' : 
                                  field === 'email' ? 'email' : 'text'}
                            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                            value={form[field]}
                            onChange={e => setForm({...form, [field]: e.target.value})}
                            required
                        />
                    ))}
                    <input
                        style={styles.input}
                        placeholder="Target Role (e.g. Java Backend at TCS)"
                        value={form.targetRole}
                        onChange={e => setForm({...form, targetRole: e.target.value})}
                    />
                    <select
                        style={styles.input}
                        value={form.currentLevel}
                        onChange={e => setForm({...form, currentLevel: e.target.value})}>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                    </select>
                    <button style={styles.btn} type="submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Already have an account?{' '}
                    <Link to="/login" style={styles.link}>Login</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    page:    { display:'flex', justifyContent:'center', alignItems:'center',
                minHeight:'90vh', backgroundColor:'#0f0f1a' },
    card:    { backgroundColor:'#1e1e2e', padding:'40px', borderRadius:'12px',
                width:'100%', maxWidth:'420px', boxShadow:'0 4px 24px rgba(0,0,0,0.4)' },
    title:   { color:'#e2e8f0', marginBottom:'4px', textAlign:'center' },
    sub:     { color:'#718096', fontSize:'14px', textAlign:'center', marginBottom:'24px' },
    input:   { width:'100%', padding:'12px', marginBottom:'16px', borderRadius:'8px',
                border:'1px solid #2d2d3f', backgroundColor:'#0f0f1a', color:'white',
                fontSize:'14px', boxSizing:'border-box' },
    btn:     { width:'100%', padding:'12px', backgroundColor:'#7c3aed', color:'white',
                border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer' },
    error:   { backgroundColor:'#2d1f1f', color:'#fc8181', padding:'12px',
                borderRadius:'8px', marginBottom:'16px', fontSize:'14px' },
    success: { backgroundColor:'#1a2d1f', color:'#68d391', padding:'12px',
                borderRadius:'8px', marginBottom:'16px', fontSize:'14px' },
    footer:  { color:'#718096', textAlign:'center', marginTop:'20px', fontSize:'14px' },
    link:    { color:'#7c3aed' },
};