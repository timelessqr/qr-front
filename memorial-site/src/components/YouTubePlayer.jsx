import React, { useRef, useEffect, useState } from 'react';

const YouTubePlayer = ({ videoId, onStateChange, autoplay = false, controls = false, width = 400, height = 300 }) => {
  const playerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Cargar la API de YouTube solo si no está cargada
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // Callback global para cuando la API esté lista
      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else if (window.YT.loaded) {
      initializePlayer();
    }

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [videoId]);

  const initializePlayer = () => {
    if (playerRef.current && videoId) {
      const newPlayer = new window.YT.Player(playerRef.current, {
        height,
        width,
        videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: controls ? 1 : 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            setIsReady(true);
            if (onStateChange) {
              onStateChange('ready', event);
            }
          },
          onStateChange: (event) => {
            const states = {
              [-1]: 'unstarted',
              [0]: 'ended',
              [1]: 'playing',
              [2]: 'paused',
              [3]: 'buffering',
              [5]: 'cued'
            };
            const stateName = states[event.data] || 'unknown';
            
            if (onStateChange) {
              onStateChange(stateName, event);
            }
          },
          onError: (event) => {
            console.error('YouTube Player Error:', event.data);
            if (onStateChange) {
              onStateChange('error', event);
            }
          }
        }
      });

      setPlayer(newPlayer);
    }
  };

  // Métodos públicos para controlar el reproductor
  const play = () => {
    if (player && isReady) {
      player.playVideo();
    }
  };

  const pause = () => {
    if (player && isReady) {
      player.pauseVideo();
    }
  };

  const stop = () => {
    if (player && isReady) {
      player.stopVideo();
    }
  };

  const seekTo = (seconds) => {
    if (player && isReady) {
      player.seekTo(seconds, true);
    }
  };

  const getCurrentTime = () => {
    if (player && isReady) {
      return player.getCurrentTime();
    }
    return 0;
  };

  const getDuration = () => {
    if (player && isReady) {
      return player.getDuration();
    }
    return 0;
  };

  const getPlayerState = () => {
    if (player && isReady) {
      return player.getPlayerState();
    }
    return -1;
  };

  // Exponer métodos a través de ref si se necesita
  React.useImperativeHandle(playerRef, () => ({
    play,
    pause,
    stop,
    seekTo,
    getCurrentTime,
    getDuration,
    getPlayerState,
    player
  }));

  return (
    <div className="youtube-player-container">
      <div 
        ref={playerRef}
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          background: '#000'
        }}
      />
      {!isReady && (
        <div 
          className="flex items-center justify-center bg-gray-900 text-white"
          style={{ 
            width: `${width}px`, 
            height: `${height}px`,
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;
