import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { CheckCircle, PlayCircle, FileText, Upload } from 'lucide-react';
import { toEmbeddableYouTubeUrl } from '../utils/videoUrl';

export const CourseDetails = () => {
    const { courseId } = useParams();
    const { courses, markModuleCompleted, submitAssignment: submitCourseAssignment, getCompletedModules, getAssignmentScore, isAssignmentGraded, getCourseProgress, hasCompletedCourseComponents, isCoursePassed } = useCourses();
    const { user } = useAuth();
    const userId = user?.id;
    const course = courses.find(c => c.id === courseId);
    const [activeModule, setActiveModule] = useState(0);
    const [assignmentFile, setAssignmentFile] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const modules = course?.modules || [];
    const currentModule = modules[activeModule];
    const currentModuleVideoSource = currentModule?.videoSource || 'youtube';
    const currentModuleVideoUrl = currentModuleVideoSource === 'youtube'
        ? toEmbeddableYouTubeUrl(currentModule?.videoUrl)
        : currentModule?.videoUrl;
    const completedModules = userId ? getCompletedModules(userId, courseId) : null;
    const assignmentScore = userId ? getAssignmentScore(userId, courseId) : null;
    const assignmentGraded = userId ? isAssignmentGraded(userId, courseId) : false;
    const progress = userId ? getCourseProgress(userId, courseId, modules.length) : 0;
    const allComponentsCompleted = userId ? hasCompletedCourseComponents(userId, courseId, modules.length) : false;
    const hasPassedCourse = userId ? isCoursePassed(userId, courseId, modules.length) : false;

    useEffect(() => {
        if (!course || !userId) {
            return;
        }

        if (!currentModule?.id || completedModules?.includes(currentModule.id)) {
            return;
        }

        const watchTimer = setTimeout(() => {
            markModuleCompleted(userId, courseId, currentModule.id);
        }, 15000);

        return () => clearTimeout(watchTimer);
    }, [course, currentModule?.id, completedModules, markModuleCompleted, userId, courseId]);

    if (!course) return <Navigate to="/courses" />;
    if (!userId) return <Navigate to="/login" />;

    const handleFileChange = (e) => {
        setAssignmentFile(e.target.files[0]);
    };

    const handleAssignmentSubmit = () => {
        if (!assignmentFile) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            submitCourseAssignment(userId, courseId, {
                name: assignmentFile.name,
                type: assignmentFile.type,
                dataUrl: reader.result
            });
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000);
            alert(`Assignment submitted: ${assignmentFile.name}`);
        };
        reader.onerror = () => {
            alert('Unable to read the selected file. Please try again.');
        };
        reader.readAsDataURL(assignmentFile);
    };

    return (
        <div className="container" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>

            {/* Sidebar: Modules */}
            <Card style={{ padding: '0', overflow: 'hidden', height: 'fit-content' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--gray-100)' }}>
                    <h3>Course Content</h3>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>Progress: {progress}%</p>
                    <p style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>Assignment score: {assignmentGraded ? `${assignmentScore}/25` : 'Pending educator review'}</p>
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
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span>Module {idx + 1}</span>
                                {completedModules?.includes(module.id) && <CheckCircle size={14} color="var(--success)" />}
                            </div>
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

                    {/* Video Player or Content */}
                    {currentModule && currentModuleVideoUrl ? (
                        <div style={{ marginBottom: '2rem' }}>
                            {currentModuleVideoSource === 'upload' ? (
                                <video
                                    controls
                                    style={{ width: '100%', borderRadius: 'var(--radius-lg)', background: 'var(--gray-900)' }}
                                    src={currentModuleVideoUrl}
                                />
                            ) : (
                                <div style={{ 
                                    position: 'relative', 
                                    paddingBottom: '56.25%', /* 16:9 aspect ratio */
                                    height: 0,
                                    overflow: 'hidden',
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--gray-900)'
                                }}>
                                    <iframe
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            border: 'none'
                                        }}
                                        src={currentModuleVideoUrl}
                                        title={currentModule.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            )}
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ color: 'var(--gray-700)', fontSize: '0.95rem' }}>{currentModule.content}</p>
                                {!completedModules?.includes(currentModule.id) && (
                                    <p style={{ marginTop: '0.5rem', color: 'var(--gray-500)', fontSize: '0.8rem' }}>Keep this video open for about 15 seconds to mark this module complete.</p>
                                )}
                            </div>
                        </div>
                    ) : currentModule ? (
                        <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <PlayCircle size={48} color="var(--primary-400)" style={{ marginBottom: '1rem' }} />
                                <p style={{ maxWidth: '400px', color: 'var(--gray-600)' }}>{currentModule.content}</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                            <p>Select a module to start learning.</p>
                        </div>
                    )}

                    {allComponentsCompleted && hasPassedCourse && (
                        <div style={{ marginBottom: '1.5rem', background: 'var(--success)', color: 'white', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={18} /> Congratulations! You passed this course.
                        </div>
                    )}

                    {allComponentsCompleted && !hasPassedCourse && (
                        <div style={{ marginBottom: '1.5rem', background: 'var(--warning)', color: 'white', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={18} /> Course completed, but minimum 90% is required to pass.
                        </div>
                    )}

                    <div style={{ background: 'var(--primary-50)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={20} /> Assignment Submission
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <Input type="file" onChange={handleFileChange} />
                            </div>
                            <Button onClick={handleAssignmentSubmit} disabled={!assignmentFile}>
                                <Upload size={18} /> Submit
                            </Button>
                        </div>
                        {assignmentGraded && (
                            <div style={{ marginTop: '1rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle size={16} /> Assignment reviewed by educator: {assignmentScore}/25.
                            </div>
                        )}
                        {submitted && <div style={{ marginTop: '1rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} /> Successfully submitted!</div>}
                    </div>
                </Card>
            </div>
        </div>
    );
};
