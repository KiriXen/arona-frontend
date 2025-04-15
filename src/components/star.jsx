import React from 'react';

function Stars() {
  const generateStars = (count, sizeRange) => {
    return Array.from({ length: count }, () => ({
      left: `${Math.random() * 100}vw`,
      top: `${Math.random() * -10}vh`,
      size: `${sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0])}px`,
      duration: `${5 + Math.random() * 10}s`,
      delay: `${Math.random() * 5}s`
    }));
  };

  const smallStars = generateStars(60, [5, 5]);
  const mediumStars = generateStars(50, [5, 5]);
  const largeStars = generateStars(20, [10, 10]);
  const allStars = [...smallStars, ...mediumStars, ...largeStars];

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: -1
      }}
    >
      <style>{`
        @keyframes twinkle-fall {
          0% {
            transform: translateY(-10vh) scale(0.5);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(100vh) scale(0.3);
            opacity: 0;
          }
        }
      `}</style>

      {allStars.map((star, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            width: star.size,
            height: star.size,
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
            opacity: 0,
            left: star.left,
            top: star.top,
            animation: `twinkle-fall ${star.duration} linear infinite`,
            animationDelay: star.delay
          }}
        />
      ))}
    </div>
  );
}

export default Stars;