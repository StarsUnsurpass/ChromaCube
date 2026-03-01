# ChromaCube - 炫彩 3D 智能魔方

ChromaCube 是一个基于 React 和 Three.js 开发的高性能、交互式 3D 魔方演示与还原系统。它不仅提供了极致真实的视觉表现，还集成了经典的 Kociemba 还原算法，能够一键解决任何状态下的魔方。

## ✨ 核心特性

- **极致仿真视觉**：采用 `MeshPhysicalMaterial` 物理材质，支持清漆层（Clearcoat）反光效果，模拟真实塑料质感。
- **圆润建模**：全方位的倒角设计，边缘过渡丝滑，告别生硬的直角模型。
- **平整表面**：采用嵌入式分面渲染技术，确保表面平整的同时，彻底解决 3D 渲染中的颜色丢失问题。
- **自由交互**：
  - **左键拖拽**：根据滑动方向自动识别并旋转对应的魔方层。
  - **右键拖拽**：360度全方位自由旋转整个魔方视角。
  - **滚轮缩放**：自由调节观察距离。
- **智能还原**：内置 Kociemba 两阶段算法，支持一键计算最优路径并按序播放还原动画。
- **数据驱动**：基于 Zustand 构建的状态中心，确保 3D 渲染与逻辑计算完美同步，绝不散架。

## 🛠️ 技术栈

- **框架**: [React 19](https://reactjs.org/)
- **3D 引擎**: [Three.js](https://threejs.org/)
- **React 绑定**: [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/)
- **辅助库**: [@react-three/drei](https://github.com/pmnd.rs/drei)
- **状态管理**: [Zustand](https://github.com/pmnd.rs/zustand)
- **物理动画**: [@react-spring/three](https://www.react-spring.dev/)
- **算法核心**: [cubejs](https://github.com/ldez/cubejs)
- **构建工具**: [Vite](https://vitejs.dev/)

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 构建生产版本
```bash
npm run build
```

## 🎮 操作说明

| 操作 | 描述 |
| :--- | :--- |
| **左键点击并拖拽** | 选中魔方色块并沿面方向滑动，即可转动该层 |
| **右键点击并拖拽** | 在任意位置右键拖拽，旋转整个魔方视角 |
| **鼠标滚轮** | 放大或缩小魔方 |
| **随机打乱** | 随机执行 20 步打乱动作 |
| **自动还原** | 自动计算当前状态的解法并按顺序演示 |
| **重置魔方** | 瞬间将魔方恢复至初始对齐状态 |

---

