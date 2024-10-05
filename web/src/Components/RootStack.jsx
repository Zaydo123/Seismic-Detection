import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../Screens/Home.jsx';

const RootStack = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                {/* Define other routes here */}
                {/* Fallback route to catch undefined paths */}
                <Route path="*" element={<Home />} />
            </Routes>
        </Router>
    );
};

export default RootStack;
