import { useCallback } from 'react';
import * as THREE from 'three';
import { useCubeStore } from '../store/cubeStore';

export const useRubiksInteraction = () => {
  const rotateLayer = useCubeStore((state) => state.rotateLayer);
  const isAnimating = useCubeStore((state) => state.isAnimating);

  // 处理点击 (左键/右键) -> 控制“行”旋转
  const handleCubieClick = useCallback((event: any) => {
    if (isAnimating) return;
    
    // 阻止事件冒泡到 OrbitControls
    event.stopPropagation();
    
    const { face, object, button } = event;
    if (!face) return;

    // 获取点击点的法向量，判定当前点击的是哪个面
    const normal = face.normal.clone().applyQuaternion(object.quaternion);
    const cubiePos = event.object.parent.position;

    // 确定“行”旋转轴
    // 如果点击的是侧面，行旋转轴通常是 Y 轴
    // 如果点击的是顶面/底面，行旋转轴定义为 X 轴
    let axis: 'x' | 'y' | 'z' = 'y';
    if (Math.abs(normal.y) > 0.5) {
      axis = 'x'; 
    }

    const layerIndex = Math.round(cubiePos[axis]);
    
    // 左键 (0) -> 向左转；右键 (2) -> 向右转
    // 注意：这里的 clockwise 判定需要结合轴向
    const clockwise = button === 0; 
    
    rotateLayer(axis, layerIndex, clockwise);
  }, [isAnimating, rotateLayer]);

  // 处理滚轮 -> 控制“列”旋转
  const handleCubieWheel = useCallback((event: any) => {
    if (isAnimating) return;
    
    event.stopPropagation();
    
    const { face, object, deltaY } = event;
    if (!face) return;

    const normal = face.normal.clone().applyQuaternion(object.quaternion);
    const cubiePos = event.object.parent.position;

    // 确定“列”旋转轴
    // 如果点击侧面，列旋转轴通常是 X 或 Z
    // 如果点击顶面，列旋转轴定义为 Z
    let axis: 'x' | 'y' | 'z' = 'x';
    if (Math.abs(normal.x) > 0.5) {
      axis = 'z';
    } else if (Math.abs(normal.z) > 0.5) {
      axis = 'x';
    } else {
      axis = 'z';
    }

    const layerIndex = Math.round(cubiePos[axis]);
    
    // 向上滚动 (deltaY < 0) -> 向上转；向下滚动 (deltaY > 0) -> 向下转
    const clockwise = deltaY < 0;

    rotateLayer(axis, layerIndex, clockwise);
  }, [isAnimating, rotateLayer]);

  return { handleCubieClick, handleCubieWheel };
};
