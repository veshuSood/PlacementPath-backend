import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function InterviewMode() {
    const [mode, setMode] = useState('practice'); // 'practice' or 'create'
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('DSA');
    const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showQuestions, setShowQuestions] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [testComplete, setTestComplete] = useState(false);

    // AI Evaluation State
    const [evaluation, setEvaluation] = useState({}); // { questionIndex: {score, feedback} }
    const [evaluating, setEvaluating] = useState(false);

    // Create mode form state
    const [formData, setFormData] = useState({
        category: 'DSA',
        topic: '',
        question: '',
        difficulty: 'Medium',
        questionType: 'Theory',
        answer: '',
        isPublic: true
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [createMessage, setCreateMessage] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await api.get('/api/interview/categories');
            setCategories(res.data.defaultCategories || ['DSA', 'Core CS', 'Full Stack', 'Aptitude', 'HR']);
        } catch (err) {
            console.error('Load categories error:', err);
        }
    };

    // PRACTICE MODE LOGIC
    const handleStartTest = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/interview/questions', {
                params: { category: selectedCategory, limit: 5 }
            });
            setQuestions(res.data.questions || []);
            setAnswers({});
            setEvaluation({}); // Reset evaluations
            setCurrentIndex(0);
            setTestComplete(false);
            setShowQuestions(true);
        } catch (err) {
            console.error('Load questions error:', err);
            alert('Failed to load questions. Check if backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (val) => {
        setAnswers({ ...answers, [currentIndex]: val });
    };

    // AI EVALUATION LOGIC
    const handleEvaluate = async () => {
        const currentQuestion = questions[currentIndex];
        const studentAns = answers[currentIndex];

        if (!studentAns || studentAns.length < 5) {
            alert("Please provide a more detailed answer for evaluation.");
            return;
        }

        setEvaluating(true);
        try {
            const res = await api.post('/api/interview/evaluate', {
                question: currentQuestion.question,
                studentAnswer: studentAns,
                referenceAnswer: currentQuestion.answer || "General technical knowledge"
            });
            setEvaluation({ ...evaluation, [currentIndex]: res.data });
        } catch (err) {
            console.error("Evaluation failed", err);
            alert("AI evaluation failed. Please try again.");
        } finally {
            setEvaluating(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setTestComplete(true);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleRestart = () => {
        setShowQuestions(false);
        setTestComplete(false);
        setEvaluation({});
    };

    // CREATE MODE LOGIC
    const handleCreateQuestion = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            await api.post('/api/interview/questions', formData);
            setCreateMessage('✅ Question added successfully!');
            setFormData({ ...formData, question: '', answer: '', topic: '' });
            setTimeout(() => setCreateMessage(''), 3000);
        } catch (err) {
            setCreateMessage('❌ Failed to add question');
        } finally {
            setCreateLoading(false);
        }
    };

    // --- RENDER LOGIC ---

    if (testComplete) {
        const answered = Object.keys(answers).length;
        const avgScore = Object.values(evaluation).reduce((acc, curr) => acc + curr.score, 0) / (Object.keys(evaluation).length || 1);

        return (
            <div style={styles.container}>
                <div style={styles.resultCard}>
                    <h2 style={styles.resultTitle}>🎯 Test Results</h2>
                    <div style={styles.resultStats}>
                        <div style={styles.statBox}>
                            <span style={styles.statLabel}>Answered</span>
                            <span style={styles.statValue}>{answered}/{questions.length}</span>
                        </div>
                        <div style={styles.statBox}>
                            <span style={styles.statLabel}>Avg AI Score</span>
                            <span style={{...styles.statValue, color: '#7c3aed'}}>{Math.round(avgScore)}%</span>
                        </div>
                    </div>
                    <button style={styles.retryBtn} onClick={handleRestart}>Try Another Test</button>
                </div>
            </div>
        );
    }

    if (showQuestions && questions.length > 0) {
        const q = questions[currentIndex];
        const evalResult = evaluation[currentIndex];

        return (
            <div style={styles.container}>
                <div style={styles.quizCard}>
                    <div style={styles.quizHeader}>
                        <span style={styles.progress}>Question {currentIndex + 1} of {questions.length}</span>
                        <span style={styles.difficulty}>{q.difficulty}</span>
                    </div>

                    <h3 style={styles.questionText}>{q.question}</h3>

                    <textarea
                        style={styles.answerInput}
                        placeholder="Type your technical answer here..."
                        value={answers[currentIndex] || ''}
                        onChange={(e) => handleAnswer(e.target.value)}
                    />

                    <button 
                        style={{...styles.evaluateBtn, opacity: evaluating ? 0.7 : 1}} 
                        onClick={handleEvaluate}
                        disabled={evaluating}
                    >
                        {evaluating ? '🤖 AI is analyzing your answer...' : '📝 Evaluate my answer with AI'}
                    </button>

                    {evalResult && (
                        <div style={{
                            ...styles.feedbackBox, 
                            backgroundColor: evalResult.score >= 70 ? '#1a2d1f' : '#2d1f1f',
                            borderLeft: `4px solid ${evalResult.score >= 70 ? '#68d391' : '#fc8181'}`
                        }}>
                            <p style={styles.scoreText}>AI Score: {evalResult.score}/100</p>
                            <p style={styles.feedbackText}>{evalResult.feedback}</p>
                        </div>
                    )}

                    <div style={styles.quizButtons}>
                        <button style={styles.navBtn} onClick={handlePrev} disabled={currentIndex === 0}>← Previous</button>
                        <button style={styles.navBtn} onClick={handleNext}>
                            {currentIndex === questions.length - 1 ? 'Finish Test' : 'Next Question →'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {mode === 'practice' ? (
                <div style={styles.setupCard}>
                    <h2 style={styles.setupTitle}>🎤 Practice Mode</h2>
                    <p style={styles.setupSub}>Practice real interview questions and get AI feedback.</p>
                    
                    <div style={styles.grid}>
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => setSelectedCategory(cat)}
                                style={{...styles.catBtn, backgroundColor: selectedCategory === cat ? '#7c3aed' : '#2d2d3f'}}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <button style={styles.startBtn} onClick={handleStartTest} disabled={loading}>
                        {loading ? 'Generating Test...' : '🚀 Start Practice Test'}
                    </button>
                    
                    <button style={styles.switchModeBtn} onClick={() => setMode('create')}>➕ Add Custom Question</button>
                </div>
            ) : (
                <div style={styles.setupCard}>
                    <h2 style={styles.setupTitle}>➕ Create Question</h2>
                    <form onSubmit={handleCreateQuestion} style={styles.form}>
                        <input style={styles.input} placeholder="Topic (e.g. JVM, SQL Joins)" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} />
                        <textarea style={styles.textarea} placeholder="The Question" value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} required />
                        <textarea style={styles.textarea} placeholder="Ideal Answer (for AI to compare against)" value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} required />
                        <button style={styles.startBtn} type="submit">{createLoading ? 'Saving...' : 'Save Question'}</button>
                        <button style={styles.switchModeBtn} type="button" onClick={() => setMode('practice')}>Back to Practice</button>
                        {createMessage && <p style={{color: '#68d391', marginTop: '10px'}}>{createMessage}</p>}
                    </form>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { padding: '20px', backgroundColor: '#0f0f1a', minHeight: '70vh' },
    setupCard: { backgroundColor: '#1e1e2e', padding: '30px', borderRadius: '12px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' },
    setupTitle: { color: '#e2e8f0', marginBottom: '10px' },
    setupSub: { color: '#718096', marginBottom: '20px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', marginBottom: '20px' },
    catBtn: { padding: '12px', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold' },
    startBtn: { width: '100%', padding: '15px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' },
    switchModeBtn: { marginTop: '15px', background: 'none', border: 'none', color: '#718096', cursor: 'pointer', textDecoration: 'underline' },
    quizCard: { backgroundColor: '#1e1e2e', padding: '30px', borderRadius: '12px', maxWidth: '700px', margin: '0 auto' },
    quizHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px' },
    progress: { color: '#7c3aed', fontWeight: 'bold' },
    difficulty: { color: '#d97706', textTransform: 'uppercase' },
    questionText: { color: '#e2e8f0', marginBottom: '20px', lineHeight: '1.5' },
    answerInput: { width: '100%', height: '120px', padding: '15px', borderRadius: '8px', backgroundColor: '#0f0f1a', color: 'white', border: '1px solid #2d2d3f', marginBottom: '15px', resize: 'none', fontFamily: 'inherit' },
    evaluateBtn: { width: '100%', padding: '12px', backgroundColor: '#2d2d3f', color: '#e2e8f0', border: '1px solid #7c3aed', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginBottom: '20px' },
    feedbackBox: { padding: '15px', borderRadius: '8px', marginBottom: '20px' },
    scoreText: { margin: '0 0 5px 0', fontWeight: 'bold', color: '#e2e8f0' },
    feedbackText: { margin: 0, fontSize: '14px', color: '#a0aec0', fontStyle: 'italic' },
    quizButtons: { display: 'flex', justifyContent: 'space-between', gap: '10px' },
    navBtn: { flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#2d2d3f', color: 'white', cursor: 'pointer' },
    resultCard: { backgroundColor: '#1e1e2e', padding: '40px', borderRadius: '12px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' },
    resultTitle: { color: '#e2e8f0', marginBottom: '20px' },
    resultStats: { display: 'flex', justifyContent: 'space-around', marginBottom: '30px' },
    statBox: { display: 'flex', flexDirection: 'column' },
    statLabel: { color: '#718096', fontSize: '14px' },
    statValue: { color: '#e2e8f0', fontSize: '24px', fontWeight: 'bold' },
    retryBtn: { padding: '12px 30px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' },
    input: { padding: '12px', borderRadius: '8px', backgroundColor: '#0f0f1a', border: '1px solid #2d2d3f', color: 'white' },
    textarea: { padding: '12px', borderRadius: '8px', backgroundColor: '#0f0f1a', border: '1px solid #2d2d3f', color: 'white', minHeight: '80px' },
};