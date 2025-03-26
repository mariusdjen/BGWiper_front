export const API_CONFIG = {
	BASE_URL:
		import.meta.env.VITE_API_BASE_URL || "https://bgwiper.dommacademy.com",
	ENDPOINTS: {
		REMOVE_BG: "/remove-bg",
	},
} as const;

export const getApiUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS) => {
	return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[endpoint]}`;
};
