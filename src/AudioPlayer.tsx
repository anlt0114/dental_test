import React, { useState, useRef, useEffect } from "react";

interface AudioPlayerProps {
  totalStep: number;
}

const AudioPlayer = ({ totalStep }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(totalStep);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const requestRef = useRef(0);
  const previousTimeRef = useRef(0);
  const startTimeRef = useRef(0);

  const animate = (time: any) => {
    if (!startTimeRef.current) {
      startTimeRef.current = time;
      previousTimeRef.current = currentTime;
    }

    const elapsed = (time - startTimeRef.current) / 1000;
    const newTime = previousTimeRef.current + elapsed;

    if (newTime >= duration) {
      setCurrentTime(0);
      setIsPlaying(false);
      startTimeRef.current = 0;
      previousTimeRef.current = 0;
      return;
    }

    setCurrentTime(newTime);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = 0;
      previousTimeRef.current = currentTime;
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = 0;
      }
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying]);

  // useEffect(() => {
  //   const audio = audioRef.current as any;
  //   if (!audio) return;

  //   const setAudioData = () => {
  //     setDuration(audio.duration || totalStep)
  //     setIsLoaded(true);
  //   };

  //   audio.addEventListener("loadeddata", setAudioData);

  //   return () => {
  //     audio.removeEventListener("loadeddata", setAudioData);
  //   };
  // }, []);

  useEffect(() => {
    const audio = audioRef.current as any;
    if (!audio || !isLoaded) return;

    if (audio.readyState >= 1 && currentTime <= duration) {
      audio.currentTime = currentTime;
    }
  }, [currentTime, duration, isLoaded]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const skipBackward = () => {
    setCurrentTime((prev) => {
      const newTime = Math.max(prev - 1, 0);
      previousTimeRef.current = newTime;
      startTimeRef.current = 0;
      return newTime;
    });
  };

  const skipForward = () => {
    setCurrentTime((prev) => {
      const newTime = Math.min(prev + 1, duration);
      previousTimeRef.current = newTime;
      startTimeRef.current = 0;
      return newTime;
    });
  };

  const handleProgressChange = (e: any) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    previousTimeRef.current = newTime;
    startTimeRef.current = 0;

    if (isPlaying) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  const renderTickMarks = () => {
    const tickMarks = [];
    for (let i = 0; i <= duration; i++) {
      const isMajorTick =
        i === 0 || i === 5 || i === 10 || i === 15 || i === 17;
      tickMarks.push(
        <div
          key={i}
          className={`absolute h-full w-px ${
            isMajorTick ? "bg-gray-400" : "bg-gray-300"
          }`}
          style={{ left: `${(i / duration) * 100}%` }}
        />
      );
    }
    return tickMarks;
  };

  return (
    <div className="flex flex-col w-full max-w-md bg-gray-100 rounded-lg p-4 shadow-md">
      <audio ref={audioRef} src="/example-audio.mp3" preload="metadata" />

      <div className="w-full mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span className="font-medium">U</span>
          <div className="flex-1 mx-2 flex justify-between">
            {/* <span>0</span>
            <span>5</span>
            <span>10</span>
            <span>15</span>
            <span>17</span> */}
            <h1 className="text-lg">{totalStep}</h1>
          </div>
        </div>

        <div className="relative w-full h-8">
          <div className="absolute inset-0 bg-blue-200 rounded-md"></div>

          <div className="absolute inset-0">{renderTickMarks()}</div>

          <div
            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-blue-600 rounded-full shadow-md cursor-pointer z-20 transition-all duration-300 ease-linear"
            style={{ left: `calc(${(currentTime / duration) * 100}% - 12px)` }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1 py-0.5 rounded">
              {currentTime.toFixed(1)}
            </div>
          </div>

          <input
            ref={progressBarRef}
            type="range"
            className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleProgressChange}
            disabled={!isLoaded}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span className="font-medium">L</span>
          <div className="flex-1 mx-2">
            <span className="text-red-500 ml-1">1</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-start space-x-4">
        <button
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors flex items-center justify-center relative w-8 h-8"
          onClick={skipBackward}
          aria-label="Skip backward"
        >
          <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-700 transform -translate-x-1"></div>
          <div className="absolute left-1/2 top-1/2 transform -translate-y-1/2 h-8 w-px bg-gray-700"></div>
        </button>

        <button
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors flex items-center justify-center w-8 h-8"
          onClick={togglePlayPause}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-gray-700"></div>
              <div className="w-1 h-4 bg-gray-700"></div>
            </div>
          ) : (
            <div className="w-0 h-0 border-t-5 border-b-5 border-l-8 border-transparent border-l-gray-700 ml-0.5"></div>
          )}
        </button>

        <button
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors flex items-center justify-center relative w-8 h-8"
          onClick={skipForward}
          aria-label="Skip forward"
        >
          <div className="w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-700 transform translate-x-1"></div>
          <div className="absolute left-1/2 top-1/2 transform -translate-y-1/2 h-8 w-px bg-gray-700"></div>
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
