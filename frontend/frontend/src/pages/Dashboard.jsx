import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import WeekCard from '../components/WeekCard';
import WeakAreaBadge from '../components/WeakAreaBadge';
import ProgressAnalytics from '../components/ProgressAnalytics';
import InterviewMode from '../components/InterviewMode';
import api from '../api/axios';

export default function Dashboard() {
    const { username } = useAuth();

    // ============ ALL STATE DECLARATIONS FIRST ============
    const [form, setForm] = useState({
        targetCompany:  '',
        targetRole:     '',
        currentLevel:   'Intermediate',
        weeksAvailable: 6,
    });
    const [roadmap,        setRoadmap]        = useState(null);
    const [weeks,          setWeeks]          = useState([]);
    const [loading,        setLoading]        = useState(false);
    const [fetching,       setFetching]       = useState(true);
    const [error,          setError]          = useState('');
    const [weakCategories, setWeakCategories] = useState([]);
    const [categoryStats,  setCategoryStats]  = useState({});
    const [analyzing,      setAnalyzing]      = useState(false);
    const [adjusting,      setAdjusting]      = useState(false);
    const [analysisMsg,    setAnalysisMsg]    = useState('');
    const [showAnalytics,  setShowAnalytics]  = useState(false);
    const [showInterview,  setShowInterview]  = useState(false);

    // ============ ALL HELPER FUNCTIONS SECOND ============
    
    // initWeeks FIRST (no dependencies)
    const initWeeks = (weeksData) => {
        if (!weeksData || !Array.isArray(weeksData)) return [];
        return weeksData.map((week, wi) => ({
            ...week,
            topics: Array.isArray(week.topics)
                ? week.topics.map((topic, ti) => {
                    if (typeof topic === 'string') {
                        return {
                            id:             `w${wi + 1}_t${ti + 1}`,
                            title:          topic,
                            category:       'General',
                            description:    '',
                            estimatedHours: 2,
                            resources:      [],
                            completed:      false,
                        };
                    }
                    return {
                        ...topic,
                        id:        topic.id || `w${wi + 1}_t${ti + 1}`,
                        completed: topic.completed || false,
                        resources: topic.resources || [],
                    };
                })
                : [],
        }));
    };

    // loadActiveRoadmap SECOND (depends on initWeeks)
    const loadActiveRoadmap = async () => {
        try {
            const res = await api.get('/api/roadmap/active');
            if (!res.data || !res.data.roadmap) {
                console.log('No roadmap yet');
                setFetching(false);
                return;
            }

            const parsed = typeof res.data.roadmap === 'string'
                ? JSON.parse(res.data.roadmap)
                : res.data.roadmap;

            if (parsed && parsed.weeks && Array.isArray(parsed.weeks)) {
                setRoadmap(parsed);
                setWeeks(initWeeks(parsed.weeks));
            }
            setFetching(false);
        } catch (err) {
            console.log('Load error:', err.message);
            setFetching(false);
        }
    };

    // buildProgressData THIRD (depends on weeks state)
    const buildProgressData = () => {
        const completedTopicIds    = [];
        const completedPerCategory = {};
        const totalPerCategory     = {};

        weeks.forEach(week => {
            week.topics.forEach(topic => {
                const cat = topic.category || 'DSA';
                totalPerCategory[cat]     = (totalPerCategory[cat]     || 0) + 1;
                completedPerCategory[cat] = (completedPerCategory[cat] || 0);
                if (topic.completed) {
                    completedTopicIds.push(topic.id);
                    completedPerCategory[cat] += 1;
                }
            });
        });

        return { completedTopicIds, completedPerCategory, totalPerCategory };
    };

    // handleGenerate
    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setWeakCategories([]);
        setCategoryStats({});
        setAnalysisMsg('');

        try {
            const res = await api.post('/api/roadmap/generate', form);
            const parsed = typeof res.data.roadmap === 'string'
                ? JSON.parse(res.data.roadmap)
                : res.data.roadmap;

            if (parsed && parsed.weeks && Array.isArray(parsed.weeks)) {
                setRoadmap(parsed);
                setWeeks(initWeeks(parsed.weeks));
                setShowAnalytics(false);
                setShowInterview(false);
            } else {
                setError('Unexpected response format. Try again.');
            }
        } catch (err) {
            console.error('Generate error:', err);
            setError(err.response?.data?.error || 'Failed to generate roadmap.');
        } finally {
            setLoading(false);
        }
    };

    // handleToggle
    const handleToggle = (topicId) => {
        setWeeks(prev => prev.map(week => ({
            ...week,
            topics: week.topics.map(topic =>
                topic.id === topicId
                    ? { ...topic, completed: !topic.completed }
                    : topic
            )
        })));
    };

    // handleAnalyze
    const handleAnalyze = async () => {
        setAnalyzing(true);
        setAnalysisMsg('');

        try {
            const progressData = buildProgressData();
            const res = await api.post('/api/progress/analyze', progressData);

            setWeakCategories(res.data.weakCategories || []);
            setCategoryStats(res.data.categoryStats   || {});
            setAnalysisMsg(res.data.message);
        } catch (err) {
            console.error('Analyze error:', err);
            setAnalysisMsg('Analysis failed. Try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    // handleAdjust
    const handleAdjust = async () => {
        setAdjusting(true);
        setAnalysisMsg('');

        try {
            const progressData = buildProgressData();
            const res = await api.post('/api/progress/adjust', progressData);

            const parsed = typeof res.data.roadmap === 'string'
                ? JSON.parse(res.data.roadmap)
                : res.data.roadmap;

            if (parsed && parsed.weeks && Array.isArray(parsed.weeks)) {
                setRoadmap(parsed);
                setWeeks(initWeeks(parsed.weeks));
                setWeakCategories([]);
                setCategoryStats({});
                setAnalysisMsg('✅ Roadmap adjusted based on your weak areas!');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            console.error('Adjust error:', err);
            setAnalysisMsg('Adjustment failed. Try again.');
        } finally {
            setAdjusting(false);
        }
    };

    // ============ useEffect THIRD ============
    useEffect(() => {
        loadActiveRoadmap();
    }, []);

    // ============ EARLY RETURN FOURTH ============
    if (fetching) {
        return (
            <div style={styles.center}>
                <p style={styles.loadingText}>⏳ Loading your roadmap...</p>
            </div>
        );
    }

    // ============ CALCULATED VALUES FIFTH ============
    const allTopics   = weeks.flatMap(w => w.topics);
    const totalDone   = allTopics.filter(t => t.completed).length;
    const totalTopics = allTopics.length;
    const overallPct  = totalTopics > 0 ? Math.round((totalDone / totalTopics) * 100) : 0;

    // ============ RETURN STATEMENT LAST ============
    return (
        <div style={styles.page}>

            {/* Header with Tab Toggle */}
            <div style={styles.headerWithTabs}>
                <div style={styles.header}>
                    <h1 style={styles.title}>
                        {roadmap
                            ? `📍 Role: ${roadmap.targetRole} | Company: ${roadmap.targetCompany}`
                            : '🎯 Generate Your Roadmap'}
                    </h1>
                    <p style={styles.subtitle}>
                        Welcome back, <strong style={{ color: '#7c3aed' }}>{username}</strong>
                    </p>
                </div>

                {/* Tabs */}
                {roadmap && (
                    <div style={styles.tabs}>
                        <button
                            style={{
                                ...styles.tabBtn,
                                backgroundColor: !showAnalytics && !showInterview ? '#7c3aed' : '#2d2d3f',
                                color: !showAnalytics && !showInterview ? 'white' : '#a0aec0'
                            }}
                            onClick={() => { 
                                setShowAnalytics(false); 
                                setShowInterview(false); 
                            }}>
                            🎯 Roadmap
                        </button>
                        <button
                            style={{
                                ...styles.tabBtn,
                                backgroundColor: showAnalytics ? '#7c3aed' : '#2d2d3f',
                                color: showAnalytics ? 'white' : '#a0aec0'
                            }}
                            onClick={() => { 
                                setShowAnalytics(true); 
                                setShowInterview(false); 
                            }}>
                            📊 Analytics
                        </button>
                        <button
                            style={{
                                ...styles.tabBtn,
                                backgroundColor: showInterview ? '#7c3aed' : '#2d2d3f',
                                color: showInterview ? 'white' : '#a0aec0'
                            }}
                            onClick={() => { 
                                setShowAnalytics(false); 
                                setShowInterview(true); 
                            }}>
                            🎤 Interview
                        </button>
                    </div>
                )}
            </div>

            {/* Show Analytics, Interview, or Roadmap */}
            {showAnalytics ? (
                <ProgressAnalytics />
            ) : showInterview ? (
                <InterviewMode />
            ) : (
                <>
                    {/* Generation Form */}
                    <div style={styles.formCard}>
                        <h3 style={styles.formTitle}>
                            {roadmap ? '🔄 Generate New Roadmap' : '✨ Create Your Roadmap'}
                        </h3>
                        <form onSubmit={handleGenerate} style={styles.form}>
                            <input
                                style={styles.input}
                                placeholder="Target Company (e.g. TCS, Infosys, Google)"
                                value={form.targetCompany}
                                onChange={e => setForm({ ...form, targetCompany: e.target.value })}
                                required
                            />
                            <input
                                style={styles.input}
                                placeholder="Target Role (e.g. Java Backend Developer)"
                                value={form.targetRole}
                                onChange={e => setForm({ ...form, targetRole: e.target.value })}
                                required
                            />
                            <div style={styles.row}>
                                <select
                                    style={styles.select}
                                    value={form.currentLevel}
                                    onChange={e => setForm({ ...form, currentLevel: e.target.value })}>
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                                <select
                                    style={styles.select}
                                    value={form.weeksAvailable}
                                    onChange={e => setForm({
                                        ...form,
                                        weeksAvailable: parseInt(e.target.value)
                                    })}>
                                    {[4, 6, 8, 10, 12].map(w => (
                                        <option key={w} value={w}>{w} Weeks</option>
                                    ))}
                                </select>
                            </div>

                            {error && <div style={styles.error}>{error}</div>}

                            <button
                                style={{
                                    ...styles.btn,
                                    opacity: loading ? 0.6 : 1
                                }}
                                type="submit"
                                disabled={loading}>
                                {loading ? '🤖 AI is building your roadmap...' : '🚀 Generate Roadmap'}
                            </button>
                        </form>
                    </div>

                    {/* Overall Progress */}
                    {roadmap && (
                        <div style={styles.progressCard}>
                            <div style={styles.progressHeader}>
                                <span style={styles.progressLabel}>Overall Progress</span>
                                <span style={styles.progressPct}>{overallPct}%</span>
                            </div>
                            <div style={styles.barBg}>
                                <div style={{
                                    ...styles.barFill,
                                    width: `${overallPct}%`,
                                    backgroundColor: overallPct === 100 ? '#68d391' : '#7c3aed',
                                }} />
                            </div>
                            <p style={styles.progressSub}>
                                {totalDone} of {totalTopics} topics completed
                                {overallPct === 100 && " 🎉 You're placement ready!"}
                            </p>
                            {roadmap.summary && (
                                <p style={styles.summary}>{roadmap.summary}</p>
                            )}
                        </div>
                    )}

                    {/* AI Analysis Section */}
                    {roadmap && (
                        <div style={styles.actionCard}>
                            <h3 style={styles.actionTitle}>🤖 AI Progress Analysis</h3>
                            <p style={styles.actionSub}>
                                Check off completed topics then click Analyze.
                            </p>

                            <div style={styles.actionButtons}>
                                <button
                                    style={{
                                        ...styles.analyzeBtn,
                                        opacity: (analyzing || totalDone === 0) ? 0.5 : 1,
                                        cursor: (analyzing || totalDone === 0) ? 'not-allowed' : 'pointer'
                                    }}
                                    onClick={handleAnalyze}
                                    disabled={analyzing || totalDone === 0}>
                                    {analyzing ? '🔍 Analyzing...' : '🔍 Analyze My Progress'}
                                </button>

                                {weakCategories.length > 0 && (
                                    <button
                                        style={{
                                            ...styles.adjustBtn,
                                            opacity: adjusting ? 0.5 : 1,
                                            cursor: adjusting ? 'not-allowed' : 'pointer'
                                        }}
                                        onClick={handleAdjust}
                                        disabled={adjusting}>
                                        {adjusting ? '🤖 Adjusting...' : '⚡ Adjust Roadmap'}
                                    </button>
                                )}
                            </div>

                            {analysisMsg && (
                                <p style={{
                                    ...styles.analysisMsg,
                                    color: analysisMsg.startsWith('✅') ? '#68d391' : '#a0aec0'
                                }}>
                                    {analysisMsg}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Weak Area Badge */}
                    {weakCategories.length > 0 && (
                        <WeakAreaBadge
                            weakCategories={weakCategories}
                            categoryStats={categoryStats}
                        />
                    )}

                    {/* Week Cards */}
                    {weeks
                        .filter(w => w && Array.isArray(w.topics))
                        .map(week => (
                            <WeekCard
                                key={week.weekNumber}
                                week={week}
                                onToggle={handleToggle}
                            />
                        ))
                    }
                </>
            )}
        </div>
    );
}

const styles = {
    page:           { maxWidth: '860px', margin: '0 auto', padding: '32px 16px',
                      backgroundColor: '#0f0f1a', minHeight: '100vh' },
    center:         { display: 'flex', justifyContent: 'center', alignItems: 'center',
                      minHeight: '80vh', backgroundColor: '#0f0f1a' },
    loadingText:    { color: '#718096', fontSize: '16px' },
    headerWithTabs: { marginBottom: '24px' },
    header:         { marginBottom: '16px' },
    title:          { color: '#e2e8f0', fontSize: '24px', fontWeight: '700',
                      marginBottom: '4px' },
    subtitle:       { color: '#718096', fontSize: '14px' },
    tabs:           { display: 'flex', gap: '12px' },
    tabBtn:         { padding: '10px 20px', border: 'none', borderRadius: '8px',
                      cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
    formCard:       { backgroundColor: '#1e1e2e', borderRadius: '12px',
                      padding: '24px', marginBottom: '24px' },
    formTitle:      { color: '#e2e8f0', marginBottom: '16px', fontSize: '16px',
                      fontWeight: '600' },
    form:           { display: 'flex', flexDirection: 'column', gap: '12px' },
    input:          { padding: '12px', borderRadius: '8px',
                      border: '1px solid #2d2d3f', backgroundColor: '#0f0f1a',
                      color: 'white', fontSize: '14px' },
    row:            { display: 'flex', gap: '12px' },
    select:         { flex: 1, padding: '12px', borderRadius: '8px',
                      border: '1px solid #2d2d3f', backgroundColor: '#0f0f1a',
                      color: 'white', fontSize: '14px' },
    btn:            { padding: '14px', backgroundColor: '#7c3aed', color: 'white',
                      border: 'none', borderRadius: '8px', fontSize: '15px',
                      cursor: 'pointer', fontWeight: '600' },
    error:          { color: '#fc8181', fontSize: '13px',
                      backgroundColor: '#2d1f1f', padding: '10px', borderRadius: '6px' },
    progressCard:   { backgroundColor: '#1e1e2e', borderRadius: '12px',
                      padding: '24px', marginBottom: '24px' },
    progressHeader: { display: 'flex', justifyContent: 'space-between',
                      marginBottom: '8px' },
    progressLabel:  { color: '#e2e8f0', fontWeight: '600' },
    progressPct:    { color: '#7c3aed', fontWeight: '700', fontSize: '18px' },
    barBg:          { backgroundColor: '#2d2d3f', borderRadius: '4px',
                      height: '8px', marginBottom: '12px' },
    barFill:        { height: '8px', borderRadius: '4px', transition: 'width 0.4s ease' },
    progressSub:    { color: '#718096', fontSize: '13px', marginBottom: '8px' },
    summary:        { color: '#a0aec0', fontSize: '13px', fontStyle: 'italic',
                      borderTop: '1px solid #2d2d3f', paddingTop: '12px',
                      marginTop: '8px' },
    actionCard:     { backgroundColor: '#1e1e2e', borderRadius: '12px',
                      padding: '24px', marginBottom: '24px' },
    actionTitle:    { color: '#e2e8f0', marginBottom: '8px', fontSize: '16px',
                      fontWeight: '600' },
    actionSub:      { color: '#718096', fontSize: '13px', marginBottom: '16px' },
    actionButtons:  { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    analyzeBtn:     { padding: '12px 20px', backgroundColor: '#2d2d3f',
                      color: '#e2e8f0', border: '1px solid #4a5568',
                      borderRadius: '8px', fontSize: '14px', fontWeight: '600' },
    adjustBtn:      { padding: '12px 20px', backgroundColor: '#7c3aed',
                      color: 'white', border: 'none', borderRadius: '8px',
                      fontSize: '14px', fontWeight: '600' },
    analysisMsg:    { marginTop: '12px', fontSize: '13px', fontStyle: 'italic' },
};