import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import StudentPortal from './pages/StudentPortal';
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyStudio from './pages/FacultyStudio';
import AdminConsole from './pages/AdminConsole';
import VerifierDashboard from './pages/VerifierDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/student" element={<StudentPortal />} />
        <Route path="/faculty" element={<FacultyDashboard />} />
        <Route path="/faculty/studio" element={<FacultyStudio />} />
        <Route path="/admin" element={<AdminConsole />} />
        <Route path="/verifier" element={<VerifierDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
