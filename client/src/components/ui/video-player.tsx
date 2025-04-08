import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface VideoPlayerProps {
  src: string;
  thumbnail?: string;
  title?: string;
}

export function VideoPlayer({ src, thumbnail, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeout = useRef<number | null>(null);
  
  // Auto-hide controls after inactivity
  useEffect(() => {
    const showControls = () => {
      setIsControlsVisible(true);
      
      if (controlsTimeout.current) {
        window.clearTimeout(controlsTimeout.current);
      }
      
      controlsTimeout.current = window.setTimeout(() => {
        if (isPlaying) {
          setIsControlsVisible(false);
        }
      }, 3000);
    };
    
    const playerElement = playerRef.current;
    
    playerElement?.addEventListener('mousemove', showControls);
    playerElement?.addEventListener('click', showControls);
    
    return () => {
      playerElement?.removeEventListener('mousemove', showControls);
      playerElement?.removeEventListener('click', showControls);
      
      if (controlsTimeout.current) {
        window.clearTimeout(controlsTimeout.current);
      }
    };
  }, [isPlaying]);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };
    
    const onLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, []);
  
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };
  
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    setIsMuted(!isMuted);
    video.muted = !isMuted;
  };
  
  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = value[0];
    setVolume(newVolume);
    video.volume = newVolume;
    
    if (newVolume === 0) {
      setIsMuted(true);
      video.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  };
  
  const handleProgressChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newTime = (value[0] / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(value[0]);
  };
  
  const toggleFullscreen = () => {
    const player = playerRef.current;
    if (!player) return;
    
    if (!isFullscreen) {
      if (player.requestFullscreen) {
        player.requestFullscreen();
      } else if ((player as any).webkitRequestFullscreen) {
        (player as any).webkitRequestFullscreen();
      } else if ((player as any).msRequestFullscreen) {
        (player as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);
  
  // Format time (seconds -> MM:SS)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Skip forward/backward
  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  };
  
  return (
    <div 
      ref={playerRef}
      className="relative bg-black rounded-xl overflow-hidden aspect-video w-full"
    >
      {thumbnail && !isPlaying && (
        <div 
          className="absolute inset-0 bg-cover bg-center z-10" 
          style={{ backgroundImage: `url(${thumbnail})` }}
        />
      )}
      
      <video 
        ref={videoRef}
        src={src}
        className="w-full h-full"
        poster={thumbnail}
        preload="metadata"
        onClick={togglePlay}
      />
      
      {/* Big play button (when paused) */}
      {!isPlaying && (
        <button 
          onClick={togglePlay}
          className="absolute inset-0 w-full h-full flex items-center justify-center z-20"
        >
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="text-white h-8 w-8" />
          </div>
        </button>
      )}
      
      {/* Controls overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 py-2 transition-opacity duration-300 z-30 ${
          (isControlsVisible || !isPlaying) ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Title */}
        {title && (
          <div className="text-white text-sm mb-2">{title}</div>
        )}
        
        {/* Progress bar */}
        <div className="mb-2">
          <Slider
            value={[progress]}
            min={0}
            max={100}
            step={0.1}
            onValueChange={handleProgressChange}
            className="cursor-pointer"
          />
        </div>
        
        {/* Control buttons and time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button onClick={togglePlay}>
              {isPlaying ? (
                <Pause className="text-white h-6 w-6" />
              ) : (
                <Play className="text-white h-6 w-6" />
              )}
            </button>
            
            <button onClick={() => skip(-10)}>
              <SkipBack className="text-white h-5 w-5" />
            </button>
            
            <button onClick={() => skip(10)}>
              <SkipForward className="text-white h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <button onClick={toggleMute}>
                {isMuted ? (
                  <VolumeX className="text-white h-5 w-5" />
                ) : (
                  <Volume2 className="text-white h-5 w-5" />
                )}
              </button>
              
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>
            
            <div className="text-white text-xs">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          <button onClick={toggleFullscreen}>
            <Maximize className="text-white h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
