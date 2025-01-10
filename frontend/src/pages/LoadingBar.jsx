import React, { useState, useEffect } from "react";

const LoadingBar = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 1;
            });
        }, 30);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-backdrop">
            <p className="text-lg font-medium text-textPrimary">Loading Spotify data...</p>
            <div className="w-64 h-5 bg-primary2 rounded-full mt-4">
                <div
                    className="h-full bg-primary animate-pulse rounded-full transition-all duration-100 opacity-100"
                    style={{ width: `${progress}%`,
                    boxShadow: "0px 8px 10px rgba(0, 0, 0, 0.3)",
                    background: "repeating-linear-gradient(135deg, #5cc6bb, #5cc6bb 10px, #48a99e 10px, #48a99e 25px)",
                    animation: "stripes 4s linear infinite",
                    backgroundSize: "200% 100%",
                }}
                ></div>
            </div>
            <div className="text-textSecondary text-sm mt-2">{progress}%</div>
        </div>
    );
};

export default LoadingBar;
