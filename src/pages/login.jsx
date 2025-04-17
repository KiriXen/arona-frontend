import React from 'react';

function LoginButton() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 p-4">
      <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-8 bg-gray-800/80 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl text-center backdrop-blur-lg border border-gray-700/50 transform transition-all duration-500 hover:shadow-indigo-500/30">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">Arona Dashboard</h1>
          <p className="text-gray-300 text-base sm:text-lg">Manage Arona with ease</p>
        </div>
        
        <div className="relative mb-6 sm:mb-8 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
        
        <div className="mb-6">
          <p className="text-gray-400 mb-4 text-sm sm:text-base">Connect your Discord account to get started</p>
          <a
            href={`${process.env.REACT_APP_API_URL}/auth/discord`}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-indigo-600 text-white font-semibold rounded-lg sm:rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 flex items-center justify-center space-x-2 sm:space-x-3 group text-sm sm:text-base"
          >
            <svg 
              className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-pulse" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 127.14 96.36"
              fill="currentColor"
            >
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
            </svg>
            <span>Login with Discord</span>
          </a>
        </div>
        
        <div className="text-gray-500 text-xs sm:text-sm">
          <p>By logging in, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
}

export default LoginButton;