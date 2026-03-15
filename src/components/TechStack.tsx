import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";

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

const sphereData = [...Array(30)].map(() => ({
  scale: [0.7, 1, 0.8, 1, 1][Math.floor(Math.random() * 5)],
  position: new THREE.Vector3(
    THREE.MathUtils.randFloatSpread(12),
    THREE.MathUtils.randFloatSpread(12),
    THREE.MathUtils.randFloatSpread(6)
  ),
  velocity: new THREE.Vector3(
    THREE.MathUtils.randFloatSpread(0.5),
    THREE.MathUtils.randFloatSpread(0.5),
    THREE.MathUtils.randFloatSpread(0.3)
  ),
  rotationSpeed: new THREE.Vector3(
    THREE.MathUtils.randFloatSpread(0.02),
    THREE.MathUtils.randFloatSpread(0.02),
    THREE.MathUtils.randFloatSpread(0.02)
  ),
}));

type SphereProps = {
  scale: number;
  initialPosition: THREE.Vector3;
  initialVelocity: THREE.Vector3;
  rotationSpeed: THREE.Vector3;
  material: THREE.MeshPhysicalMaterial;
  isActive: boolean;
  mousePos: React.MutableRefObject<THREE.Vector3>;
};

function SphereGeo({
  scale,
  initialPosition,
  initialVelocity,
  rotationSpeed,
  material,
  isActive,
  mousePos,
}: SphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const position = useRef(initialPosition.clone());
  const velocity = useRef(initialVelocity.clone());

  useFrame((_state, delta) => {
    if (!meshRef.current || !isActive) return;
    delta = Math.min(0.1, delta);

    // Apply mouse repulsion
    const toMouse = new THREE.Vector3().subVectors(mousePos.current, position.current);
    const distance = toMouse.length();
    if (distance < 4) {
      const repulsion = toMouse.normalize().multiplyScalar(-0.15 * (4 - distance));
      velocity.current.add(repulsion);
    }

    // Apply centering force (attract to center)
    const toCenter = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), position.current);
    velocity.current.add(toCenter.multiplyScalar(0.01));

    // Apply damping
    velocity.current.multiplyScalar(0.98);

    // Clamp velocity
    velocity.current.clampLength(0, 2);

    // Update position
    position.current.add(velocity.current.clone().multiplyScalar(delta * 60));

    // Boundary check - soft bounce
    const bounds = 8;
    if (Math.abs(position.current.x) > bounds) {
      velocity.current.x *= -0.5;
      position.current.x = Math.sign(position.current.x) * bounds;
    }
    if (Math.abs(position.current.y) > bounds) {
      velocity.current.y *= -0.5;
      position.current.y = Math.sign(position.current.y) * bounds;
    }
    if (Math.abs(position.current.z) > bounds / 2) {
      velocity.current.z *= -0.5;
      position.current.z = Math.sign(position.current.z) * (bounds / 2);
    }

    // Update mesh
    meshRef.current.position.copy(position.current);
    meshRef.current.rotation.x += rotationSpeed.x;
    meshRef.current.rotation.y += rotationSpeed.y;
    meshRef.current.rotation.z += rotationSpeed.z;
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
  const mousePos = useRef(new THREE.Vector3(100, 100, 0));
  const { viewport } = useThree();

  useFrame(({ pointer }) => {
    if (isActive) {
      mousePos.current.lerp(
        new THREE.Vector3(
          (pointer.x * viewport.width) / 2,
          (pointer.y * viewport.height) / 2,
          0
        ),
        0.1
      );
    }
  });

  return (
    <>
      {sphereData.map((data, i) => (
        <SphereGeo
          key={i}
          scale={data.scale}
          initialPosition={data.position}
          initialVelocity={data.velocity}
          rotationSpeed={data.rotationSpeed}
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
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const workElement = document.getElementById("work");
      if (!workElement) return;
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
        <EffectComposer enableNormalPass={false}>
          <N8AO color="#0f002c" aoRadius={2} intensity={1.15} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default TechStack;
