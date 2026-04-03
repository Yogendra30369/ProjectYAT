import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_COURSES } from '../data/mockData';
import { fetchApi } from '../utils/api';

const CourseContext = createContext();
const COURSE_SEED_VERSION = '2026-02-fullstack-v1';

const parseJsonOrFallback = (value, fallback) => {
    if (!value) {
        return fallback;
    }

    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

const normalizeAssignmentFields = (course = {}) => {
    const legacyAssignment = course.assignmentFile || course.assignment || course.assignmentQuestionFile || null;

    const assignmentFileName =
        course.assignmentFileName
        || course.assignmentQuestionFileName
        || legacyAssignment?.name
        || '';

    const assignmentFileType =
        course.assignmentFileType
        || course.assignmentQuestionFileType
        || legacyAssignment?.type
        || '';

    const assignmentFileDataUrl =
        course.assignmentFileDataUrl
        || course.assignmentQuestionFileDataUrl
        || course.assignmentDataUrl
        || legacyAssignment?.dataUrl
        || legacyAssignment?.url
        || '';

    return {
        assignmentFileName,
        assignmentFileType,
        assignmentFileDataUrl
    };
};

const normalizeCourse = (course = {}) => {
    const normalizedModules = Array.isArray(course.modules)
        ? course.modules.map((module, index) => {
            if (typeof module === 'string') {
                return {
                    id: `m${index + 1}`,
                    title: module,
                    content: '',
                    videoSource: 'youtube',
                    videoUrl: '',
                    uploadedVideoName: ''
                };
            }

            return {
                id: module.id || `m${index + 1}`,
                title: module.title || '',
                content: module.content || '',
                videoSource: module.videoSource || (module.videoUrl && module.videoUrl.startsWith('data:video') ? 'upload' : 'youtube'),
                videoUrl: module.videoUrl || '',
                uploadedVideoName: module.uploadedVideoName || ''
            };
        })
        : [];

    return {
        ...course,
        modules: normalizedModules,
        ...normalizeAssignmentFields(course)
    };
};

const normalizeCourses = (courseList) => {
    if (!Array.isArray(courseList)) {
        return [];
    }

    return courseList.map(normalizeCourse);
};

const parseModulesFromApi = (modules) => {
    if (Array.isArray(modules)) {
        return modules;
    }

    if (typeof modules !== 'string' || !modules.trim()) {
        return [];
    }

    try {
        const parsed = JSON.parse(modules);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const getNormalizedCourseKey = (courseId) => {
    if (courseId === null || courseId === undefined) {
        return '';
    }

    const value = String(courseId).trim();
    if (!value) {
        return '';
    }

    const digitMatch = value.match(/\d+/);
    if (digitMatch) {
        return digitMatch[0];
    }

    return value.toLowerCase();
};

const courseIdsMatch = (leftCourseId, rightCourseId) => {
    const leftKey = getNormalizedCourseKey(leftCourseId);
    const rightKey = getNormalizedCourseKey(rightCourseId);

    return leftKey !== '' && leftKey === rightKey;
};

const extractNumericId = (value) => {
    const key = getNormalizedCourseKey(value);
    if (!key) {
        return null;
    }

    const parsed = Number(key);
    return Number.isFinite(parsed) ? parsed : null;
};

const toPersistableModules = (modules) => {
    if (!Array.isArray(modules)) {
        return [];
    }

    return modules.map((module, index) => {
        if (typeof module === 'string') {
            return {
                id: `m${index + 1}`,
                title: module.trim(),
                content: '',
                videoSource: 'youtube',
                videoUrl: '',
                uploadedVideoName: ''
            };
        }

        return {
            id: module?.id || `m${index + 1}`,
            title: module?.title || '',
            content: module?.content || '',
            videoSource: module?.videoSource || (module?.videoUrl && module.videoUrl.startsWith('data:video') ? 'upload' : 'youtube'),
            videoUrl: module?.videoUrl || '',
            uploadedVideoName: module?.uploadedVideoName || ''
        };
    });
};

const getDefaultRegistrationDate = (offsetDays = 0) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    now.setDate(now.getDate() - offsetDays);
    return now.toISOString();
};

const buildEnrollmentMetaFromMap = (enrollmentMap) => {
    return Object.entries(enrollmentMap || {}).reduce((acc, [userId, courseIds]) => {
        const userMeta = {};

        courseIds.forEach((courseId, index) => {
            userMeta[courseId] = {
                registeredAt: getDefaultRegistrationDate(index)
            };
        });

        acc[userId] = userMeta;
        return acc;
    }, {});
};

const isLegacyUserId = (value) => /^u\d+$/i.test(String(value || ''));
const isLegacyCourseId = (value) => /^c\d+$/i.test(String(value || ''));

const sanitizeEnrollmentMap = (enrollmentMap = {}) => {
    return Object.entries(enrollmentMap).reduce((acc, [userId, courseIds]) => {
        if (isLegacyUserId(userId)) {
            return acc;
        }

        const cleanedCourseIds = (Array.isArray(courseIds) ? courseIds : [])
            .map((courseId) => String(courseId))
            .filter((courseId) => !isLegacyCourseId(courseId));

        if (cleanedCourseIds.length > 0) {
            acc[String(userId)] = cleanedCourseIds;
        }

        return acc;
    }, {});
};

const sanitizeEnrollmentMetaMap = (enrollmentMetaMap = {}) => {
    return Object.entries(enrollmentMetaMap).reduce((acc, [userId, perCourseMeta]) => {
        if (isLegacyUserId(userId) || !perCourseMeta || typeof perCourseMeta !== 'object') {
            return acc;
        }

        const cleanedPerCourseMeta = Object.entries(perCourseMeta).reduce((innerAcc, [courseId, meta]) => {
            if (!isLegacyCourseId(courseId)) {
                innerAcc[String(courseId)] = meta;
            }

            return innerAcc;
        }, {});

        if (Object.keys(cleanedPerCourseMeta).length > 0) {
            acc[String(userId)] = cleanedPerCourseMeta;
        }

        return acc;
    }, {});
};

const extractEnrollmentsFromResponse = (payload) => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (!payload || typeof payload !== 'object') {
        return [];
    }

    const listLikeKeys = ['data', 'items', 'content', 'enrollments', 'records'];
    for (const key of listLikeKeys) {
        if (Array.isArray(payload[key])) {
            return payload[key];
        }
    }

    return [];
};

const toEnrollmentRecord = (enrollment) => {
    const studentId = enrollment?.studentId
        ?? enrollment?.student_id
        ?? enrollment?.student?.id
        ?? enrollment?.userId
        ?? enrollment?.user?.id;

    const courseId = enrollment?.courseId
        ?? enrollment?.course_id
        ?? enrollment?.course?.id;

    if (studentId === undefined || studentId === null || courseId === undefined || courseId === null) {
        return null;
    }

    return {
        id: enrollment?.id,
        userId: String(studentId),
        courseId: String(courseId),
        registeredAt: enrollment?.registeredAt || enrollment?.enrolledAt || enrollment?.createdAt || null
    };
};

const buildEnrollmentStateFromRecords = (records) => {
    const nextMap = {};
    const nextMetaMap = {};

    records.forEach((record) => {
        if (!nextMap[record.userId]) {
            nextMap[record.userId] = [];
        }

        if (!nextMap[record.userId].includes(record.courseId)) {
            nextMap[record.userId].push(record.courseId);
        }

        if (!nextMetaMap[record.userId]) {
            nextMetaMap[record.userId] = {};
        }

        nextMetaMap[record.userId][record.courseId] = {
            enrollmentId: record.id,
            registeredAt: record.registeredAt || getDefaultRegistrationDate()
        };
    });

    return {
        enrolledMap: nextMap,
        enrollmentMetaMap: nextMetaMap
    };
};

export const CourseProvider = ({ children }) => {
    const [courses, setCourses] = useState(() => {
        const storedCourses = localStorage.getItem('courses');
        const storedCourseSeedVersion = localStorage.getItem('coursesSeedVersion');

        if (storedCourses && storedCourseSeedVersion === COURSE_SEED_VERSION) {
            const parsedCourses = parseJsonOrFallback(storedCourses, MOCK_COURSES);
            const normalizedStoredCourses = normalizeCourses(parsedCourses);
            localStorage.setItem('courses', JSON.stringify(normalizedStoredCourses));
            return normalizedStoredCourses;
        }

        const normalizedMockCourses = normalizeCourses(MOCK_COURSES);
        localStorage.setItem('courses', JSON.stringify(normalizedMockCourses));
        localStorage.setItem('coursesSeedVersion', COURSE_SEED_VERSION);
        return normalizedMockCourses;
    });

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const apiCourses = await fetchApi('/courses/all');
                if (Array.isArray(apiCourses) && apiCourses.length > 0) {
                    // Recover locally-stored assignment file data URLs by course ID
                    // (base64 file data is NOT stored in the backend for performance reasons)
                    const localCoursesBefore = parseJsonOrFallback(localStorage.getItem('courses'), []);
                    const localAssignmentMap = {};
                    localCoursesBefore.forEach(lc => {
                        if (lc.id && lc.assignmentFileDataUrl) {
                            localAssignmentMap[String(lc.id)] = lc.assignmentFileDataUrl;
                        }
                    });

                    const normalizedApiCourses = apiCourses.map(c => {
                        const modules = parseModulesFromApi(c.modules);
                        return normalizeCourse({
                            ...c,
                            id: String(c.id),
                            modules,
                            // Restore file data URL from localStorage; backend only stores metadata
                            assignmentFileDataUrl: localAssignmentMap[String(c.id)] || ''
                        });
                    });

                    localStorage.setItem('courses', JSON.stringify(normalizedApiCourses));
                    setCourses(normalizedApiCourses);
                } else if (Array.isArray(apiCourses) && apiCourses.length === 0) {
                    // Sync initial courses to newly connected database (metadata only, no file data)
                    const localCourses = parseJsonOrFallback(localStorage.getItem('courses'), MOCK_COURSES);
                    for (const c of localCourses) {
                        await fetchApi('/courses/create', {
                            method: 'POST',
                            body: JSON.stringify({
                                title: c.title || '',
                                description: c.description || '',
                                modules: JSON.stringify(toPersistableModules(c.modules || [])),
                                registeredStudents: c.registeredStudents || 0,
                                assignmentFileName: c.assignmentFileName || '',
                                assignmentFileType: c.assignmentFileType || ''
                                // assignmentFileDataUrl intentionally omitted — kept in localStorage only
                            })
                        }).catch(e => console.error(e));
                    }
                    // Reload synced courses
                    const newApiCourses = await fetchApi('/courses/all');
                    if (Array.isArray(newApiCourses) && newApiCourses.length > 0) {
                        const localCoursesSeed = parseJsonOrFallback(localStorage.getItem('courses'), []);
                        const localAssignmentMapSeed = {};
                        localCoursesSeed.forEach(lc => {
                            if (lc.assignmentFileDataUrl) {
                                localAssignmentMapSeed[String(lc.id)] = lc.assignmentFileDataUrl;
                            }
                        });
                        const normalized = newApiCourses.map(c => {
                            const modules = parseModulesFromApi(c.modules);
                            return normalizeCourse({
                                ...c,
                                id: String(c.id),
                                modules,
                                assignmentFileDataUrl: localAssignmentMapSeed[String(c.id)] || ''
                            });
                        });
                        setCourses(normalized);
                        localStorage.setItem('courses', JSON.stringify(normalized));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch courses from backend:", error);
            }
        };
        loadCourses();
    }, []);

    const [enrolledMap, setEnrolledMap] = useState(() => {
        const storedEnrollments = localStorage.getItem('enrollments');
        const parsedEnrollments = parseJsonOrFallback(storedEnrollments, {});
        const sanitizedEnrollments = sanitizeEnrollmentMap(parsedEnrollments);
        localStorage.setItem('enrollments', JSON.stringify(sanitizedEnrollments));
        return sanitizedEnrollments;
    });

    const [enrollmentMetaMap, setEnrollmentMetaMap] = useState(() => {
        const storedEnrollmentMeta = localStorage.getItem('enrollmentMeta');
        if (storedEnrollmentMeta) {
            const parsedMeta = parseJsonOrFallback(storedEnrollmentMeta, {});
            const sanitizedMeta = sanitizeEnrollmentMetaMap(parsedMeta);
            localStorage.setItem('enrollmentMeta', JSON.stringify(sanitizedMeta));
            return sanitizedMeta;
        }

        const currentEnrollments = sanitizeEnrollmentMap(parseJsonOrFallback(localStorage.getItem('enrollments'), {}));
        const defaultEnrollmentMeta = buildEnrollmentMetaFromMap(currentEnrollments);
        localStorage.setItem('enrollmentMeta', JSON.stringify(defaultEnrollmentMeta));
        return defaultEnrollmentMeta;
    });

    useEffect(() => {
        const loadEnrollmentsFromBackend = async () => {
            const endpoints = ['/student-courses/all', '/student-courses', '/student-courses/list'];

            for (const endpoint of endpoints) {
                try {
                    const response = await fetchApi(endpoint);
                    const enrollmentRecords = extractEnrollmentsFromResponse(response)
                        .map(toEnrollmentRecord)
                        .filter(Boolean);

                    if (enrollmentRecords.length === 0) {
                        continue;
                    }

                    const nextEnrollmentState = buildEnrollmentStateFromRecords(enrollmentRecords);
                    setEnrolledMap(nextEnrollmentState.enrolledMap);
                    setEnrollmentMetaMap(nextEnrollmentState.enrollmentMetaMap);
                    localStorage.setItem('enrollments', JSON.stringify(nextEnrollmentState.enrolledMap));
                    localStorage.setItem('enrollmentMeta', JSON.stringify(nextEnrollmentState.enrollmentMetaMap));
                    return;
                } catch {
                    // Try the next endpoint candidate.
                }
            }
        };

        loadEnrollmentsFromBackend();
    }, []);

    const [progressMap, setProgressMap] = useState(() => {
        const storedProgress = localStorage.getItem('courseProgress');
        if (storedProgress) {
            return parseJsonOrFallback(storedProgress, {});
        }

        localStorage.setItem('courseProgress', JSON.stringify({}));
        return {};
    }); // userId -> { courseId: [moduleId] }

    const normalizeCourseProgress = (userCourseProgress) => {
        if (Array.isArray(userCourseProgress)) {
            return {
                completedModules: userCourseProgress,
                assignmentSubmitted: false,
                assignmentFileName: '',
                assignmentFileType: '',
                assignmentFileDataUrl: '',
                assignmentScore: null
            };
        }

        return {
            completedModules: userCourseProgress?.completedModules || [],
            assignmentSubmitted: !!userCourseProgress?.assignmentSubmitted,
            assignmentFileName: userCourseProgress?.assignmentFileName || '',
            assignmentFileType: userCourseProgress?.assignmentFileType || '',
            assignmentFileDataUrl: userCourseProgress?.assignmentFileDataUrl || '',
            assignmentScore: typeof userCourseProgress?.assignmentScore === 'number'
                ? userCourseProgress.assignmentScore
                : null
        };
    };

    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

    const toSafeDate = (value) => {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    };

    const addCourse = async (newCourse) => {
        try {
            const payload = {
                title: newCourse.title || '',
                description: newCourse.description || '',
                modules: JSON.stringify(toPersistableModules(newCourse.modules || [])),
                registeredStudents: 0,
                assignmentFileName: newCourse.assignmentFileName || '',
                assignmentFileType: newCourse.assignmentFileType || ''
                // assignmentFileDataUrl intentionally omitted — kept in localStorage only
            };

            const apiCourse = await fetchApi('/courses/create', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            // Parse modules back from JSON string
            const parsedCourse = {
                ...apiCourse,
                modules: apiCourse.modules ? JSON.parse(apiCourse.modules) : [],
                id: String(apiCourse.id)
            };

            const normalizedNewCourse = normalizeCourse(parsedCourse);
            const updatedCourses = [...courses, normalizedNewCourse];
            setCourses(updatedCourses);
            localStorage.setItem('courses', JSON.stringify(updatedCourses));
            
            return normalizedNewCourse;
        } catch (error) {
            console.error("Failed to create course via API:", error);
            // Local fallback
            const normalizedNewCourse = normalizeCourse({ ...newCourse, id: Date.now().toString() });
            const updatedCourses = [...courses, normalizedNewCourse];
            setCourses(updatedCourses);
            localStorage.setItem('courses', JSON.stringify(updatedCourses));
            
            return normalizedNewCourse;
        }
    };

    const updateCourse = (updatedCourse) => {
        const normalizedUpdatedCourse = normalizeCourse(updatedCourse);
        const updatedCourses = courses.map(c => c.id === normalizedUpdatedCourse.id ? normalizedUpdatedCourse : c);
        setCourses(updatedCourses);
        localStorage.setItem('courses', JSON.stringify(updatedCourses));
        
        // Optionally sync to backend
        fetchApi(`/courses/update/${normalizedUpdatedCourse.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                title: normalizedUpdatedCourse.title,
                description: normalizedUpdatedCourse.description,
                modules: JSON.stringify(toPersistableModules(normalizedUpdatedCourse.modules || [])),
                registeredStudents: normalizedUpdatedCourse.registeredStudents || 0,
                assignmentFileName: normalizedUpdatedCourse.assignmentFileName || '',
                assignmentFileType: normalizedUpdatedCourse.assignmentFileType || ''
                // assignmentFileDataUrl intentionally omitted — kept in localStorage only
            })
        }).catch(e => console.error("Failed to update course:", e));
    };

    const deleteCourse = (courseId) => {
        // Remove from courses
        const updatedCourses = courses.filter(c => c.id !== courseId);
        setCourses(updatedCourses);
        localStorage.setItem('courses', JSON.stringify(updatedCourses));

        // Remove from enrollments
        const newEnrolledMap = { ...enrolledMap };
        Object.keys(newEnrolledMap).forEach(userId => {
            newEnrolledMap[userId] = newEnrolledMap[userId].filter(id => id !== courseId);
        });
        setEnrolledMap(newEnrolledMap);
        localStorage.setItem('enrollments', JSON.stringify(newEnrolledMap));

        const updatedProgressMap = { ...progressMap };
        Object.keys(updatedProgressMap).forEach(userId => {
            if (updatedProgressMap[userId]?.[courseId]) {
                const userCourseProgress = { ...updatedProgressMap[userId] };
                delete userCourseProgress[courseId];
                updatedProgressMap[userId] = userCourseProgress;
            }
        });
        setProgressMap(updatedProgressMap);
        localStorage.setItem('courseProgress', JSON.stringify(updatedProgressMap));
    };

    const enroll = async (userId, courseId) => {
        const userEnrollments = enrolledMap[userId] || [];
        if (!userEnrollments.includes(courseId)) {
            // Convert string IDs to numeric if needed
            let numericStudentId = typeof userId === 'string' ? userId.replace(/\D/g, '') : userId;
            let numericCourseId = typeof courseId === 'string' ? courseId.replace(/\D/g, '') : courseId;
            
            // If the ID could not be converted purely to numbers (e.g. mock fallback missing number)
            if (!numericStudentId) numericStudentId = 1; 
            if (!numericCourseId) numericCourseId = 1;

            try {
                // Call backend enrollment endpoint to save to database first
                const enrollment = await fetchApi(`/student-courses/enroll?studentId=${numericStudentId}&courseId=${numericCourseId}`, {
                    method: 'POST'
                });
                
                console.log('Student enrolled successfully in database:', enrollment);

                const updatedMap = {
                    ...enrolledMap,
                    [userId]: [...userEnrollments, courseId]
                };
                setEnrolledMap(updatedMap);
                localStorage.setItem('enrollments', JSON.stringify(updatedMap));

                const updatedEnrollmentMetaMap = {
                    ...enrollmentMetaMap,
                    [userId]: {
                        ...(enrollmentMetaMap[userId] || {}),
                        [courseId]: {
                            enrollmentId: enrollment.id,
                            registeredAt: new Date().toISOString()
                        }
                    }
                };
                setEnrollmentMetaMap(updatedEnrollmentMetaMap);
                localStorage.setItem('enrollmentMeta', JSON.stringify(updatedEnrollmentMetaMap));

                const updatedCourse = await fetchApi(`/courses/${numericCourseId}/student-count?delta=1`, {
                    method: 'PATCH'
                });

                setCourses((prevCourses) => {
                    const nextCourses = prevCourses.map((course) =>
                        course.id === String(updatedCourse.id) || course.id === courseId
                            ? normalizeCourse({
                                ...course,
                                ...updatedCourse,
                                id: String(course.id), // preserve original id reference
                                modules: updatedCourse.modules ? JSON.parse(updatedCourse.modules) : (course.modules || [])
                            })
                            : course
                    );
                    localStorage.setItem('courses', JSON.stringify(nextCourses));
                    return nextCourses;
                });
            } catch (error) {
                console.error('Failed to save enrollment to database:', error);
                // On failure, don't update local state so they can try again.
                // Could toast an error here.
                throw error;
            }
        }
    };

    const unenroll = async (userId, courseId) => {
        const userEnrollments = enrolledMap[userId] || [];
        if (userEnrollments.includes(courseId)) {
            let numericCourseId = typeof courseId === 'string' ? courseId.replace(/\D/g, '') : courseId;
            if (!numericCourseId) numericCourseId = 1;

            const userEnrollmentMeta = enrollmentMetaMap[userId] || {};
            const enrollmentId = userEnrollmentMeta[courseId]?.enrollmentId;

            try {
                if (enrollmentId) {
                    await fetchApi(`/student-courses/${enrollmentId}`, {
                        method: 'DELETE'
                    });
                    console.log('Enrollment deleted from database');
                }

                // If no enrollmentId locally, attempt to delete by user+course directly or skip for mock testing
                
                const updatedCourse = await fetchApi(`/courses/${numericCourseId}/student-count?delta=-1`, {
                    method: 'PATCH'
                });

                // Update Local state only after successful external fetch
                const updatedMap = {
                    ...enrolledMap,
                    [userId]: userEnrollments.filter(id => id !== courseId)
                };
                setEnrolledMap(updatedMap);
                localStorage.setItem('enrollments', JSON.stringify(updatedMap));
    
                if (userEnrollmentMeta[courseId]) {
                    const updatedUserEnrollmentMeta = { ...userEnrollmentMeta };
                    delete updatedUserEnrollmentMeta[courseId];
    
                    const updatedEnrollmentMetaMap = {
                        ...enrollmentMetaMap,
                        [userId]: updatedUserEnrollmentMeta
                    };
    
                    setEnrollmentMetaMap(updatedEnrollmentMetaMap);
                    localStorage.setItem('enrollmentMeta', JSON.stringify(updatedEnrollmentMetaMap));
                }
    
                const userProgress = progressMap[userId] || {};
                if (userProgress[courseId]) {
                    const updatedUserProgress = { ...userProgress };
                    delete updatedUserProgress[courseId];
                    const updatedProgressMap = {
                        ...progressMap,
                        [userId]: updatedUserProgress
                    };
                    setProgressMap(updatedProgressMap);
                    localStorage.setItem('courseProgress', JSON.stringify(updatedProgressMap));
                }

                setCourses((prevCourses) => {
                    const nextCourses = prevCourses.map((course) =>
                        course.id === String(updatedCourse.id) || course.id === courseId
                            ? normalizeCourse({
                                ...course,
                                ...updatedCourse,
                                id: String(course.id),
                                modules: updatedCourse.modules ? JSON.parse(updatedCourse.modules) : (course.modules || [])
                            })
                            : course
                    );
                    localStorage.setItem('courses', JSON.stringify(nextCourses));
                    return nextCourses;
                });

            } catch (error) {
                console.error('Failed to unenroll from database:', error);
                throw error;
            }
        }
    };

    const markModuleCompleted = (userId, courseId, moduleId) => {
        const userProgress = progressMap[userId] || {};
        const normalizedCourseProgress = normalizeCourseProgress(userProgress[courseId]);

        const completedModules = normalizedCourseProgress.completedModules || [];

        if (completedModules.includes(moduleId)) {
            return;
        }

        const updatedProgressMap = {
            ...progressMap,
            [userId]: {
                ...userProgress,
                [courseId]: {
                    ...normalizedCourseProgress,
                    completedModules: [...completedModules, moduleId]
                }
            }
        };

        setProgressMap(updatedProgressMap);
        localStorage.setItem('courseProgress', JSON.stringify(updatedProgressMap));
    };

    const markAssignmentSubmitted = (userId, courseId) => {
        const userProgress = progressMap[userId] || {};
        const normalizedCourseProgress = normalizeCourseProgress(userProgress[courseId]);

        if (normalizedCourseProgress.assignmentSubmitted) {
            return;
        }

        const updatedProgressMap = {
            ...progressMap,
            [userId]: {
                ...userProgress,
                [courseId]: {
                    ...normalizedCourseProgress,
                    assignmentSubmitted: true
                }
            }
        };

        setProgressMap(updatedProgressMap);
        localStorage.setItem('courseProgress', JSON.stringify(updatedProgressMap));
    };

    const submitAssignment = async (userId, courseId, submissionFile) => {
        if (!(submissionFile instanceof File)) {
            throw new Error('Please select a file before submitting.');
        }

        const numericUserId = extractNumericId(userId);
        const numericCourseId = extractNumericId(courseId);

        if (!numericUserId || !numericCourseId) {
            throw new Error('Invalid user or course id for assignment submission.');
        }

        const formData = new FormData();
        formData.append('file', submissionFile);

        let response;
        try {
            response = await fetchApi(`/assignments/submit/${numericCourseId}/${numericUserId}`, {
                method: 'POST',
                body: formData
            });
        } catch (error) {
            const isNetworkFailure = error instanceof TypeError && String(error.message || '').toLowerCase().includes('fetch');
            if (isNetworkFailure) {
                throw new Error('Unable to reach the backend while submitting the assignment. Make sure the backend server is running.');
            }
            throw error;
        }

        const userProgress = progressMap[userId] || {};
        const normalizedCourseProgress = normalizeCourseProgress(userProgress[courseId]);

        const submittedFileName = response?.fileName || submissionFile.name || normalizedCourseProgress.assignmentFileName;
        const submittedFileType = submissionFile.type || normalizedCourseProgress.assignmentFileType;
        const submittedFilePath = response?.filePath || normalizedCourseProgress.assignmentFilePath || '';

        const updatedProgressMap = {
            ...progressMap,
            [userId]: {
                ...userProgress,
                [courseId]: {
                    ...normalizedCourseProgress,
                    assignmentSubmitted: true,
                    assignmentFileName: submittedFileName,
                    assignmentFileType: submittedFileType,
                    assignmentFilePath: submittedFilePath,
                    assignmentScore: null
                }
            }
        };

        setProgressMap(updatedProgressMap);
        localStorage.setItem('courseProgress', JSON.stringify(updatedProgressMap));

        return response;
    };

    const gradeAssignment = (studentId, courseId, score) => {
        const userProgress = progressMap[studentId] || {};
        const normalizedCourseProgress = normalizeCourseProgress(userProgress[courseId]);

        if (!normalizedCourseProgress.assignmentSubmitted) {
            return;
        }

        const boundedScore = Math.max(0, Math.min(25, Number(score) || 0));
        const updatedProgressMap = {
            ...progressMap,
            [studentId]: {
                ...userProgress,
                [courseId]: {
                    ...normalizedCourseProgress,
                    assignmentScore: boundedScore
                }
            }
        };

        setProgressMap(updatedProgressMap);
        localStorage.setItem('courseProgress', JSON.stringify(updatedProgressMap));
    };

    const getCompletedModules = (userId, courseId) => {
        const userCourseProgress = normalizeCourseProgress(progressMap[userId]?.[courseId]);
        return userCourseProgress.completedModules;
    };

    const isAssignmentSubmitted = (userId, courseId) => {
        const userCourseProgress = normalizeCourseProgress(progressMap[userId]?.[courseId]);
        return userCourseProgress.assignmentSubmitted;
    };

    const getAssignmentScore = (userId, courseId) => {
        const userCourseProgress = normalizeCourseProgress(progressMap[userId]?.[courseId]);
        return userCourseProgress.assignmentScore;
    };

    const isAssignmentGraded = (userId, courseId) => {
        const assignmentScore = getAssignmentScore(userId, courseId);
        return typeof assignmentScore === 'number';
    };

    const getAssignmentDetails = (userId, courseId) => {
        return normalizeCourseProgress(progressMap[userId]?.[courseId]);
    };

    const getCourseProgress = (userId, courseId, totalModules) => {
        const safeTotalModules = totalModules || 0;
        if (safeTotalModules === 0) {
            return 0;
        }

        const completedModules = getCompletedModules(userId, courseId).length;
        return Math.min(100, Math.round((completedModules / safeTotalModules) * 100));
    };

    const hasCompletedCourseComponents = (userId, courseId, totalModules) => {
        const safeTotalModules = totalModules || 0;
        const modulesDone = getCompletedModules(userId, courseId).length >= safeTotalModules;
        return modulesDone && isAssignmentGraded(userId, courseId);
    };

    const isCoursePassed = (userId, courseId, totalModules) => {
        const progress = getCourseProgress(userId, courseId, totalModules);
        return hasCompletedCourseComponents(userId, courseId, totalModules) && progress >= 90;
    };

    const getEnrolledCourses = (userId) => {
        const ids = enrolledMap[userId] || [];
        return courses.filter((course) => ids.some((enrolledId) => courseIdsMatch(enrolledId, course.id)));
    };

    const getCourseStudents = (courseId) => {
        return Object.keys(enrolledMap).filter((userId) =>
            (enrolledMap[userId] || []).some((enrolledCourseId) => courseIdsMatch(enrolledCourseId, courseId))
        );
    };

    const getEnrollmentDate = (userId, courseId) => {
        const registeredAt = enrollmentMetaMap[userId]?.[courseId]?.registeredAt;
        return toSafeDate(registeredAt) || new Date();
    };

    const getUpcomingTasks = (userId) => {
        const enrolledCourses = getEnrolledCourses(userId);

        return enrolledCourses
            .map((course, index) => {
                const registrationDate = getEnrollmentDate(userId, course.id);
                const dueDate = new Date(registrationDate.getTime() + ONE_WEEK_MS);

                return {
                    id: `${course.id}-assignment`,
                    courseId: course.id,
                    assignmentTitle: `Assignment ${index + 1}`,
                    courseTitle: course.title,
                    dueDate,
                    isSubmitted: isAssignmentSubmitted(userId, course.id)
                };
            })
            .filter(task => !task.isSubmitted)
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    };

    const pruneInvalidEnrollments = (validUserIds) => {
        const validSet = new Set(validUserIds || []);
        let hasChanges = false;

        const cleanedMap = Object.entries(enrolledMap).reduce((acc, [userId, courseIds]) => {
            if (!validSet.has(userId)) {
                hasChanges = true;
                return acc;
            }

            acc[userId] = courseIds;
            return acc;
        }, {});

        if (hasChanges) {
            setEnrolledMap(cleanedMap);
            localStorage.setItem('enrollments', JSON.stringify(cleanedMap));

            const cleanedMetaMap = Object.entries(enrollmentMetaMap).reduce((acc, [userId, meta]) => {
                if (!validSet.has(userId)) {
                    return acc;
                }

                acc[userId] = meta;
                return acc;
            }, {});

            setEnrollmentMetaMap(cleanedMetaMap);
            localStorage.setItem('enrollmentMeta', JSON.stringify(cleanedMetaMap));
        }
    };

    return (
        <CourseContext.Provider value={{ courses, addCourse, updateCourse, deleteCourse, enroll, unenroll, getEnrolledCourses, getCourseStudents, pruneInvalidEnrollments, markModuleCompleted, markAssignmentSubmitted, submitAssignment, gradeAssignment, getCompletedModules, isAssignmentSubmitted, getAssignmentScore, isAssignmentGraded, getAssignmentDetails, getCourseProgress, hasCompletedCourseComponents, isCoursePassed, getEnrollmentDate, getUpcomingTasks }}>
            {children}
        </CourseContext.Provider>
    );
};

export const useCourses = () => useContext(CourseContext);
