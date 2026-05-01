import api from '../api/axios';

export default function TopicItem({ topic, onToggle }) {
    if (!topic) return null;

    const categoryColors = {
        'DSA': '#7c3aed',
        'Core CS': '#2563eb',
        'Full Stack': '#059669',
        'Aptitude': '#d97706',
        'HR': '#dc2626',
    };

    const color = categoryColors[topic.category] || '#4a5568';
    const resources = topic.resources || [];

    const getIcon = (type) => {
        if (type === 'video') return '▶ ';
        if (type === 'article') return '📄 ';
        if (type === 'practice') return '💻 ';
        return '🔗 ';
    };

    const isValidUrl = (url) => {
        try {
            new URL(url);
            return url.startsWith('http');
        } catch {
            return false;
        }
    };

    // Track resource usage (async, non-blocking)
    const trackResourceUsage = (resourceType, resourceTitle, resourceUrl) => {
        // Fire and forget — don't wait for response
        api.post('/api/resources/track', {
            resourceType: resourceType,
            resourceTitle: resourceTitle,
            resourceUrl: resourceUrl
        }).catch(err => console.error('Track error:', err));
    };

    // Handle resource click
    const handleResourceClick = (resourceType, resourceTitle, resourceUrl) => {
        // Track usage in background
        trackResourceUsage(resourceType, resourceTitle, resourceUrl);
        
        // Open in new tab immediately (doesn't interrupt current session)
        window.open(resourceUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div style={{
            ...styles.item,
            borderLeft: `4px solid ${color}`,
            opacity: topic.completed ? 0.65 : 1,
        }}>
            <div style={styles.top}>
                <input
                    type="checkbox"
                    checked={topic.completed || false}
                    onChange={() => onToggle && onToggle(topic.id)}
                    style={styles.checkbox}
                />

                <div style={{ flex: 1 }}>
                    {/* Topic Title */}
                    <div style={styles.topicTitle}>
                        {topic.completed ? <s>{topic.title}</s> : topic.title}
                    </div>

                    {/* Description */}
                    {topic.description && (
                        <div style={styles.description}>{topic.description}</div>
                    )}

                    {/* Category Badge + Hours */}
                    <div style={styles.meta}>
                        {topic.category && (
                            <span style={{ ...styles.badge, backgroundColor: color }}>
                                {topic.category}
                            </span>
                        )}
                        {topic.estimatedHours && (
                            <span style={styles.hours}>
                                ⏱ {topic.estimatedHours}h
                            </span>
                        )}
                    </div>

                    {/* Resources */}
                    {resources.length > 0 && (
                        <div style={styles.resourceBox}>
                            <p style={styles.resourceTitle}>📚 Resources:</p>
                            {resources.map((r, i) => {
                                const valid = r.url && isValidUrl(r.url);
                                return valid ? (
                                    <button
                                        key={i}
                                        onClick={() => handleResourceClick(r.type, r.title, r.url)}
                                        style={styles.resourceLink}
                                        title={`Opens ${r.type}: ${r.title}`}
                                    >
                                        {getIcon(r.type)}
                                        {r.title || 'Resource'}
                                        <span style={styles.externalIcon}>↗</span>
                                    </button>
                                ) : (
                                    <span key={i} style={styles.invalidResource}>
                                        {getIcon(r.type)}
                                        {r.title || 'Invalid resource'}
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    item: {
        backgroundColor: '#0f0f1a',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        transition: 'opacity 0.2s ease',
    },
    top: { 
        display: 'flex', 
        gap: '12px', 
        alignItems: 'flex-start' 
    },
    checkbox: {
        width: '18px',
        height: '18px',
        marginTop: '3px',
        cursor: 'pointer',
        accentColor: '#7c3aed',
        flexShrink: 0,
    },
    topicTitle: {
        color: '#e2e8f0',
        fontWeight: '600',
        fontSize: '15px',
        marginBottom: '6px',
        lineHeight: '1.4',
    },
    description: {
        color: '#718096',
        fontSize: '13px',
        marginBottom: '10px',
        lineHeight: '1.5',
    },
    meta: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '12px',
    },
    badge: {
        color: 'white',
        fontSize: '11px',
        padding: '3px 10px',
        borderRadius: '12px',
        fontWeight: '700',
    },
    hours: { 
        color: '#718096', 
        fontSize: '12px' 
    },
    resourceBox: {
        backgroundColor: '#1a1a2e',
        borderRadius: '6px',
        padding: '10px 12px',
        marginTop: '8px',
    },
    resourceTitle: {
        color: '#718096',
        fontSize: '11px',
        fontWeight: '600',
        marginBottom: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    resourceLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        color: '#7c6aed',
        fontSize: '13px',
        textDecoration: 'none',
        padding: '6px 0',
        borderBottom: '1px solid #2d2d3f',
        transition: 'all 0.2s',
        cursor: 'pointer',
        backgroundColor: 'transparent',
        border: 'none',
        fontFamily: 'inherit',
    },
    externalIcon: {
        marginLeft: 'auto',
        fontSize: '11px',
        color: '#4a5568',
    },
    invalidResource: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        color: '#4a5568',
        fontSize: '13px',
        padding: '6px 0',
        fontStyle: 'italic',
    },
};