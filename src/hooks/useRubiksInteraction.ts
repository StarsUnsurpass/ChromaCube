import { useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useCubeStore } from '../store/cubeStore';

export const useRubiksInteraction = () => {
  const { camera } = useThree();
  const rotateLayer = useCubeStore((state) => state.rotateLayer);
  const isAnimating = useCubeStore((state) => state.isAnimating);

  const interactionRef = useRef({
    isDragging: false,
    startPoint: new THREE.Vector2(),
    clickedCubiePosition: new THREE.Vector3(),
    faceNormal: new THREE.Vector3(),
  });

  const onPointerDown = useCallback((event: any) => {
    // 重要：只有左键 (button 0) 触发拧层逻辑
    // 其他按键（如右键）透传给 OrbitControls 实现视角旋转
    if (event.button !== 0 || isAnimating) return;
    
    event.stopPropagation();
    
    const { face, object } = event;
    if (!face) return;

    const normal = face.normal.clone();
    normal.applyQuaternion(object.quaternion);

    interactionRef.current = {
      isDragging: true,
      startPoint: new THREE.Vector2(event.clientX, event.clientY),
      clickedCubiePosition: new THREE.Vector3(...event.object.parent.position.toArray()),
      faceNormal: normal,
    };
  }, [isAnimating]);

  const onPointerUp = useCallback((event: MouseEvent) => {
    if (!interactionRef.current.isDragging) return;
    interactionRef.current.isDragging = false;

    const endPoint = new THREE.Vector2(event.clientX, event.clientY);
    const delta = endPoint.clone().sub(interactionRef.current.startPoint);

    if (delta.length() < 20) return;

    const { faceNormal, clickedCubiePosition } = interactionRef.current;

    const cameraRight = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const cameraUp = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);

    const worldDragVector = new THREE.Vector3()
      .addScaledVector(cameraRight, delta.x)
      .addScaledVector(cameraUp, -delta.y)
      .normalize();

    const axisVector = new THREE.Vector3().crossVectors(faceNormal, worldDragVector);

    const absX = Math.abs(axisVector.x);
    const absY = Math.abs(axisVector.y);
    const absZ = Math.abs(axisVector.z);

    let axis: 'x' | 'y' | 'z' = 'x';
    let max = absX;

    if (absY > max) {
      axis = 'y';
      max = absY;
    }
    if (absZ > max) {
      axis = 'z';
      max = absZ;
    }

    const layerIndex = Math.round(clickedCubiePosition[axis]);
    // 修正：反转方向判定，使拖拽感更符合直觉
    const direction = axisVector[axis] < 0;

    rotateLayer(axis, layerIndex, direction);
  }, [camera, rotateLayer]);

  return { onPointerDown, onPointerUp };
};
