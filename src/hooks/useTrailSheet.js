import { useRef, useState } from 'react';

export function useTrailSheet() {
  const [sheetState, setSheetState] = useState('compact');
  const pointerStart = useRef(null);
  const dragged = useRef(false);

  function startSheetGesture(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerStart.current = { id: event.pointerId, y: event.clientY };
    dragged.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function endSheetGesture(event) {
    if (pointerStart.current?.id !== event.pointerId) return;
    const delta = event.clientY - pointerStart.current.y;
    pointerStart.current = null;
    if (Math.abs(delta) < 25) return;
    dragged.current = true;
    setSheetState((state) => {
      if (delta > 0) return state === 'expanded' ? 'compact' : 'minimized';
      return state === 'minimized' ? 'compact' : 'expanded';
    });
  }

  function cancelSheetGesture() {
    pointerStart.current = null;
    dragged.current = true;
  }

  function handleSheetClick(event) {
    if (dragged.current && event.detail !== 0) {
      dragged.current = false;
      return;
    }
    dragged.current = false;
    setSheetState((state) => (state === 'compact' ? 'minimized' : 'compact'));
  }

  return {
    sheetState,
    startSheetGesture,
    endSheetGesture,
    cancelSheetGesture,
    handleSheetClick,
    showCurrent: () => setSheetState('compact'),
    showList: () => setSheetState('expanded'),
    toggleList: () => setSheetState((state) => (state === 'expanded' ? 'compact' : 'expanded')),
  };
}
