const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

const parseTimeToSeconds = (value) => {
    if (!value) {
        return null;
    }

    if (/^\d+$/.test(value)) {
        return Number(value);
    }

    const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
    if (!match) {
        return null;
    }

    const hours = Number(match[1] || 0);
    const minutes = Number(match[2] || 0);
    const seconds = Number(match[3] || 0);
    return (hours * 3600) + (minutes * 60) + seconds;
};

const getYouTubeIdFromPath = (pathname) => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
        return '';
    }

    const [first, second] = segments;
    if (first === 'embed' || first === 'shorts' || first === 'live' || first === 'v') {
        return second || '';
    }

    return '';
};

export const toEmbeddableYouTubeUrl = (rawUrl) => {
    const value = (rawUrl || '').trim();
    if (!value) {
        return '';
    }

    if (YOUTUBE_ID_REGEX.test(value)) {
        return `https://www.youtube.com/embed/${value}`;
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(value);
    } catch {
        return value;
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    let videoId = '';

    if (hostname === 'youtu.be') {
        videoId = parsedUrl.pathname.replace('/', '').split('/')[0];
    } else if (hostname.includes('youtube.com') || hostname.includes('youtube-nocookie.com')) {
        if (parsedUrl.pathname === '/watch') {
            videoId = parsedUrl.searchParams.get('v') || '';
        } else {
            videoId = getYouTubeIdFromPath(parsedUrl.pathname);
        }
    }

    if (!YOUTUBE_ID_REGEX.test(videoId)) {
        return value;
    }

    const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);

    const list = parsedUrl.searchParams.get('list');
    if (list) {
        embedUrl.searchParams.set('list', list);
    }

    const startFromT = parseTimeToSeconds(parsedUrl.searchParams.get('t'));
    const startFromStart = parseTimeToSeconds(parsedUrl.searchParams.get('start'));
    const start = startFromStart ?? startFromT;

    if (typeof start === 'number' && !Number.isNaN(start) && start > 0) {
        embedUrl.searchParams.set('start', String(start));
    }

    return embedUrl.toString();
};
