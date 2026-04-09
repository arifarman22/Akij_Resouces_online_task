import { useState, useEffect, useCallback } from "react";

export function useProctoring(enabled: boolean) {
  const [tabSwitches, setTabSwitches] = useState(0);
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warning, setWarning] = useState("");

  const showWarning = useCallback((msg: string) => {
    setWarning(msg);
    setTimeout(() => setWarning(""), 4000);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitches((p) => p + 1);
        showWarning("Warning: Tab switch detected! This incident has been recorded.");
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [enabled, showWarning]);

  useEffect(() => {
    if (!enabled) return;
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        setFullscreenExits((p) => p + 1);
        showWarning("Warning: Exited Fullscreen! This incident has been recorded.");
      } else {
        setIsFullscreen(true);
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, [enabled, showWarning]);

  const enterFullscreen = useCallback(async (element: HTMLElement) => {
    try {
      await element.requestFullscreen();
      setIsFullscreen(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
  }, []);

  return { tabSwitches, fullscreenExits, isFullscreen, warning, enterFullscreen, exitFullscreen };
}
