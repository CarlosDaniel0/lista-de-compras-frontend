import { useEffect, useState } from "react"

export const useElementDimensions = (container: React.RefObject<HTMLElement>) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!container.current) return; 
    const resizeObserver = new ResizeObserver(() => {
      if (container.current) {
        const { current } = container
        const boundingRect = current.getBoundingClientRect()
        const { width, height } = boundingRect
        setDimensions({ width: Math.round(width), height: Math.round(height) })
      }
    });
    resizeObserver.observe(container.current!);
    return () => resizeObserver.disconnect(); 
  }, [container])

  return dimensions 
}