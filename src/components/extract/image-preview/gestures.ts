export interface TransformState {
  x: number;
  y: number;
  scale: number;
}

export function zoomPan(
  node: HTMLElement,
  {
    transform,
    onTransform,
  }: {
    transform: TransformState;
    onTransform: (t: TransformState) => void;
  }
) {
  let activePointers: Map<number, PointerEvent> = new Map();
  let initialDistance = 0;
  let initialScale = 1;
  
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;

  // Track transform locally to avoid slight delays
  let currentTransform = { ...transform };

  function updateTransform(newTransform: TransformState) {
    currentTransform = { ...newTransform };
    onTransform(currentTransform);
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    
    let newScale = currentTransform.scale * Math.exp(delta);
    // Limit scale between 0.1 and 50
    newScale = Math.max(0.1, Math.min(newScale, 50));
    
    // Zoom around cursor
    const rect = node.getBoundingClientRect();
    const pointerX = e.clientX - rect.left - rect.width / 2;
    const pointerY = e.clientY - rect.top - rect.height / 2;
    
    const scaleRatio = newScale / currentTransform.scale;
    const newX = pointerX - (pointerX - currentTransform.x) * scaleRatio;
    const newY = pointerY - (pointerY - currentTransform.y) * scaleRatio;

    updateTransform({ x: newX, y: newY, scale: newScale });
  }

  function handlePointerDown(e: PointerEvent) {
    activePointers.set(e.pointerId, e);
    
    if (activePointers.size === 1) {
      if (currentTransform.scale > 1.0) {
        isDragging = true;
        node.setPointerCapture(e.pointerId);
        lastX = e.clientX;
        lastY = e.clientY;
      }
    } else if (activePointers.size === 2) {
      isDragging = false;
      const pointers = Array.from(activePointers.values());
      initialDistance = Math.hypot(
        pointers[0].clientX - pointers[1].clientX,
        pointers[0].clientY - pointers[1].clientY
      );
      initialScale = currentTransform.scale;
    }
  }

  function handlePointerMove(e: PointerEvent) {
    if (!activePointers.has(e.pointerId)) return;
    activePointers.set(e.pointerId, e);

    if (activePointers.size === 1 && isDragging) {
      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      
      updateTransform({
        x: currentTransform.x + deltaX,
        y: currentTransform.y + deltaY,
        scale: currentTransform.scale
      });
    } else if (activePointers.size === 2) {
      const pointers = Array.from(activePointers.values());
      const currentDistance = Math.hypot(
        pointers[0].clientX - pointers[1].clientX,
        pointers[0].clientY - pointers[1].clientY
      );
      
      if (initialDistance > 0) {
        let newScale = initialScale * (currentDistance / initialDistance);
        newScale = Math.max(0.1, Math.min(newScale, 50));
        updateTransform({
          ...currentTransform,
          scale: newScale
        });
      }
    }
  }

  function handlePointerUp(e: PointerEvent) {
    activePointers.delete(e.pointerId);
    if (activePointers.size < 2) {
      initialDistance = 0;
    }
    if (activePointers.size === 0) {
      isDragging = false;
      try { node.releasePointerCapture(e.pointerId); } catch(e){}
    }
  }

  node.addEventListener('wheel', handleWheel, { passive: false });
  node.addEventListener('pointerdown', handlePointerDown);
  node.addEventListener('pointermove', handlePointerMove);
  node.addEventListener('pointerup', handlePointerUp);
  node.addEventListener('pointercancel', handlePointerUp);

  return {
    update(newParams: { transform: TransformState }) {
      currentTransform = { ...newParams.transform };
    },
    destroy() {
      node.removeEventListener('wheel', handleWheel);
      node.removeEventListener('pointerdown', handlePointerDown);
      node.removeEventListener('pointermove', handlePointerMove);
      node.removeEventListener('pointerup', handlePointerUp);
      node.removeEventListener('pointercancel', handlePointerUp);
    }
  };
}
