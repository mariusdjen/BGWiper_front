export const API_CONFIG = {
	BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
	ENDPOINTS: {
		REMOVE_BG: "/api/remove-bg",
	},
} as const;

export const getApiUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS) => {
	return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[endpoint]}`;
};
