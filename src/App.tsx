import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import RubiksCube from './components/RubiksCube';
import { useCubeStore } from './store/cubeStore';
import './App.css';

function App() {
  const scramble = useCubeStore((state) => state.scramble);
  const solve = useCubeStore((state) => state.solve);
  const resetCube = useCubeStore((state) => state.resetCube);
  const moveQueue = useCubeStore((state) => state.moveQueue);
  const isSolving = useCubeStore((state) => state.isSolving);

  return (
    <div className="App" style={{ position: 'relative', background: '#303030' }}>
      <Canvas shadows>
        <color attach="background" args={['#303030']} />
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
        
        {/* 灯光系统 */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 10]} 
          intensity={1} 
          castShadow 
          shadow-mapSize={[2048, 2048]} 
        />
        <spotLight position={[-10, 10, -10]} intensity={0.5} angle={0.15} penumbra={1} />

        {/* 3D 魔方组件 */}
        <RubiksCube />

        {/* 视觉特效 */}
        <ContactShadows 
          position={[0, -2, 0]} 
          opacity={0.4} 
          scale={10} 
          blur={2.5} 
          far={4} 
        />
        <Environment preset="city" />

        {/* 视角控制：左键拧魔方，右键/空白处旋转视角 */}
        <OrbitControls makeDefault minDistance={3} maxDistance={20} />
      </Canvas>

      {/* UI 控制面板 */}
      <div style={{ 
        position: 'absolute', 
        top: 40, 
        left: 40, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px',
        color: 'white',
        fontFamily: '"Microsoft YaHei", sans-serif',
        pointerEvents: 'none'
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <h1 style={{ margin: 0, fontSize: '28px', letterSpacing: '4px', fontWeight: 'bold' }}>炫彩魔方</h1>
          <p style={{ opacity: 0.6, fontSize: '12px', letterSpacing: '1px' }}>3D 交互式自动还原系统</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', pointerEvents: 'auto' }}>
          <button className="ui-button" onClick={scramble}>随机打乱</button>
          <button className="ui-button" onClick={solve} disabled={isSolving}>
            {isSolving ? '正在还原...' : '自动还原'}
          </button>
          <button className="ui-button" onClick={resetCube}>重置魔方</button>
        </div>

        {moveQueue.length > 0 && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: 'rgba(255,255,255,0.05)', 
            borderRadius: '8px',
            borderLeft: '4px solid #00ff88',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '5px' }}>剩余步骤</div>
            <div style={{ fontSize: '14px', wordBreak: 'break-all', fontFamily: 'monospace', color: '#00ff88' }}>
              {moveQueue.slice(0, 10).join(' ')} {moveQueue.length > 10 ? '...' : ''}
            </div>
          </div>
        )}
      </div>

      <div style={{ 
        position: 'absolute', 
        bottom: 40, 
        right: 40, 
        color: 'white', 
        fontSize: '13px', 
        opacity: 0.5,
        textAlign: 'right',
        lineHeight: '1.8'
      }}>
        <b style={{ color: '#00ff88' }}>操作说明</b><br/>
        左键拖拽：旋转魔方层<br/>
        右键拖拽：旋转整个视角<br/>
        滚轮：缩放距离
      </div>
    </div>
  );
}

export default App;
