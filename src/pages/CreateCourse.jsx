import React, { useState } from 'react';
import { useCourses } from '../context/CourseContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useNavigate } from 'react-router-dom';
import { Trash, Plus } from 'lucide-react';
import { toEmbeddableYouTubeUrl } from '../utils/videoUrl';

const createModuleId = () => crypto.randomUUID();

const createEmptyModule = () => ({
    id: createModuleId(),
    title: '',
    content: '',
    videoSource: 'youtube',
    videoUrl: '',
    uploadedVideoName: ''
});

export const CreateCourse = () => {
    const { addCourse } = useCourses();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(() => ({
        title: '',
        description: '',
        modules: [createEmptyModule()]
    }));

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleModuleChange = (id, field, value) => {
        const updatedModules = formData.modules.map(m =>
            m.id === id ? { ...m, [field]: value } : m
        );
        setFormData({ ...formData, modules: updatedModules });
    };

    const addModule = () => {
        setFormData({
            ...formData,
            modules: [...formData.modules, createEmptyModule()]
        });
    };

    const removeModule = (id) => {
        setFormData({
            ...formData,
            modules: formData.modules.filter(m => m.id !== id)
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description) return; // Simple validation

        const normalizedCourse = {
            ...formData,
            modules: formData.modules.map((module) => ({
                ...module,
                videoUrl: (module.videoSource || 'youtube') === 'youtube'
                    ? toEmbeddableYouTubeUrl(module.videoUrl)
                    : module.videoUrl
            }))
        };

        addCourse(normalizedCourse);
        navigate('/educator');
    };

    const handleVideoUpload = (moduleId, file) => {
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            alert('Please upload a valid video file.');
            return;
        }

        if (file.size > 4 * 1024 * 1024) {
            alert('Please upload a video smaller than 4MB for this demo.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            handleModuleChange(moduleId, 'videoUrl', reader.result);
            handleModuleChange(moduleId, 'uploadedVideoName', file.name);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
            <h1 style={{ marginBottom: '1.5rem' }}>Create New Course</h1>
            <Card>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Input
                        label="Course Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Advanced React Patterns"
                    />
                    <Input
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Short summary of the course..."
                    />

                    <div>
                        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                            <h3>Course Modules</h3>
                            <Button type="button" variant="ghost" size="sm" onClick={addModule}>
                                <Plus size={16} /> Add Module
                            </Button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {formData.modules.map((module, index) => (
                                <div key={module.id} style={{
                                    padding: '1rem',
                                    background: 'var(--gray-50)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'flex-start'
                                }}>
                                    <span style={{
                                        width: '24px', height: '24px',
                                        background: 'var(--gray-200)',
                                        borderRadius: '50%', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.75rem', fontWeight: 'bold'
                                    }}>{index + 1}</span>

                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <Input
                                            placeholder="Module Title"
                                            value={module.title}
                                            onChange={(e) => handleModuleChange(module.id, 'title', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Module description"
                                            value={module.content}
                                            onChange={(e) => handleModuleChange(module.id, 'content', e.target.value)}
                                        />

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontSize: '0.875rem', color: 'var(--gray-700)', fontWeight: 500 }}>Video source</label>
                                            <select
                                                value={module.videoSource || 'youtube'}
                                                onChange={(e) => handleModuleChange(module.id, 'videoSource', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    border: '1px solid var(--gray-200)',
                                                    borderRadius: 'var(--radius-md)',
                                                    padding: '0.75rem 1rem',
                                                    fontSize: '0.9rem',
                                                    background: 'white'
                                                }}
                                            >
                                                <option value="youtube">YouTube URL</option>
                                                <option value="upload">Upload video file</option>
                                            </select>
                                        </div>

                                        {module.videoSource === 'upload' ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                <Input
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={(e) => handleVideoUpload(module.id, e.target.files?.[0])}
                                                />
                                                {module.uploadedVideoName && (
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>Selected: {module.uploadedVideoName}</span>
                                                )}
                                            </div>
                                        ) : (
                                            <Input
                                                placeholder="YouTube URL (watch/share/embed all supported)"
                                                value={module.videoUrl || ''}
                                                onChange={(e) => handleModuleChange(module.id, 'videoUrl', e.target.value)}
                                            />
                                        )}
                                    </div>

                                    {formData.modules.length > 1 && (
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeModule(module.id)} style={{ color: 'var(--danger)' }}>
                                            <Trash size={16} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <Button type="button" variant="ghost" onClick={() => navigate('/educator')}>Cancel</Button>
                        <Button type="submit">Publish Course</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
