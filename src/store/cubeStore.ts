import { create } from 'zustand';
import * as THREE from 'three';
import Cube from 'cubejs';

// Initialize the solver
Cube.initSolver();

export interface CubieState {
  id: number;
  initialPosition: [number, number, number];
  currentPosition: [number, number, number];
  quaternion: THREE.Quaternion;
}

interface ActiveRotation {
  axis: 'x' | 'y' | 'z';
  layer: number;
  clockwise: boolean;
}

interface CubeStore {
  cubies: CubieState[];
  isAnimating: boolean;
  activeRotation: ActiveRotation | null;
  moveQueue: string[];
  isSolving: boolean;
  
  rotateLayer: (axis: 'x' | 'y' | 'z', layerIndex: number, clockwise: boolean) => void;
  completeRotation: () => void;
  resetCube: () => void;
  scramble: () => void;
  solve: () => void;
  getCubeString: () => string;
}

const generateInitialCubies = (): CubieState[] => {
  const cubies: CubieState[] = [];
  let idCounter = 0;
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue;
        cubies.push({
          id: idCounter++,
          initialPosition: [x, y, z],
          currentPosition: [x, y, z],
          quaternion: new THREE.Quaternion(),
        });
      }
    }
  }
  return cubies;
};

const MOVE_MAP: Record<string, { axis: 'x' | 'y' | 'z', layer: number, clockwise: boolean }> = {
  'U': { axis: 'y', layer: 1, clockwise: true },
  'U\'': { axis: 'y', layer: 1, clockwise: false },
  'D': { axis: 'y', layer: -1, clockwise: false },
  'D\'': { axis: 'y', layer: -1, clockwise: true },
  'R': { axis: 'x', layer: 1, clockwise: true },
  'R\'': { axis: 'x', layer: 1, clockwise: false },
  'L': { axis: 'x', layer: -1, clockwise: false },
  'L\'': { axis: 'x', layer: -1, clockwise: true },
  'F': { axis: 'z', layer: 1, clockwise: true },
  'F\'': { axis: 'z', layer: 1, clockwise: false },
  'B': { axis: 'z', layer: -1, clockwise: false },
  'B\'': { axis: 'z', layer: -1, clockwise: true },
};

export const useCubeStore = create<CubeStore>((set, get) => ({
  cubies: generateInitialCubies(),
  isAnimating: false,
  activeRotation: null,
  moveQueue: [],
  isSolving: false,

  rotateLayer: (axis, layerIndex, clockwise) => {
    if (get().isAnimating) return;
    set({
      isAnimating: true,
      activeRotation: { axis, layer: layerIndex, clockwise }
    });
  },

  completeRotation: () => {
    const { activeRotation, cubies, moveQueue, isSolving } = get();
    if (!activeRotation) return;

    const { axis, layer, clockwise } = activeRotation;
    const angle = (clockwise ? -1 : 1) * (Math.PI / 2);
    const rotationAxis = new THREE.Vector3();
    rotationAxis[axis] = 1;
    const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle);

    const newCubies = cubies.map((cubie) => {
      const [x, y, z] = cubie.currentPosition;
      const posInLayer = axis === 'x' ? x : axis === 'y' ? y : z;

      if (Math.round(posInLayer) === layer) {
        let newPos: [number, number, number] = [...cubie.currentPosition];
        if (axis === 'x') {
          const [ny, nz] = rotate2D(y, z, clockwise);
          newPos = [x, ny, nz];
        } else if (axis === 'y') {
          const [nx, nz] = rotate2D(x, z, !clockwise);
          newPos = [nx, y, nz];
        } else if (axis === 'z') {
          const [nx, ny] = rotate2D(x, y, clockwise);
          newPos = [nx, ny, z];
        }

        const newQuaternion = cubie.quaternion.clone().premultiply(rotationQuaternion);
        newQuaternion.x = parseFloat(newQuaternion.x.toFixed(10));
        newQuaternion.y = parseFloat(newQuaternion.y.toFixed(10));
        newQuaternion.z = parseFloat(newQuaternion.z.toFixed(10));
        newQuaternion.w = parseFloat(newQuaternion.w.toFixed(10));

        return {
          ...cubie,
          currentPosition: newPos,
          quaternion: newQuaternion,
        };
      }
      return cubie;
    });

    set({
      cubies: newCubies,
      isAnimating: false,
      activeRotation: null
    });

    // If there's more in the queue, trigger next
    if (moveQueue.length > 0) {
      setTimeout(() => {
        const nextMove = moveQueue[0];
        const { axis, layer, clockwise } = MOVE_MAP[nextMove];
        set({ moveQueue: moveQueue.slice(1) });
        get().rotateLayer(axis, layer, clockwise);
      }, 50);
    } else if (isSolving) {
      set({ isSolving: false });
    }
  },

  resetCube: () => {
    set({
      cubies: generateInitialCubies(),
      isAnimating: false,
      activeRotation: null,
      moveQueue: [],
      isSolving: false
    });
  },

  scramble: () => {
    const moves = ['U', 'D', 'R', 'L', 'F', 'B', 'U\'', 'D\'', 'R\'', 'L\'', 'F\'', 'B\''];
    const scrambleMoves = [];
    for (let i = 0; i < 20; i++) {
      scrambleMoves.push(moves[Math.floor(Math.random() * moves.length)]);
    }
    
    set({ moveQueue: scrambleMoves });
    if (!get().isAnimating && scrambleMoves.length > 0) {
      const nextMove = scrambleMoves[0];
      const { axis, layer, clockwise } = MOVE_MAP[nextMove];
      set({ moveQueue: scrambleMoves.slice(1) });
      get().rotateLayer(axis, layer, clockwise);
    }
  },

  solve: () => {
    if (get().isAnimating || get().moveQueue.length > 0) return;
    
    try {
      const cubeStr = get().getCubeString();
      const cube = Cube.fromString(cubeStr);
      const solution = cube.solve();
      
      if (!solution) return;

      const steps = solution.split(' ').flatMap(step => {
        if (step.endsWith('2')) {
          const base = step[0];
          return [base, base];
        }
        return [step];
      });

      set({ moveQueue: steps, isSolving: true });
      if (steps.length > 0) {
        const nextMove = steps[0];
        const { axis, layer, clockwise } = MOVE_MAP[nextMove];
        set({ moveQueue: steps.slice(1) });
        get().rotateLayer(axis, layer, clockwise);
      }
    } catch (e) {
      console.error("Solving error", e);
    }
  },

  getCubeString: () => {
    const { cubies } = get();
    
    const getFaceletColor = (x: number, y: number, z: number, worldNormal: THREE.Vector3): string => {
      const cubie = cubies.find(c => 
        Math.round(c.currentPosition[0]) === x && 
        Math.round(c.currentPosition[1]) === y && 
        Math.round(c.currentPosition[2]) === z
      );
      if (!cubie) return 'U'; // Should not happen

      const localNormal = worldNormal.clone().applyQuaternion(cubie.quaternion.clone().conjugate());
      const lx = Math.round(localNormal.x);
      const ly = Math.round(localNormal.y);
      const lz = Math.round(localNormal.z);

      const [ix, iy, iz] = cubie.initialPosition;
      if (lx === 1 && ix === 1) return 'R';
      if (lx === -1 && ix === -1) return 'L';
      if (ly === 1 && iy === 1) return 'U';
      if (ly === -1 && iy === -1) return 'D';
      if (lz === 1 && iz === 1) return 'F';
      if (lz === -1 && iz === -1) return 'B';
      return 'U';
    };

    let result = '';

    // Standard Singmaster order
    // U (Up): y=1, z from -1 to 1, x from -1 to 1
    const uNorm = new THREE.Vector3(0, 1, 0);
    for (let z = -1; z <= 1; z++) for (let x = -1; x <= 1; x++) result += getFaceletColor(x, 1, z, uNorm);
    
    // R (Right): x=1, y from 1 to -1, z from 1 to -1
    const rNorm = new THREE.Vector3(1, 0, 0);
    for (let y = 1; y >= -1; y--) for (let z = 1; z >= -1; z--) result += getFaceletColor(1, y, z, rNorm);

    // F (Front): z=1, y from 1 to -1, x from -1 to 1
    const fNorm = new THREE.Vector3(0, 0, 1);
    for (let y = 1; y >= -1; y--) for (let x = -1; x <= 1; x++) result += getFaceletColor(x, y, 1, fNorm);

    // D (Down): y=-1, z from 1 to -1, x from -1 to 1
    const dNorm = new THREE.Vector3(0, -1, 0);
    for (let z = 1; z >= -1; z--) for (let x = -1; x <= 1; x++) result += getFaceletColor(x, -1, z, dNorm);

    // L (Left): x=-1, y from 1 to -1, z from -1 to 1
    const lNorm = new THREE.Vector3(-1, 0, 0);
    for (let y = 1; y >= -1; y--) for (let z = -1; z <= 1; z++) result += getFaceletColor(-1, y, z, lNorm);

    // B (Back): z=-1, y from 1 to -1, x from 1 to -1
    const bNorm = new THREE.Vector3(0, 0, -1);
    for (let y = 1; y >= -1; y--) for (let x = 1; x >= -1; x--) result += getFaceletColor(x, y, -1, bNorm);

    return result;
  }
}));

function rotate2D(a: number, b: number, clockwise: boolean): [number, number] {
  return clockwise ? [b, -a] : [-b, a];
}
