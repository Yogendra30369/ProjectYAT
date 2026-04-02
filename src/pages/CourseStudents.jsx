import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, User } from 'lucide-react';

export const CourseStudents = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { users } = useAuth();
    const { courses, getCourseStudents, getAssignmentDetails, gradeAssignment, getCourseProgress } = useCourses();
    const [gradeInputs, setGradeInputs] = useState({});

    const course = courses.find(c => c.id === courseId);
    const studentIds = getCourseStudents(courseId);

    const enrolledStudents = studentIds
        .map(id => users.find(u => u.id === id && u.role === 'student'))
        .filter(Boolean);

    useEffect(() => {
        const initialGrades = {};
        enrolledStudents.forEach(student => {
            const assignmentInfo = getAssignmentDetails(student.id, courseId);
            initialGrades[student.id] = assignmentInfo.assignmentScore ?? '';
        });
        setGradeInputs(initialGrades);
    }, [courseId, enrolledStudents, getAssignmentDetails]);

    const handleGradeSave = (studentId) => {
        const numericGrade = Number(gradeInputs[studentId]);
        if (Number.isNaN(numericGrade)) {
            alert('Please enter a valid numeric score between 0 and 25.');
            return;
        }
        if (numericGrade < 0 || numericGrade > 25) {
            alert('Assignment score must be between 0 and 25.');
            return;
        }
        gradeAssignment(studentId, courseId, numericGrade);
        alert('Assignment score saved.');
    };

    const handleBackNavigation = () => {
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }

        navigate('/educator', { replace: true });
    };

    const handleOpenSubmission = (assignmentInfo) => {
        if (!assignmentInfo?.assignmentFileDataUrl) {
            alert('Submission file is unavailable for preview. Ask the student to resubmit.');
            return;
        }

        try {
            const [metaPart, dataPart] = assignmentInfo.assignmentFileDataUrl.split(',');
            if (!metaPart || dataPart === undefined) {
                throw new Error('Invalid submission data');
            }

            const mimeMatch = metaPart.match(/data:(.*?);base64/);
            const mimeType = mimeMatch?.[1] || assignmentInfo.assignmentFileType || 'application/octet-stream';

            const binaryString = window.atob(dataPart);
            const buffer = new Uint8Array(binaryString.length);

            for (let index = 0; index < binaryString.length; index += 1) {
                buffer[index] = binaryString.charCodeAt(index);
            }

            const blob = new Blob([buffer], { type: mimeType });
            const objectUrl = URL.createObjectURL(blob);

            const openedWindow = window.open(objectUrl, '_blank');
            if (!openedWindow) {
                alert('Unable to open the file. Please allow pop-ups and try again.');
            } else {
                openedWindow.opener = null;
            }

            setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
        } catch {
            alert('Unable to open the submitted file. Ask the student to resubmit and try again.');
        }
    };

    if (!course) {
        return <div className="container" style={{ marginTop: '2rem' }}>Course not found.</div>;
    }

    return (
        <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Button variant="ghost" onClick={handleBackNavigation} style={{ padding: '0.5rem' }}>
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Enrolled Students</h1>
                    <p style={{ color: 'var(--gray-500)', margin: 0 }}>{course.title}</p>
                </div>
            </div>

            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Students ({enrolledStudents.length})</h3>
                </div>

                {enrolledStudents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                        <User size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>No students enrolled in this course yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {enrolledStudents.map((student) => (
                            <div key={student.id} style={{
                                padding: '1rem',
                                border: '1px solid var(--gray-200)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: '1rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'var(--primary-100)',
                                        color: 'var(--primary-600)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold'
                                    }}>
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '500' }}>{student.name}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{student.email}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: '0.35rem' }}>
                                            Progress: {getCourseProgress(student.id, courseId, course.modules?.length || 0)}%
                                        </div>
                                    </div>
                                </div>

                                <div style={{ minWidth: '270px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {(() => {
                                        const assignmentInfo = getAssignmentDetails(student.id, courseId);
                                        const hasSubmission = assignmentInfo.assignmentSubmitted;
                                        return (
                                            <>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                                                    {hasSubmission
                                                        ? `Submitted: ${assignmentInfo.assignmentFileName || 'Assignment file'}`
                                                        : 'Assignment not submitted yet'}
                                                </div>
                                                {hasSubmission && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleOpenSubmission(assignmentInfo)}
                                                        disabled={!assignmentInfo.assignmentFileDataUrl}
                                                        style={{ width: 'fit-content' }}
                                                    >
                                                        Open file
                                                    </Button>
                                                )}
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="25"
                                                        placeholder="Score /25"
                                                        value={gradeInputs[student.id] ?? ''}
                                                        onChange={(e) => setGradeInputs(prev => ({ ...prev, [student.id]: e.target.value }))}
                                                        disabled={!hasSubmission}
                                                        style={{
                                                            flex: 1,
                                                            border: '1px solid var(--gray-200)',
                                                            borderRadius: 'var(--radius-md)',
                                                            padding: '0.55rem 0.75rem'
                                                        }}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleGradeSave(student.id)}
                                                        disabled={!hasSubmission}
                                                    >
                                                        Save
                                                    </Button>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};
