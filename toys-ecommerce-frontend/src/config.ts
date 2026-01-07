// ✨ Toggle this boolean to switch environments
const isProduction = false; 

const config = {
    // API Base URL
    BASE_URL: isProduction 
        ? "https://api.yourtoyhub.com" // Your live production URL
        : "http://localhost:8080",      // Your local Java backend

    // Assets prefix (if hosting images elsewhere)
    IMAGE_URL: isProduction
        ? "https://assets.yourtoyhub.com"
        : "http://localhost:8080",
        
    // Site metadata
    APP_NAME: "Toy Boss",
    VERSION: "1.0.4"
};

export default config;