import { useGLTF } from '@react-three/drei';

const Model = () => {
    const { scene } = useGLTF('/path/to/model.glb'); // Adjust the path to your model
    return <primitive object={scene} scale={0.5} />;
};

// Inside the Canvas component in Home

