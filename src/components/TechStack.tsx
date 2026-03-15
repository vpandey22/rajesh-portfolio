import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";

const textureLoader = new THREE.TextureLoader();
const imageUrls = [
  "/images/react2.webp",
  "/images/next2.webp",
  "/images/node2.webp",
  "/images/express.webp",
  "/images/mongo.webp",
  "/images/mysql.webp",
  "/images/typescript.webp",
  "/images/javascript.webp",
];
const textures = imageUrls.map((url) => textureLoader.load(url));

const sphereGeometry = new THREE.SphereGeometry(1, 28, 28);

// Generate sphere data with random positions and velocities
const spheresData = [...Array(16)].map(() => ({
  scale: [0.7, 1, 0.8, 1, 1][Math.floor(Math.random() * 5)],
  position: [
    THREE.MathUtils.randFloatSpread(12),
    THREE.MathUtils.randFloatSpread(12),
    THREE.MathUtils.randFloatSpread(6) - 3,
  ] as [number, number, number],
  velocity: [
    THREE.MathUtils.randFloatSpread(0.5),
    THREE.MathUtils.randFloatSpread(0.5),
    THREE.MathUtils.randFloatSpread(0.3),
  ] as [number, number, number],
  rotationSpeed: [
    THREE.MathUtils.randFloatSpread(0.02),
    THREE.MathUtils.randFloatSpread(0.02),
    THREE.MathUtils.randFloatSpread(0.02),
  ] as [number, number, number],
  phase: Math.random() * Math.PI * 2,
}));

type SphereProps = {
  scale: number;
  initialPosition: [number, number, number];
  velocity: [number, number, number];
  rotationSpeed: [number, number, number];
  phase: number;
  material: THREE.MeshPhysicalMaterial;
  isActive: boolean;
  mousePos: React.MutableRefObject<{ x: number; y: number }>;
};

function FloatingSphere({
  scale,
  initialPosition,
  velocity,
  rotationSpeed,
  phase,
  material,
  isActive,
  mousePos,
}: SphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const positionRef = useRef(new THREE.Vector3(...initialPosition));
  const velocityRef = useRef(new THREE.Vector3(...velocity));

  useFrame((state) => {
    if (!meshRef.current || !isActive) return;

    const time = state.clock.elapsedTime;
    const mesh = meshRef.current;

    // Floating motion with sine waves
    const floatX = Math.sin(time * 0.5 + phase) * 0.3;
    const floatY = Math.cos(time * 0.4 + phase) * 0.4;
    const floatZ = Math.sin(time * 0.3 + phase * 0.5) * 0.2;

    // Mouse repulsion effect
    const mouseX = mousePos.current.x * 10;
    const mouseY = mousePos.current.y * 10;
    const dx = positionRef.current.x - mouseX;
    const dy = positionRef.current.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const repulsionStrength = Math.max(0, 3 - dist) * 0.02;
    
    if (dist > 0.1) {
      velocityRef.current.x += (dx / dist) * repulsionStrength;
      velocityRef.current.y += (dy / dist) * repulsionStrength;
    }

    // Apply velocity with damping
    velocityRef.current.multiplyScalar(0.98);
    positionRef.current.add(velocityRef.current);

    // Boundary bounce
    const bounds = 8;
    if (Math.abs(positionRef.current.x) > bounds) {
      velocityRef.current.x *= -0.8;
      positionRef.current.x = Math.sign(positionRef.current.x) * bounds;
    }
    if (Math.abs(positionRef.current.y) > bounds) {
      velocityRef.current.y *= -0.8;
      positionRef.current.y = Math.sign(positionRef.current.y) * bounds;
    }
    if (Math.abs(positionRef.current.z) > 4) {
      velocityRef.current.z *= -0.8;
      positionRef.current.z = Math.sign(positionRef.current.z) * 4;
    }

    // Update position
    mesh.position.set(
      positionRef.current.x + floatX,
      positionRef.current.y + floatY,
      positionRef.current.z + floatZ
    );

    // Rotation
    mesh.rotation.x += rotationSpeed[0];
    mesh.rotation.y += rotationSpeed[1];
    mesh.rotation.z += rotationSpeed[2];
  });

  return (
    <mesh
      ref={meshRef}
      castShadow
      receiveShadow
      scale={scale}
      geometry={sphereGeometry}
      material={material}
      position={initialPosition}
    />
  );
}

function Scene({ isActive, materials }: { isActive: boolean; materials: THREE.MeshPhysicalMaterial[] }) {
  const mousePos = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  useFrame(({ pointer }) => {
    mousePos.current.x = (pointer.x * viewport.width) / 2;
    mousePos.current.y = (pointer.y * viewport.height) / 2;
  });

  return (
    <>
      {spheresData.map((props, i) => (
        <FloatingSphere
          key={i}
          scale={props.scale}
          initialPosition={props.position}
          velocity={props.velocity}
          rotationSpeed={props.rotationSpeed}
          phase={props.phase}
          material={materials[i % materials.length]}
          isActive={isActive}
          mousePos={mousePos}
        />
      ))}
    </>
  );
}

const TechStack = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const workElement = document.getElementById("work");
      if (!workElement) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const threshold = workElement.getBoundingClientRect().top;
      setIsActive(scrollY > threshold);
    };
    document.querySelectorAll(".header a").forEach((elem) => {
      const element = elem as HTMLAnchorElement;
      element.addEventListener("click", () => {
        const interval = setInterval(() => {
          handleScroll();
        }, 10);
        setTimeout(() => {
          clearInterval(interval);
        }, 1000);
      });
    });
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const materials = useMemo(() => {
    return textures.map(
      (texture) =>
        new THREE.MeshPhysicalMaterial({
          map: texture,
          emissive: "#ffffff",
          emissiveMap: texture,
          emissiveIntensity: 0.3,
          metalness: 0.5,
          roughness: 1,
          clearcoat: 0.1,
        })
    );
  }, []);

  return (
    <div className="techstack">
      <h2> My Techstack</h2>

      <Canvas
        shadows
        gl={{ alpha: true, stencil: false, depth: false, antialias: false }}
        camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
        onCreated={(state) => (state.gl.toneMappingExposure = 1.5)}
        className="tech-canvas"
      >
        <ambientLight intensity={1} />
        <spotLight
          position={[20, 20, 25]}
          penumbra={1}
          angle={0.2}
          color="white"
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <directionalLight position={[0, 5, -4]} intensity={2} />
        <Scene isActive={isActive} materials={materials} />
        <Environment
          files="/models/char_enviorment.hdr"
          environmentIntensity={0.5}
          environmentRotation={[0, 4, 2]}
        />
      </Canvas>
    </div>
  );
};

export default TechStack;
