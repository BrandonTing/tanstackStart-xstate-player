"use client";
import { cn } from "@/lib/utils";
import { playerMachine } from "@/machines/playerMachine";
import { useMachine } from "@xstate/react";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

interface PlayerProps {
  src: string;
}

export function Player({ src }: PlayerProps) {
  const [snapshot, send] = useMachine(playerMachine);
  if (snapshot.context.src !== src) {
    send({ type: "Change Source", src });
  }
  const refCallbacks = useCallback(
    (node: HTMLVideoElement) => {
      if (node) {
        const abortController = new AbortController();
        import("shaka-player").then(({ default: shaka }) => {
          if (abortController.signal.aborted) {
            return;
          }
          shaka.polyfill.installAll();
          const player = new shaka.Player();
          player.attach(node);
          send({ type: "Idle.setPlayer", player: player, media: node });
        });

        return () => {
          send({ type: "Destroy Player" });
          abortController.abort();
        };
      }
    },
    [send],
  );
  const containerRefCallbacks = useCallback(
    (node: HTMLDivElement) => {
      if (node) {
        const abortController = new AbortController();
        node.addEventListener(
          "mouseenter",
          () => {
            send({ type: "Play.Hover" });
          },
          {
            signal: abortController.signal,
          },
        );
        node.addEventListener(
          "mouseleave",
          () => {
            send({ type: "Play.HoverEnd" });
          },
          {
            signal: abortController.signal,
          },
        );
        node.addEventListener(
          "click",
          () => {
            send({ type: "Video.Click" });
          },
          {
            signal: abortController.signal,
          },
        );

        return () => {
          abortController.abort();
        };
      }
    },
    [send],
  );

  const isPlaying = snapshot.matches({
    PlayerLoaded: {
      Loaded: {
        "Controls": "play"
      },
    },
  });

  const togglePlay = useCallback(() => {
    if (
      snapshot.matches({
        PlayerLoaded: {
          Loaded: {
            "Controls": "paused"
          },
        },
      })
    ) {
      send({ type: "Loaded.Play" });
    } else if (
      snapshot.matches({
        PlayerLoaded: {
          Loaded: {
            "Controls": "play"
          },
        },
      })
    ) {
      send({ type: "Loaded.Pause" });
    }
  }, [snapshot, send]);
  const {
    currentTime,
    metadata: { duration },
    volume,
    isMuted,
    animationActionTimestamp
  } = snapshot.context;
  const sliderSeek = useCallback(
    (value: Array<number>) => {
      if (value[0]) {
        send({ type: "Time.seek", time: value[0] });
      }
    },
    [send],
  );
  const sliderVolumeSet = useCallback(
    (value: Array<number>) => {
      if (value[0]) {
        send({ type: "Volume.Set", volume: value[0] });
      }
    },
    [send],
  );
  return (
    <div className="relative text-black" ref={containerRefCallbacks} tabIndex={-1} onKeyDown={(e) => {
      switch (e.key) {
        case "ArrowLeft": {
          send({
            type: "Time.skipBackward.keyboard",
          });

          break;
        }
        case "ArrowRight": {
          send({
            type: "Time.skipForward.keyboard",
          });

          break;
        }
        default: {
          // Stop processing unknown events.
          return;
        }
      }

      e.preventDefault();
    }}>
      <video
        ref={refCallbacks}
        className="w-full"
        poster="/resources/big_buck_bunny.jpg"
        onTimeUpdate={(e) => {
          send({
            type: "Time.update",
            currentTime: (e.target as HTMLVideoElement).currentTime,
          });
        }}
        muted={isMuted}
      />
      {snapshot.hasTag("Show Control") ? (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          <div className="flex items-center justify-between mb-2">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={sliderSeek}
              className="w-full cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                className="bg-white"
                size="icon"
                variant="ghost"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </Button>
              <Button
                className="bg-white"
                size="icon"
                variant="ghost"
                onClick={() => {
                  send({ type: "Time.skipBackward" });
                }}
                aria-label="Rewind 10 seconds"
              >
                <SkipBack className="w-6 h-6" />
              </Button>
              <Button
                className="bg-white"
                size="icon"
                variant="ghost"
                onClick={() => {
                  send({ type: "Time.skipForward" });
                }}
                aria-label="Fast forward 10 seconds"
              >
                <SkipForward className="w-6 h-6" />
              </Button>
              <span className="text-sm text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                className="bg-white"
                size="icon"
                variant="ghost"
                onClick={() => {
                  send({ type: "Volume.Toggle" });
                }}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </Button>
              <Slider
                value={[volume]}
                max={1}
                step={0.1}
                onValueChange={sliderVolumeSet}
                className="w-24 cursor-pointer"
              />
            </div>
          </div>
        </div>
      ) : null}
      {snapshot.hasTag("Animate action") ? (
        <div className="absolute inset-0">
          <div key={animationActionTimestamp} onAnimationEnd={() => {
            send({
              type: "play-state-animation.end",
            });
          }}
            className={cn("flex items-center  h-full px-16 [&>*]:animate-ping [&>*]:repeat-1", snapshot.hasTag("Animate backward") ? "justify-start" : snapshot.hasTag("Animate forward") ? "justify-end" : "justify-center")}>
            {snapshot.hasTag("Animate playing state") ? <Play className="w-16 h-16 text-white " />
              : snapshot.hasTag("Animate paused state") ? <Pause className="w-16 h-16 text-white " />
                : snapshot.hasTag("Animate backward") ? <SkipBack className="w-16 h-16 text-white " />
                  : snapshot.hasTag("Animate forward") ? <SkipForward className="w-16 h-16 text-white " /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function formatTime(time: number) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
