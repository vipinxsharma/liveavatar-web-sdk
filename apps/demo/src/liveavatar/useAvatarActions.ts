import { useCallback } from "react";
import { useLiveAvatarContext } from "./context";

export const useAvatarActions = (mode: "FULL" | "LITE") => {
  const { sessionRef } = useLiveAvatarContext();

  const hasAvatarSession = useCallback(() => {
    return !!sessionRef.current;
  }, [sessionRef]);

  const interrupt = useCallback(() => {
    if (!sessionRef.current) {
      console.warn("Cannot interrupt: session not initialized");
      return;
    }
    return sessionRef.current.interrupt();
  }, [sessionRef]);

  const repeat = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) {
        console.warn("Cannot repeat empty message");
        return;
      }

      if (!sessionRef.current) {
        throw new Error("Session not initialized");
      }

      if (mode === "FULL") {
        return sessionRef.current.repeat(trimmed);
      } else if (mode === "LITE") {
        const res = await fetch("/api/elevenlabs-text-to-speech", {
          method: "POST",
          body: JSON.stringify({ text: trimmed }),
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to generate speech");
        }

        const { audio } = await res.json();
        return sessionRef.current.repeatAudio(audio);
      }
    },
    [sessionRef, mode],
  );

  const startListening = useCallback(() => {
    if (!sessionRef.current) {
      console.warn("Cannot start listening: session not initialized");
      return;
    }
    return sessionRef.current.startListening();
  }, [sessionRef]);

  const stopListening = useCallback(() => {
    if (!sessionRef.current) {
      console.warn("Cannot stop listening: session not initialized");
      return;
    }
    return sessionRef.current.stopListening();
  }, [sessionRef]);

  return {
    interrupt,
    repeat,
    startListening,
    stopListening,
    hasAvatarSession,
  };
};
