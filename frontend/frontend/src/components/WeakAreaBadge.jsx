export default function WeakAreaBadge({ weakCategories, categoryStats }) {

    if (!weakCategories || weakCategories.length === 0) return null;

    const categoryColors = {
        'DSA':                  '#7c3aed',
        'DSA & Coding':         '#7c3aed',
        'Core CS':              '#2563eb',
        'Core CS Subjects':     '#2563eb',
        'Full Stack':           '#059669',
        'Full Stack Development':'#059669',
        'Aptitude':             '#d97706',
        'Aptitude & HR Prep':   '#d97706',
        'HR':                   '#dc2626',
    };

    const getColor = (cat) => categoryColors[cat] || '#4a5568';

    return (
        <div style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <span style={styles.icon}>⚠️</span>
                <span style={styles.title}>
                    AI detected weak areas in your preparation
                </span>
            </div>

            {/* Weak category badges */}
            <div style={styles.badges}>
                {weakCategories.map(cat => (
                    <span key={cat} style={{
                        ...styles.badge,
                        backgroundColor: getColor(cat)
                    }}>
                        {cat} — needs focus
                    </span>
                ))}
            </div>

            {/* Stats grid */}
            <div style={styles.statsGrid}>
                {Object.entries(categoryStats || {}).map(([cat, stat]) => {
                    const isWeak = weakCategories.includes(cat);
                    return (
                        <div key={cat} style={{
                            ...styles.statItem,
                            borderLeft: `3px solid ${
                                isWeak ? getColor(cat) : '#2d5a27'
                            }`
                        }}>
                            <span style={{
                                ...styles.statCat,
                                color: isWeak ? '#fc8181' : '#68d391'
                            }}>
                                {isWeak ? '❌' : '✅'} {cat}
                            </span>
                            <span style={styles.statValue}>{stat}</span>
                        </div>
                    );
                })}
            </div>

            <p style={styles.hint}>
                Click{' '}
                <strong style={{ color: '#e2e8f0' }}>
                    "Adjust Roadmap"
                </strong>{' '}
                below to get a new AI-generated plan focused on your weak areas.
            </p>
        </div>
    );
}

const styles = {
    container: { backgroundColor: '#1a1025', border: '1px solid #7c3aed',
                  borderRadius: '12px', padding: '20px', marginBottom: '24px' },
    header:    { display: 'flex', alignItems: 'center', gap: '10px',
                  marginBottom: '14px' },
    icon:      { fontSize: '20px' },
    title:     { color: '#e2e8f0', fontWeight: '600', fontSize: '15px' },
    badges:    { display: 'flex', gap: '8px', flexWrap: 'wrap',
                  marginBottom: '16px' },
    badge:     { color: 'white', fontSize: '12px', padding: '4px 12px',
                  borderRadius: '20px', fontWeight: '600' },
    statsGrid: { display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '8px', marginBottom: '14px' },
    statItem:  { backgroundColor: '#0f0f1a', padding: '8px 12px',
                  borderRadius: '6px', display: 'flex',
                  flexDirection: 'column', gap: '4px' },
    statCat:   { fontSize: '12px', fontWeight: '700' },
    statValue: { fontSize: '12px', color: '#718096' },
    hint:      { color: '#718096', fontSize: '13px', fontStyle: 'italic' },
};