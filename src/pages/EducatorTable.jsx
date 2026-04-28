import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ArrowLeft, Edit2, Save, X } from 'lucide-react';
import { fetchApi } from '../utils/api';

export const EducatorTable = () => {
    const navigate = useNavigate();
    const { courses } = useCourses();
    
    const [studentCourses, setStudentCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editMarks, setEditMarks] = useState('');
    const [editFeedback, setEditFeedback] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    const fetchStudentCourses = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            
            if (courses.length === 0) {
                setStudentCourses([]);
                setLoading(false);
                return;
            }

            // Fetch students for each course
            const allEnrollments = [];
            for (const course of courses) {
                try {
                    const response = await fetchApi(`/student-courses/course/${course.id}`);
                    allEnrollments.push(...response);
                } catch {
                    console.log(`No students in course ${course.id}`);
                }
            }

            setStudentCourses(allEnrollments);
        } catch (err) {
            setError('Failed to load student courses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [courses]);

    // Fetch all courses with students and their marks
    useEffect(() => {
        fetchStudentCourses();
    }, [fetchStudentCourses]);

    const handleEditClick = (enrollment) => {
        setEditingId(enrollment.id);
        setEditMarks(enrollment.marks.toString());
        setEditFeedback(enrollment.feedback || '');
    };

    const handleSaveMarks = async () => {
        try {
            if (!editingId) return;
            
            const enrollment = studentCourses.find(e => e.id === editingId);
            if (!enrollment) return;

            const marks = parseInt(editMarks, 10);
            if (isNaN(marks) || marks < 0 || marks > 25) {
                setError('Marks must be between 0 and 25');
                return;
            }

            await fetchApi(`/student-courses/update-marks/${enrollment.studentId}/${enrollment.courseId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    marks: marks,
                    feedback: editFeedback
                })
            });

            // Update local state
            setStudentCourses(prevCourses =>
                prevCourses.map(e =>
                    e.id === editingId
                        ? { ...e, marks: marks, feedback: editFeedback }
                        : e
                )
            );

            setEditingId(null);
            setEditMarks('');
            setEditFeedback('');
            setError('');
        } catch (error) {
            setError('Failed to update marks');
            console.error(error);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditMarks('');
        setEditFeedback('');
        setError('');
    };

    // Filter data
    let filteredData = studentCourses;

    if (selectedCourse !== 'all') {
        filteredData = filteredData.filter(e => e.courseId === parseInt(selectedCourse));
    }

    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter(e =>
            e.studentName.toLowerCase().includes(term) ||
            e.courseName.toLowerCase().includes(term)
        );
    }

    return (
        <div className="container" style={{ maxWidth: '1200px', marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <Button variant="ghost" onClick={() => navigate('/educator')} style={{ padding: '0.5rem' }}>
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Student Marks</h1>
                    <p style={{ color: 'var(--gray-500)', margin: 0 }}>Manage student marks and feedback</p>
                </div>
            </div>

            {error && (
                <Card style={{ backgroundColor: '#fee', borderColor: '#fcc', marginBottom: '1rem' }}>
                    <div style={{ color: '#c33' }}>
                        {error}
                    </div>
                </Card>
            )}

            <Card>
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Search Student or Course
                            </label>
                            <Input
                                placeholder="Search by student or course name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Filter by Course
                            </label>
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid var(--gray-300)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit'
                                }}
                            >
                                <option value="all">All Courses</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
                        <p>Loading data...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                        <p>No student marks found.</p>
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
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>
                                        Course Name
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>
                                        Student Name
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>
                                        Marks
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>
                                        Feedback
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map(enrollment => (
                                    <tr key={enrollment.id} style={{
                                        borderBottom: '1px solid var(--gray-200)',
                                        backgroundColor: editingId === enrollment.id ? 'var(--gray-50)' : 'transparent'
                                    }}>
                                        <td style={{ padding: '1rem' }}>
                                            {enrollment.courseName}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {enrollment.studentName}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {editingId === enrollment.id ? (
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="25"
                                                    value={editMarks}
                                                    onChange={(e) => setEditMarks(e.target.value)}
                                                    style={{ width: '80px', textAlign: 'center' }}
                                                />
                                            ) : (
                                                <span style={{ fontWeight: 600 }}>
                                                    {enrollment.marks}/25
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', maxWidth: '300px' }}>
                                            {editingId === enrollment.id ? (
                                                <Input
                                                    placeholder="Add feedback..."
                                                    value={editFeedback}
                                                    onChange={(e) => setEditFeedback(e.target.value)}
                                                    style={{ width: '100%' }}
                                                />
                                            ) : (
                                                <span style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                                                    {enrollment.feedback ? enrollment.feedback.substring(0, 50) + '...' : 'No feedback'}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                {editingId === enrollment.id ? (
                                                    <>
                                                        <Button
                                                            variant="primary"
                                                            onClick={handleSaveMarks}
                                                            style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                        >
                                                            <Save size={16} />
                                                            Save
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={handleCancel}
                                                            style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                        >
                                                            <X size={16} />
                                                            Cancel
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => handleEditClick(enrollment)}
                                                        style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                    >
                                                        <Edit2 size={16} />
                                                        Edit
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)', color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                    Showing {filteredData.length} of {studentCourses.length} records
                </div>
            </Card>

            <Button
                variant="ghost"
                onClick={() => navigate('/educator')}
                style={{ marginTop: '1rem' }}
            >
                ← Back to Dashboard
            </Button>
        </div>
    );
};
