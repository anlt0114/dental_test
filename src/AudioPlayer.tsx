import React, { useState, useRef, useEffect, useCallback } from "react";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";

interface TimeSliderProps {
  maxStep: number;
  onCurrentTime?: (time: number) => void;
}

// Constants
const STEP_INTERVAL = 1; // Interval between tick marks on slider
const MARK_INTERVAL = 5; // Interval between labeled tick marks
const MS_PER_STEP = 200; // Milliseconds per step (lower = faster animation)
const SLIDE_STEP = 0.1;
const TimeSlider: React.FC<TimeSliderProps> = ({ maxStep, onCurrentTime }) => {
  // Ensure maxStep is valid and has a minimum value of 1
  const effectiveMaxStep = Math.max(maxStep || 1, 1);

  // State management
  const [duration, setDuration] = useState(effectiveMaxStep);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs for animation
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Update duration if maxStep changes
  useEffect(() => {
    setDuration(Math.max(maxStep || 1, 1));
    setCurrentTime(0);
  }, [maxStep]);
  // // Inside the TimeSlider component
  // useEffect(() => {
  //   // Call the callback whenever currentTime changes
  //   if (onCurrentTime) {
  //     onCurrentTime(currentTime);
  //   }
  // }, [currentTime, onCurrentTime]);

  // Animation handler for smooth time tracking
  const animate = useCallback(
    (time: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = time;
        previousTimeRef.current = currentTime;
      }
      // Calculate elapsed time based on MS_PER_STEP
      const elapsedMs = time - startTimeRef.current;
      const stepsToAdvance = elapsedMs / MS_PER_STEP;
      const newTime = previousTimeRef.current + stepsToAdvance * SLIDE_STEP;

      if (newTime >= duration) {
        setCurrentTime(0);
        setIsPlaying(false);
        startTimeRef.current = 0;
        previousTimeRef.current = 0;
        return;
      }

      setCurrentTime(newTime);
      requestRef.current = requestAnimationFrame(animate);
    },
    [currentTime, duration]
  );

  // Handle animation frame requests based on play/pause state
  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = 0;
      previousTimeRef.current = currentTime;
      requestRef.current = requestAnimationFrame(animate);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = 0;
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate, currentTime, isPlaying]);

  // Event handlers
  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
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

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    const newTime = newValue as number;
    setCurrentTime(newTime);
    previousTimeRef.current = newTime;
    startTimeRef.current = 0;

    if (isPlaying) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  // Generate marks for the slider with specified interval
  const generateMarks = () => {
    const result = [{ value: 0, label: "0" }];
    // Add marks at regular intervals
    for (let i = STEP_INTERVAL; i <= duration; i += STEP_INTERVAL) {
      result.push({
        value: i,
        label:
          i % MARK_INTERVAL === 0
            ? i.toString()
            : i === duration
            ? i.toString()
            : "",
      });
    }
    // Always add the max value if it's not already included
    if (duration % STEP_INTERVAL !== 0) {
      result.push({ value: duration, label: duration.toString() });
    }

    return result;
  };

  const marks = generateMarks();

  return (
    <Box className="flex flex-col w-full max-w-md bg-gray-100 rounded-lg p-4 shadow-md">
      <Box className="w-full mb-4">
        <Box className="flex justify-between text-xs text-gray-600 mb-1">
          <span className="font-medium">U</span>
          <Box className="flex-1 mx-2 flex justify-between">
            <h1 className="text-lg">{maxStep}</h1>
          </Box>
        </Box>

        {/* Material UI Slider */}
        <Box sx={{ width: "100%", padding: "10px 0" }}>
          <Slider
            value={currentTime}
            onChange={handleSliderChange}
            min={0}
            max={duration}
            step={SLIDE_STEP}
            marks={marks}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => value.toFixed(1)}
            sx={{
              color: "#3b82f6", // blue-500
              "& .MuiSlider-thumb": {
                width: 20,
                height: 20,
                backgroundColor: "#fff",
                border: "2px solid #3b82f6",
                "&:focus, &:hover, &.Mui-active": {
                  boxShadow: "0 0 0 8px rgba(59, 130, 246, 0.16)",
                },
              },
              "& .MuiSlider-rail": {
                backgroundColor: "#bfdbfe", // blue-200
                height: 8,
              },
              "& .MuiSlider-track": {
                height: 8,
              },
            }}
          />
        </Box>

        <Box className="flex justify-between text-xs text-gray-600 mt-1">
          <span className="font-medium">L</span>
          <Box className="flex-1 mx-2">
            <span className="text-red-500 ml-1">1</span>
          </Box>
        </Box>
      </Box>

      {/* Control buttons */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 2,
        }}
      >
        <IconButton
          onClick={skipBackward}
          aria-label="Skip backward"
          sx={{
            backgroundColor: "#e5e7eb", // gray-200
            "&:hover": { backgroundColor: "#d1d5db" }, // gray-300
            padding: "8px",
          }}
        >
          <SkipPreviousIcon />
        </IconButton>

        <IconButton
          onClick={togglePlayPause}
          aria-label={isPlaying ? "Pause" : "Play"}
          sx={{
            backgroundColor: "#e5e7eb", // gray-200
            "&:hover": { backgroundColor: "#d1d5db" }, // gray-300
            padding: "8px",
          }}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <IconButton
          onClick={skipForward}
          aria-label="Skip forward"
          sx={{
            backgroundColor: "#e5e7eb", // gray-200
            "&:hover": { backgroundColor: "#d1d5db" }, // gray-300
            padding: "8px",
          }}
        >
          <SkipNextIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default TimeSlider;
