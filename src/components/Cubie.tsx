import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';

interface CubieProps {
  initialPosition: [number, number, number];
  currentPosition: [number, number, number];
  quaternion: THREE.Quaternion;
  onPointerDown: (event: any) => void;
}

const Cubie: React.FC<CubieProps> = ({ 
  initialPosition, 
  currentPosition, 
  quaternion,
  onPointerDown
}) => {
  const [ix, iy, iz] = initialPosition;

  // 1. 颜色配置 (严格对应你的要求)
  const colors = {
    right: '#FF5800',  // 橙色 (+x)
    left: '#C41E3A',   // 红色 (-x)
    up: '#FFFFFF',     // 白色 (+y)
    down: '#FFD500',   // 黄色 (-y)
    front: '#0051BA',  // 蓝色 (+z)
    back: '#009E60',   // 绿色 (-z)
    base: '#080808'    // 纯黑底座
  };

  // 2. 物理反光材质
  const getMaterial = (color: string) => (
    <meshPhysicalMaterial 
      color={color}
      roughness={0.05}
      clearcoat={1.0}
      clearcoatRoughness={0.1}
      reflectivity={0.8}
    />
  );

  return (
    <group position={currentPosition} quaternion={quaternion}>
      {/* 核心底座：稍微圆润一点的黑块 */}
      <RoundedBox 
        args={[0.98, 0.98, 0.98]} 
        radius={0.12} 
        smoothness={8}
        onPointerDown={onPointerDown}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={colors.base} roughness={0.3} />
      </RoundedBox>

      {/* 独立颜色面：通过分块渲染确保颜色 100% 准确且平整 */}
      
      {/* 右面 (+x) - 橙色 */}
      {ix === 1 && (
        <mesh position={[0.491, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.75, 0.75]} />
          {getMaterial(colors.right)}
        </mesh>
      )}

      {/* 左面 (-x) - 红色 */}
      {ix === -1 && (
        <mesh position={[-0.491, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.75, 0.75]} />
          {getMaterial(colors.left)}
        </mesh>
      )}

      {/* 上面 (+y) - 白色 */}
      {iy === 1 && (
        <mesh position={[0, 0.491, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.75, 0.75]} />
          {getMaterial(colors.up)}
        </mesh>
      )}

      {/* 下面 (-y) - 黄色 */}
      {iy === -1 && (
        <mesh position={[0, -0.491, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.75, 0.75]} />
          {getMaterial(colors.down)}
        </mesh>
      )}

      {/* 前面 (+z) - 蓝色 */}
      {iz === 1 && (
        <mesh position={[0, 0, 0.491]}>
          <planeGeometry args={[0.75, 0.75]} />
          {getMaterial(colors.front)}
        </mesh>
      )}

      {/* 后面 (-z) - 绿色 */}
      {iz === -1 && (
        <mesh position={[0, 0, -0.491]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.75, 0.75]} />
          {getMaterial(colors.back)}
        </mesh>
      )}
    </group>
  );
};

export default Cubie;
