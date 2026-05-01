import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div style={{ textAlign:'center', padding:'80px', color:'#718096' }}>
            <h1 style={{ fontSize:'48px' }}>404</h1>
            <p>Page not found</p>
            <Link to="/dashboard" style={{ color:'#7c3aed' }}>
                Go to Dashboard
            </Link>
        </div>
    );
}