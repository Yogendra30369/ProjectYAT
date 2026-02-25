import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { CheckCircle, PlayCircle, FileText, Upload } from 'lucide-react';

export const CourseDetails = () => {
    const { courseId } = useParams();
    const { courses } = useCourses();
    const course = courses.find(c => c.id === courseId);
    const [activeModule, setActiveModule] = useState(0);
    const [assignmentFile, setAssignmentFile] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    if (!course) return <Navigate to="/courses" />;

    const modules = course.modules || [];
    const currentModule = modules[activeModule];

    const handleFileChange = (e) => {
        setAssignmentFile(e.target.files[0]);
    };

    const submitAssignment = () => {
        // Mock submission
        if (assignmentFile) {
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000);
            alert(`Assignment submitted: ${assignmentFile.name}`);
        }
    };

    return (
        <div className="container" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>

            {/* Sidebar: Modules */}
            <Card style={{ padding: '0', overflow: 'hidden', height: 'fit-content' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--gray-100)' }}>
                    <h3>Course Content</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {modules.map((module, idx) => (
                        <button
                            key={module.id}
                            onClick={() => setActiveModule(idx)}
                            style={{
                                padding: '1rem 1.5rem',
                                textAlign: 'left',
                                background: activeModule === idx ? 'var(--primary-50)' : 'transparent',
                                borderLeft: activeModule === idx ? '4px solid var(--primary-600)' : '4px solid transparent',
                                borderBottom: '1px solid var(--gray-50)',
                                cursor: 'pointer',
                                fontWeight: activeModule === idx ? '600' : '400',
                                color: activeModule === idx ? 'var(--primary-900)' : 'var(--gray-700)',
                                borderTop: 'none', borderRight: 'none'
                            }}
                        >
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '4px' }}>Module {idx + 1}</div>
                            {module.title}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Main Content Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <Card>
                    <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem' }}>{currentModule ? currentModule.title : 'No content'}</h2>
                    </div>

                    <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                        {currentModule ? (
                            <div style={{ textAlign: 'center' }}>
                                <PlayCircle size={48} color="var(--primary-400)" style={{ marginBottom: '1rem' }} />
                                <p style={{ maxWidth: '400px', color: 'var(--gray-600)' }}>{currentModule.content}</p>
                            </div>
                        ) : (
                            <p>Select a module to start learning.</p>
                        )}
                    </div>

                    <div style={{ background: 'var(--primary-50)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={20} /> Assignment Submission
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <Input type="file" onChange={handleFileChange} />
                            </div>
                            <Button onClick={submitAssignment} disabled={!assignmentFile}>
                                <Upload size={18} /> Submit
                            </Button>
                        </div>
                        {submitted && <div style={{ marginTop: '1rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} /> Successfully submitted!</div>}
                    </div>
                </Card>
            </div>
        </div>
    );
};
