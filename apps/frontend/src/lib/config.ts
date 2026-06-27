const getBackendUrl = () => {
    try {
        if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_BACKEND_URL) {
            return import.meta.env.VITE_BACKEND_URL;
        }
    } catch (e) {}

    try {
        if (typeof process !== "undefined" && process.env && process.env.VITE_BACKEND_URL) {
            return process.env.VITE_BACKEND_URL;
        }
    } catch (e) {}

    return "http://localhost:3001";
};

export const BACKEND_URL = getBackendUrl();