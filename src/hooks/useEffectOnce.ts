/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";

export default function useEffectOnce(fn: () => void, props: React.DependencyList, time = 300) {
  const mutex = useRef(0)
  const deps = props.length ? props : []
  useEffect(() => {
    if (mutex.current) return
    mutex.current = 1
    fn()
    setTimeout(() => mutex.current = 0, time)
  }, deps)
}