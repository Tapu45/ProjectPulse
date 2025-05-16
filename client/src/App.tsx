import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/HomePage';
import ProtectedRoute from './Route/protectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Auth/Login';
import Layout from './components/layout/ApplicationLayout';
import NotificationPage from './pages/Notification/Notification';
import ComplaintsPage from './pages/Complaints/Complains';
import ProjectsManagement from './pages/Project/Projects';
import ProjectDetails from './pages/Project/ProjectDetails';
import AdminComplaintManagement from './pages/Complaints/Complain-Manage';
import AssignedComplaints from './pages/Complaints/Assigned-Complain';
import ResetPassword from './pages/Auth/ResetPassword';
import ForgotPassword from './pages/Auth/ForgetPassword';
import UserManagementPage from './pages/User/User';
import EditComplaint from './components/ui/complain/EditComplaint';
import UnderConstruction from './components/layout/UnderConstruction';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
         <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <NotificationPage/>
            </ProtectedRoute>
          } 
        />
         <Route 
          path="/complaints" 
          element={
            <ProtectedRoute>
              <ComplaintsPage />
            </ProtectedRoute>
          } 
        />

        <Route 
      path="/complaints/create" 
      element={
        <ProtectedRoute>
          <ComplaintsPage />
        </ProtectedRoute>
      } 
    />
     <Route 
      path="/complaints/edit/:id" 
      element={
        <ProtectedRoute>
          <EditComplaint />
        </ProtectedRoute>
      } 
    />
     <Route 
          path="/user-management" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/assigned-complaints" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPPORT']}>
              <AssignedComplaints />
            </ProtectedRoute>
          } 
        />

    <Route 
  path="/projects" 
  element={
    <ProtectedRoute>
      <ProjectsManagement />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/projects/:id" 
  element={
    <ProtectedRoute>
      <ProjectDetails />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/admin/complaints" 
  element={
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminComplaintManagement />
    </ProtectedRoute>
  } 
/>

        </Route>
       
        <Route path="*" element={<UnderConstruction />} />
      </Routes>
    </Router>
  );
};

export default App;