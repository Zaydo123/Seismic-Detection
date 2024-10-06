import React from 'react';
import { Box } from '@react-three/drei';

const SimpleModel = () => {
  return (
    <Box args={[1, 1, 1]}>
      <meshStandardMaterial color="orange" />
    </Box>
  );
};

export default SimpleModel;
