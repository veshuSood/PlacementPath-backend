import TopicItem from './TopicItem';

export default function WeekCard({ week, onToggle }) {

    const topics    = week.topics;
    const total     = topics.length;
    const completed = topics.filter(t => t.completed).length;
    const percent   = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div style={styles.card}>

            {/* Week Header */}
            <div style={styles.header}>
                <div>
                    <span style={styles.weekLabel}>Week {week.weekNumber}</span>
                    <span style={styles.theme}>{week.theme}</span>
                </div>
                <div style={styles.progress}>{completed}/{total} done</div>
            </div>

            {/* Progress Bar */}
            <div style={styles.barBg}>
                <div style={{
                    ...styles.barFill,
                    width: `${percent}%`,
                    backgroundColor: percent === 100 ? '#68d391' : '#7c3aed',
                }} />
            </div>

            {/* Topics */}
            <div style={styles.topics}>
                {topics.map((topic, index) => (
                    <TopicItem
                        key={topic.id || index}
                        topic={topic}
                        onToggle={onToggle}
                    />
                ))}
            </div>
        </div>
    );
}

const styles = {
    card:      { backgroundColor: '#1e1e2e', borderRadius: '12px',
                 padding: '24px', marginBottom: '24px',
                 boxShadow: '0 2px 12px rgba(0,0,0,0.3)' },
    header:    { display: 'flex', justifyContent: 'space-between',
                 alignItems: 'center', marginBottom: '12px' },
    weekLabel: { backgroundColor: '#7c3aed', color: 'white',
                 fontSize: '12px', fontWeight: '700',
                 padding: '3px 10px', borderRadius: '12px',
                 marginRight: '12px' },
    theme:     { color: '#e2e8f0', fontWeight: '600', fontSize: '17px' },
    progress:  { color: '#718096', fontSize: '13px' },
    barBg:     { backgroundColor: '#2d2d3f', borderRadius: '4px',
                 height: '6px', marginBottom: '20px' },
    barFill:   { height: '6px', borderRadius: '4px',
                 transition: 'width 0.3s ease' },
    topics:    { display: 'flex', flexDirection: 'column' },
};