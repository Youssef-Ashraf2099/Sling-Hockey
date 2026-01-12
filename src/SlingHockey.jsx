import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  MeshReflectorMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import { GAME_CONFIG, PhysicsEngine, calculateElasticBand } from "./GameLogic";

// Wood Texture Helper
const WoodTexture = () => {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Create walnut wood pattern
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, "#3e2723");
    gradient.addColorStop(0.3, "#4e342e");
    gradient.addColorStop(0.5, "#5d4037");
    gradient.addColorStop(0.7, "#4e342e");
    gradient.addColorStop(1, "#3e2723");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // Add wood grain
    for (let i = 0; i < 100; i++) {
      ctx.strokeStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`;
      ctx.lineWidth = Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 512, 0);
      ctx.lineTo(Math.random() * 512, 512);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }, []);

  return texture;
};

// Hockey Board Component
const HockeyBoard = () => {
  const woodTexture = WoodTexture();

  return (
    <group>
      {/* Main Board */}
      <mesh position={[0, -GAME_CONFIG.boardHeight / 2, 0]} receiveShadow>
        <boxGeometry
          args={[
            GAME_CONFIG.boardWidth,
            GAME_CONFIG.boardHeight,
            GAME_CONFIG.boardLength,
          ]}
        />
        <meshStandardMaterial
          map={woodTexture}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Walls */}
      {/* Left Wall */}
      <mesh
        position={[
          -GAME_CONFIG.boardWidth / 2 - GAME_CONFIG.wallThickness / 2,
          GAME_CONFIG.wallHeight / 2,
          0,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            GAME_CONFIG.wallThickness,
            GAME_CONFIG.wallHeight,
            GAME_CONFIG.boardLength,
          ]}
        />
        <meshStandardMaterial color="#2c1810" roughness={0.7} />
      </mesh>

      {/* Right Wall */}
      <mesh
        position={[
          GAME_CONFIG.boardWidth / 2 + GAME_CONFIG.wallThickness / 2,
          GAME_CONFIG.wallHeight / 2,
          0,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            GAME_CONFIG.wallThickness,
            GAME_CONFIG.wallHeight,
            GAME_CONFIG.boardLength,
          ]}
        />
        <meshStandardMaterial color="#2c1810" roughness={0.7} />
      </mesh>

      {/* Top Wall */}
      <mesh
        position={[
          0,
          GAME_CONFIG.wallHeight / 2,
          GAME_CONFIG.boardLength / 2 + GAME_CONFIG.wallThickness / 2,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            GAME_CONFIG.boardWidth,
            GAME_CONFIG.wallHeight,
            GAME_CONFIG.wallThickness,
          ]}
        />
        <meshStandardMaterial color="#2c1810" roughness={0.7} />
      </mesh>

      {/* Bottom Wall */}
      <mesh
        position={[
          0,
          GAME_CONFIG.wallHeight / 2,
          -GAME_CONFIG.boardLength / 2 - GAME_CONFIG.wallThickness / 2,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            GAME_CONFIG.boardWidth,
            GAME_CONFIG.wallHeight,
            GAME_CONFIG.wallThickness,
          ]}
        />
        <meshStandardMaterial color="#2c1810" roughness={0.7} />
      </mesh>

      {/* Center Bar with Slot */}
      {/* Left part of center bar */}
      <mesh
        position={[
          -(
            GAME_CONFIG.slotWidth / 2 +
            (GAME_CONFIG.boardWidth - GAME_CONFIG.slotWidth) / 4
          ),
          GAME_CONFIG.wallHeight / 2,
          GAME_CONFIG.centerBarY,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            (GAME_CONFIG.boardWidth - GAME_CONFIG.slotWidth) / 2,
            GAME_CONFIG.wallHeight,
            0.3,
          ]}
        />
        <meshStandardMaterial color="#8b4513" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Right part of center bar */}
      <mesh
        position={[
          GAME_CONFIG.slotWidth / 2 +
            (GAME_CONFIG.boardWidth - GAME_CONFIG.slotWidth) / 4,
          GAME_CONFIG.wallHeight / 2,
          GAME_CONFIG.centerBarY,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            (GAME_CONFIG.boardWidth - GAME_CONFIG.slotWidth) / 2,
            GAME_CONFIG.wallHeight,
            0.3,
          ]}
        />
        <meshStandardMaterial color="#8b4513" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Dividing Line */}
      <mesh
        position={[0, 0.01, GAME_CONFIG.centerBarY]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[GAME_CONFIG.boardWidth, 0.1]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

// Puck Component
const Puck = ({
  position,
  color,
  side,
  onDragStart,
  onDragEnd,
  isBeingDragged,
  id,
}) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? "grab" : "auto";
  }, [hovered]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(position.x, position.y, position.z);
    }
  }, [position]);

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerDown={(e) => {
        e.stopPropagation();
        onDragStart(id);
      }}
      onPointerUp={() => onDragEnd()}
      castShadow
      receiveShadow
    >
      <cylinderGeometry
        args={[
          GAME_CONFIG.puckRadius,
          GAME_CONFIG.puckRadius,
          GAME_CONFIG.puckHeight,
          32,
        ]}
      />
      <meshPhysicalMaterial
        color={color}
        roughness={0.2}
        metalness={0.8}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        reflectivity={0.9}
        emissive={isBeingDragged ? color : "#000000"}
        emissiveIntensity={isBeingDragged ? 0.3 : 0}
      />
      {hovered && !isBeingDragged && (
        <mesh position={[0, GAME_CONFIG.puckHeight / 2 + 0.1, 0]}>
          <ringGeometry
            args={[GAME_CONFIG.puckRadius, GAME_CONFIG.puckRadius + 0.1, 32]}
          />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </mesh>
  );
};

// Elastic Band Visualization
const ElasticBand = ({ startPos, endPos }) => {
  const points = useMemo(() => {
    if (!startPos || !endPos) return [];
    return calculateElasticBand(
      new THREE.Vector3(startPos.x, startPos.y + 0.1, startPos.z),
      new THREE.Vector3(endPos.x, endPos.y + 0.1, endPos.z),
      20
    );
  }, [startPos, endPos]);

  if (points.length === 0) return null;

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#ff6b6b" linewidth={3} />
    </line>
  );
};

// Main Scene Component
const Scene = ({
  pucks,
  setPucks,
  onGameOver,
  mode,
  aiController,
  cameraShake,
}) => {
  const { camera } = useThree();
  const [draggedPuck, setDraggedPuck] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [currentMousePos, setCurrentMousePos] = useState(null);
  const physicsEngine = useRef(new PhysicsEngine()).current;
  const lastTime = useRef(Date.now());
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycaster = useRef(new THREE.Raycaster());

  // Camera shake effect
  useFrame(() => {
    if (cameraShake > 0) {
      camera.position.x += (Math.random() - 0.5) * cameraShake * 0.1;
      camera.position.y += (Math.random() - 0.5) * cameraShake * 0.1;
      camera.position.z += (Math.random() - 0.5) * cameraShake * 0.1;
    }
  });

  // Physics update loop
  useFrame(() => {
    const currentTime = Date.now();
    const deltaTime = Math.min((currentTime - lastTime.current) / 1000, 0.1);
    lastTime.current = currentTime;

    // Update physics
    physicsEngine.updatePucks(pucks, deltaTime);

    // AI Turn (PVE mode)
    if (mode === "pve" && aiController) {
      const aiPucks = pucks.filter((p) => p.side === "player2");
      aiController.executeTurn(aiPucks, currentTime);
    }

    // Check for eliminated pucks
    const remainingPucks = pucks.filter((puck) => {
      if (puck.side === "player1") {
        return puck.position.z > -GAME_CONFIG.boardLength / 2.5;
      } else {
        return puck.position.z < GAME_CONFIG.boardLength / 2.5;
      }
    });

    if (remainingPucks.length !== pucks.length) {
      setPucks(remainingPucks);

      // Check win condition
      const player1Count = remainingPucks.filter(
        (p) => p.side === "player1"
      ).length;
      const player2Count = remainingPucks.filter(
        (p) => p.side === "player2"
      ).length;

      if (player1Count === 0) {
        onGameOver(mode === "pve" ? "ai" : "player2");
      } else if (player2Count === 0) {
        onGameOver(mode === "pve" ? "player" : "player1");
      }
    }

    // Update pucks state
    setPucks([...pucks]);
  });

  // Handle mouse move for dragging
  const handlePointerMove = (e) => {
    if (!draggedPuck) return;

    raycaster.current.setFromCamera(
      {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      },
      camera
    );

    const intersection = new THREE.Vector3();
    raycaster.current.ray.intersectPlane(planeRef.current, intersection);

    if (intersection) {
      setCurrentMousePos({
        x: intersection.x,
        y: GAME_CONFIG.puckHeight / 2,
        z: intersection.z,
      });
    }
  };

  // Handle drag start
  const handleDragStart = (puckId) => {
    const puck = pucks.find((p) => p.id === puckId);
    if (puck) {
      // Only allow dragging own pucks
      if (mode === "pvp" || (mode === "pve" && puck.side === "player1")) {
        setDraggedPuck(puck);
        setDragStart({
          x: puck.position.x,
          y: puck.position.y,
          z: puck.position.z,
        });
        puck.velocity.x = 0;
        puck.velocity.z = 0;
      }
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (draggedPuck && dragStart && currentMousePos) {
      // Calculate velocity based on drag distance
      const dx = dragStart.x - currentMousePos.x;
      const dz = dragStart.z - currentMousePos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      const power = Math.min(distance * 3, GAME_CONFIG.maxVelocity);

      draggedPuck.velocity.x = dx * power * 0.5;
      draggedPuck.velocity.z = dz * power * 0.5;
    }

    setDraggedPuck(null);
    setDragStart(null);
    setCurrentMousePos(null);
  };

  return (
    <>
      <ambientLight intensity={0.4} />
      <spotLight
        position={[10, 20, 10]}
        angle={0.6}
        penumbra={0.5}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <spotLight
        position={[-10, 20, -10]}
        angle={0.6}
        penumbra={0.5}
        intensity={0.8}
        castShadow
      />

      <HockeyBoard />

      {pucks.map((puck) => (
        <Puck
          key={puck.id}
          id={puck.id}
          position={puck.position}
          color={puck.color}
          side={puck.side}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          isBeingDragged={draggedPuck?.id === puck.id}
        />
      ))}

      {draggedPuck && dragStart && currentMousePos && (
        <ElasticBand startPos={dragStart} endPos={currentMousePos} />
      )}

      <mesh
        position={[0, -0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={handlePointerMove}
        onPointerUp={handleDragEnd}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <Environment preset="warehouse" />
    </>
  );
};

// Main Component
const SlingHockey = ({ onGameOver, mode, difficulty, aiController }) => {
  const [pucks, setPucks] = useState([]);
  const [cameraShake, setCameraShake] = useState(0);

  // Initialize pucks
  useEffect(() => {
    const initialPucks = [];
    const spacing = 2;

    // Player 1 pucks (bottom - blue)
    for (let i = 0; i < 5; i++) {
      initialPucks.push({
        id: `p1-${i}`,
        side: "player1",
        color: "#3b82f6",
        position: {
          x: (i - 2) * spacing,
          y: GAME_CONFIG.puckHeight / 2,
          z: GAME_CONFIG.boardLength / 3,
        },
        velocity: { x: 0, z: 0 },
      });
    }

    // Player 2/AI pucks (top - red)
    for (let i = 0; i < 5; i++) {
      initialPucks.push({
        id: `p2-${i}`,
        side: "player2",
        color: "#ef4444",
        position: {
          x: (i - 2) * spacing,
          y: GAME_CONFIG.puckHeight / 2,
          z: -GAME_CONFIG.boardLength / 3,
        },
        velocity: { x: 0, z: 0 },
      });
    }

    setPucks(initialPucks);
  }, []);

  const handleGameOver = (winner) => {
    setCameraShake(1);
    setTimeout(() => {
      setCameraShake(0);
      onGameOver(winner);
    }, 500);
  };

  return (
    <Canvas
      shadows
      camera={{
        position: [0, 25, 15],
        fov: 50,
        near: 0.1,
        far: 1000,
      }}
      gl={{ antialias: true, alpha: false }}
    >
      <Scene
        pucks={pucks}
        setPucks={setPucks}
        onGameOver={handleGameOver}
        mode={mode}
        aiController={aiController}
        cameraShake={cameraShake}
      />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={15}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.5}
      />
    </Canvas>
  );
};

export default SlingHockey;
