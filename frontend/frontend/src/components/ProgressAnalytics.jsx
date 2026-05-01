import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function ProgressAnalytics() {
    const [snapshots, setSnapshots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSnapshots();
    }, []);

    const loadSnapshots = async () => {
        try {
            const res = await api.get('/api/progress/history');
            console.log('Snapshots:', res.data);
            setSnapshots(res.data.snapshots || []);
        } catch (err) {
            console.error('Load snapshots error:', err);
            setError('Failed to load progress history.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p style={{ color: '#718096', textAlign: 'center' }}>⏳ Loading analytics...</p>;
    }

    if (snapshots.length === 0) {
        return (
            <div style={styles.empty}>
                <p style={styles.emptyText}>
                    📊 No progress history yet. 
                    <br />
                    Complete some topics and click "Analyze My Progress" to start tracking.
                </p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>📊 Your Progress Analytics</h2>

            {/* Timeline */}
            <div style={styles.timeline}>
                {snapshots.map((snap, index) => (
                    <div key={snap.snapshotId} style={styles.timelineItem}>
                        {/* Dot */}
                        <div style={{
                            ...styles.timelineDot,
                            backgroundColor: snap.overallCompletionPercentage >= 50
                                ? '#68d391'
                                : '#d97706'
                        }} />

                        {/* Card */}
                        <div style={styles.snapshotCard}>
                            <div style={styles.snapshotHeader}>
                                <span style={styles.snapshotDate}>
                                    📅 {formatDate(snap.snapshotDate)}
                                </span>
                                <span style={styles.overallPct}>
                                    {snap.overallCompletionPercentage}%
                                </span>
                            </div>

                            {/* Overall progress bar */}
                            <div style={styles.barBg}>
                                <div style={{
                                    ...styles.barFill,
                                    width: `${snap.overallCompletionPercentage}%`,
                                    backgroundColor: snap.overallCompletionPercentage >= 50
                                        ? '#68d391'
                                        : '#d97706'
                                }} />
                            </div>

                            <p style={styles.snapshotSub}>
                                {snap.totalTopicsCompleted} of {snap.totalTopics} topics completed
                            </p>

                            {/* Category breakdown */}
                            <div style={styles.categoryGrid}>
                                {Object.entries(snap.categoryProgress || {}).map(([cat, pct]) => (
                                    <div key={cat} style={styles.categoryItem}>
                                        <span style={styles.categoryLabel}>{cat}</span>
                                        <div style={styles.categoryBarBg}>
                                            <div style={{
                                                ...styles.categoryBarFill,
                                                width: `${pct}%`,
                                                backgroundColor: getCategoryColor(cat)
                                            }} />
                                        </div>
                                        <span style={styles.categoryPct}>{pct}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary Stats */}
            <div style={styles.summaryCard}>
                <h3 style={styles.summaryTitle}>📈 Summary</h3>
                <div style={styles.summaryGrid}>
                    <div style={styles.summaryItem}>
                        <span style={styles.summaryLabel}>Total Snapshots</span>
                        <span style={styles.summaryValue}>{snapshots.length}</span>
                    </div>
                    <div style={styles.summaryItem}>
                        <span style={styles.summaryLabel}>Latest Progress</span>
                        <span style={styles.summaryValue}>
                            {snapshots[snapshots.length - 1]?.overallCompletionPercentage}%
                        </span>
                    </div>
                    <div style={styles.summaryItem}>
                        <span style={styles.summaryLabel}>Topics Completed</span>
                        <span style={styles.summaryValue}>
                            {snapshots[snapshots.length - 1]?.totalTopicsCompleted}
                        </span>
                    </div>
                </div>
            </div>

            {error && <p style={styles.error}>{error}</p>}
        </div>
    );
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getCategoryColor(category) {
    const colors = {
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
    return colors[category] || '#4a5568';
}

const styles = {
    container:      { padding: '24px', backgroundColor: '#0f0f1a', minHeight: '80vh' },
    title:          { color: '#e2e8f0', fontSize: '24px', fontWeight: '700',
                      marginBottom: '24px' },
    empty:          { backgroundColor: '#1e1e2e', borderRadius: '12px',
                      padding: '40px', textAlign: 'center', marginBottom: '24px' },
    emptyText:      { color: '#718096', fontSize: '15px', lineHeight: '1.6' },

    // Timeline
    timeline:       { position: 'relative', paddingLeft: '40px', marginBottom: '32px' },
    timelineItem:   { display: 'flex', gap: '20px', marginBottom: '24px',
                      position: 'relative' },
    timelineDot:    { position: 'absolute', left: '-40px', top: '0',
                      width: '14px', height: '14px', borderRadius: '50%',
                      border: '3px solid #0f0f1a' },

    // Snapshot Card
    snapshotCard:   { backgroundColor: '#1e1e2e', borderRadius: '12px',
                      padding: '20px', flex: 1 },
    snapshotHeader: { display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: '12px' },
    snapshotDate:   { color: '#718096', fontSize: '13px' },
    overallPct:     { color: '#7c3aed', fontSize: '18px', fontWeight: '700' },
    barBg:          { backgroundColor: '#2d2d3f', borderRadius: '4px',
                      height: '6px', marginBottom: '8px' },
    barFill:        { height: '6px', borderRadius: '4px',
                      transition: 'width 0.3s ease' },
    snapshotSub:    { color: '#718096', fontSize: '13px', marginBottom: '12px' },

    // Category breakdown
    categoryGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '12px' },
    categoryItem:   { backgroundColor: '#0f0f1a', borderRadius: '8px',
                      padding: '10px' },
    categoryLabel:  { display: 'block', color: '#a0aec0', fontSize: '12px',
                      fontWeight: '600', marginBottom: '4px' },
    categoryBarBg:  { backgroundColor: '#2d2d3f', borderRadius: '3px',
                      height: '4px', marginBottom: '4px' },
    categoryBarFill:{ height: '4px', borderRadius: '3px' },
    categoryPct:    { display: 'block', color: '#718096', fontSize: '11px' },

    // Summary
    summaryCard:    { backgroundColor: '#1e1e2e', borderRadius: '12px',
                      padding: '24px' },
    summaryTitle:   { color: '#e2e8f0', fontSize: '16px', fontWeight: '600',
                      marginBottom: '16px' },
    summaryGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '16px' },
    summaryItem:    { backgroundColor: '#0f0f1a', borderRadius: '8px',
                      padding: '16px', textAlign: 'center' },
    summaryLabel:   { display: 'block', color: '#718096', fontSize: '12px',
                      marginBottom: '8px' },
    summaryValue:   { display: 'block', color: '#e2e8f0', fontSize: '24px',
                      fontWeight: '700' },

    error:          { color: '#fc8181', fontSize: '13px',
                      backgroundColor: '#2d1f1f', padding: '12px',
                      borderRadius: '8px', marginTop: '16px' },
};