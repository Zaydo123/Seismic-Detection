// Model.jsx
import React from 'react';
import { useGLTF, Center } from '@react-three/drei';

const Model = () => {
    const { scene } = useGLTF('/assets/scene.gltf');

    return (
        <Center>
            <primitive object={scene} scale={0.5} />
        </Center>
    );
};

export default Model;
