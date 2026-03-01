import React, { useMemo } from 'react';
import { useSpring, animated } from '@react-spring/three';
import { useCubeStore } from '../store/cubeStore';
import Cubie from './Cubie';
import { useRubiksInteraction } from '../hooks/useRubiksInteraction';

const RubiksCube: React.FC = () => {
  const { cubies, isAnimating, activeRotation, completeRotation } = useCubeStore();
  const { handleCubieClick, handleCubieWheel } = useRubiksInteraction();

  // Split cubies into active (rotating) and static
  const { activeCubies, staticCubies } = useMemo(() => {
    const active: any[] = [];
    const staticList: any[] = [];

    cubies.forEach((cubie) => {
      let isActive = false;
      if (activeRotation) {
        const { axis, layer } = activeRotation;
        const [x, y, z] = cubie.currentPosition;
        const posInLayer = axis === 'x' ? x : axis === 'y' ? y : z;
        if (Math.round(posInLayer) === layer) {
          isActive = true;
        }
      }

      if (isActive) {
        active.push(cubie);
      } else {
        staticList.push(cubie);
      }
    });

    return { activeCubies: active, staticCubies: staticList };
  }, [cubies, activeRotation]);

  // Animation setup
  const springProps = useSpring({
    to: {
      rotation: isAnimating && activeRotation
        ? calculateTargetRotation(activeRotation)
        : [0, 0, 0] as [number, number, number],
    },
    config: { mass: 1, tension: 170, friction: 26 },
    onRest: () => {
      if (isAnimating) {
        completeRotation();
      }
    }
  });

  return (
    <group>
      {/* Static Cubies */}
      {staticCubies.map((cubie) => (
        <Cubie 
          key={cubie.id} 
          initialPosition={cubie.initialPosition}
          currentPosition={cubie.currentPosition}
          quaternion={cubie.quaternion}
          onPointerDown={handleCubieClick}
          onWheel={handleCubieWheel}
        />
      ))}

      {/* Active Rotating Group */}
      {isAnimating ? (
        <animated.group rotation={springProps.rotation}>
          {activeCubies.map((cubie) => (
            <Cubie 
              key={cubie.id} 
              initialPosition={cubie.initialPosition}
              currentPosition={cubie.currentPosition}
              quaternion={cubie.quaternion}
              onPointerDown={handleCubieClick}
              onWheel={handleCubieWheel}
            />
          ))}
        </animated.group>
      ) : (
        activeCubies.map((cubie) => (
          <Cubie 
            key={cubie.id} 
            initialPosition={cubie.initialPosition}
            currentPosition={cubie.currentPosition}
            quaternion={cubie.quaternion}
            onPointerDown={handleCubieClick}
            onWheel={handleCubieWheel}
          />
        ))
      )}
    </group>
  );
};

function calculateTargetRotation(activeRotation: { axis: 'x' | 'y' | 'z', clockwise: boolean }): [number, number, number] {
  const { axis, clockwise } = activeRotation;
  const angle = (clockwise ? -1 : 1) * (Math.PI / 2);
  
  if (axis === 'x') return [angle, 0, 0];
  if (axis === 'y') return [0, angle, 0];
  if (axis === 'z') return [0, 0, angle];
  return [0, 0, 0];
}

export default RubiksCube;
