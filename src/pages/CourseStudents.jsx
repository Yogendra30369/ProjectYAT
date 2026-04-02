import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, User } from 'lucide-react';
import { fetchApi } from '../utils/api';

export const CourseStudents = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { users } = useAuth();
    const { courses, getCourseStudents, getAssignmentDetails, gradeAssignment, getCourseProgress } = useCourses();
    const [gradeInputs, setGradeInputs] = useState({});
    const [feedbackInputs, setFeedbackInputs] = useState({});
    const [studentRecords, setStudentRecords] = useState([]);

    const course = courses.find(c => c.id === courseId);
    const studentIds = getCourseStudents(courseId);

    const enrolledStudents = studentIds.map((id) => {
        const matchingUser = users.find((userRecord) => String(userRecord.id) === String(id));

        if (matchingUser) {
            return matchingUser;
        }

        return {
            id: String(id),
            name: `Student ${id}`,
            email: `ID: ${id}`,
            role: 'student'
        };
    });

    useEffect(() => {
        const loadRecords = async () => {
            try {
                const response = await fetchApi(`/student-courses/course/${courseId}`);
                if (Array.isArray(response)) {
                    setStudentRecords(response);
                }
            } catch (err) {
                console.error(err);
            }
        };
        loadRecords();
        setGradeInputs({});
        setFeedbackInputs({});
    }, [courseId]);

    const handleGradeSave = async (studentId) => {
        const assignmentInfo = getAssignmentDetails(studentId, courseId);
        const currentValue = gradeInputs[studentId] !== undefined ? gradeInputs[studentId] : (assignmentInfo.assignmentScore ?? '');
        
        const numericGrade = Number(currentValue);
        if (currentValue === '' || Number.isNaN(numericGrade)) {
            alert('Please enter a valid numeric score between 0 and 25.');
            return;
        }
        if (numericGrade < 0 || numericGrade > 25) {
            alert('Assignment score must be between 0 and 25.');
            return;
        }

        const currentFeedback = feedbackInputs[studentId] !== undefined ? feedbackInputs[studentId] : 
            (studentRecords.find(r => String(r.studentId) === String(studentId))?.feedback || '');

        try {
            let numericStudentId = typeof studentId === 'string' ? studentId.replace(/\D/g, '') : studentId;
            let numericCourseId = typeof courseId === 'string' ? courseId.replace(/\D/g, '') : courseId;
            if (!numericStudentId) numericStudentId = 1;

            await fetchApi(`/student-courses/update-marks/${numericStudentId}/${numericCourseId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    marks: numericGrade,
                    feedback: currentFeedback
                })
            });

            // Update local state to reflect success
            setStudentRecords(prev => prev.map(r => 
                String(r.studentId) === String(numericStudentId) || String(r.studentId) === String(studentId)
                 ? { ...r, marks: numericGrade, feedback: currentFeedback } 
                 : r
            ));
            
        } catch (err) {
            console.error('Failed to sync to backend. Changes saved locally only.', err);
        }

        gradeAssignment(studentId, courseId, numericGrade);
        alert('Assignment score and feedback saved.');
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
        <div className="container" style={{ maxWidth: '1200px', marginTop: '2rem' }}>
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
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.95rem'
                        }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--gray-300)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Student Name</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Progress</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Submission</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Marks/25</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Feedback</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrolledStudents.map((student) => {
                                    const assignmentInfo = getAssignmentDetails(student.id, courseId);
                                    const hasSubmission = assignmentInfo.assignmentSubmitted;
                                    const record = studentRecords.find(r => String(r.studentId) === String(student.id)) || {};
                                    
                                    return (
                                        <tr key={student.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                            <td style={{ padding: '1rem' }}>
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
                                                        fontWeight: 'bold',
                                                        flexShrink: 0
                                                    }}>
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{student.name}</div>
                                                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{student.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ fontWeight: 500, color: 'var(--primary-600)' }}>
                                                    {getCourseProgress(student.id, courseId, course.modules?.length || 0)}%
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {hasSubmission ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                                                            {assignmentInfo.assignmentFileName || 'Submitted File'}
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleOpenSubmission(assignmentInfo)}
                                                            disabled={!assignmentInfo.assignmentFileDataUrl}
                                                            style={{ width: 'fit-content' }}
                                                        >
                                                            Open
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Not submitted</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="25"
                                                    placeholder="Score"
                                                    value={gradeInputs[student.id] !== undefined ? gradeInputs[student.id] : (assignmentInfo.assignmentScore ?? '')}
                                                    onChange={(e) => setGradeInputs(prev => ({ ...prev, [student.id]: e.target.value }))}
                                                    disabled={!hasSubmission}
                                                    style={{
                                                        width: '80px',
                                                        border: '1px solid var(--gray-200)',
                                                        borderRadius: 'var(--radius-md)',
                                                        padding: '0.55rem',
                                                        textAlign: 'center'
                                                    }}
                                                />
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <input
                                                    type="text"
                                                    placeholder={hasSubmission ? "Add feedback..." : "Wait for sub..."}
                                                    value={feedbackInputs[student.id] !== undefined ? feedbackInputs[student.id] : (record.feedback || '')}
                                                    onChange={(e) => setFeedbackInputs(prev => ({ ...prev, [student.id]: e.target.value }))}
                                                    disabled={!hasSubmission}
                                                    style={{
                                                        width: '100%',
                                                        minWidth: '200px',
                                                        border: '1px solid var(--gray-200)',
                                                        borderRadius: 'var(--radius-md)',
                                                        padding: '0.55rem'
                                                    }}
                                                />
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() => handleGradeSave(student.id)}
                                                    disabled={!hasSubmission}
                                                >
                                                    Save
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};
