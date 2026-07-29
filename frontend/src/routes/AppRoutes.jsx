import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import LoadingScreen from '../components/common/LoadingScreen';
import { ROLES } from '../constants/roles';

// Lazy load pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const EmailVerificationPage = lazy(() => import('../pages/auth/EmailVerificationPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const ProjectListPage = lazy(() => import('../pages/projects/ProjectListPage'));
const ProjectDetailPage = lazy(() => import('../pages/projects/ProjectDetailPage'));
const ProjectBoardPage = lazy(() => import('../pages/projects/ProjectBoardPage'));
const ProjectTasksPage = lazy(() => import('../pages/projects/ProjectTasksPage'));
const ProjectSettingsPage = lazy(() => import('../pages/projects/ProjectSettingsPage'));
const TaskListPage = lazy(() => import('../pages/tasks/TaskListPage'));
const TaskDetailPage = lazy(() => import('../pages/tasks/TaskDetailPage'));
const MyTasksPage = lazy(() => import('../pages/tasks/MyTasksPage'));
const CompanySettingsPage = lazy(() => import('../pages/company/CompanySettingsPage'));
const DepartmentListPage = lazy(() => import('../pages/company/DepartmentListPage'));
const DesignationListPage = lazy(() => import('../pages/company/DesignationListPage'));
const EmployeeListPage = lazy(() => import('../pages/company/EmployeeListPage'));
const EmployeeDetailPage = lazy(() => import('../pages/company/EmployeeDetailPage'));
const AttendancePage = lazy(() => import('../pages/attendance/AttendancePage'));
const LeavePage = lazy(() => import('../pages/leaves/LeavePage'));
const HolidayPage = lazy(() => import('../pages/holidays/HolidayPage'));
const MeetingListPage = lazy(() => import('../pages/meetings/MeetingListPage'));
const MeetingDetailPage = lazy(() => import('../pages/meetings/MeetingDetailPage'));
const ClientListPage = lazy(() => import('../pages/clients/ClientListPage'));
const ClientDetailPage = lazy(() => import('../pages/clients/ClientDetailPage'));
const InvoiceListPage = lazy(() => import('../pages/invoices/InvoiceListPage'));
const InvoiceDetailPage = lazy(() => import('../pages/invoices/InvoiceDetailPage'));
const ExpenseListPage = lazy(() => import('../pages/expenses/ExpenseListPage'));
const DocumentListPage = lazy(() => import('../pages/documents/DocumentListPage'));
const KnowledgeBasePage = lazy(() => import('../pages/knowledgebase/KnowledgeBasePage'));
const WikiPage = lazy(() => import('../pages/wiki/WikiPage'));
const AnnouncementPage = lazy(() => import('../pages/announcements/AnnouncementPage'));
const ChatPage = lazy(() => import('../pages/chat/ChatPage'));
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage'));
const ReportDetailPage = lazy(() => import('../pages/reports/ReportDetailPage'));
const NotificationPage = lazy(() => import('../pages/notifications/NotificationPage'));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'));
const AdminPage = lazy(() => import('../pages/admin/AdminPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

function AdminRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.ADMIN;
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function withSuspense(Component) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Component />
    </Suspense>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<PublicRoute>{withSuspense(LoginPage)}</PublicRoute>} />
        <Route path="/register" element={<PublicRoute>{withSuspense(RegisterPage)}</PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute>{withSuspense(ForgotPasswordPage)}</PublicRoute>} />
        <Route path="/reset-password/:token" element={<PublicRoute>{withSuspense(ResetPasswordPage)}</PublicRoute>} />
        <Route path="/verify-email/:token" element={withSuspense(EmailVerificationPage)} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={withSuspense(DashboardPage)} />
        <Route path="/projects" element={withSuspense(ProjectListPage)} />
        <Route path="/projects/:id" element={withSuspense(ProjectDetailPage)} />
        <Route path="/projects/:id/board" element={withSuspense(ProjectBoardPage)} />
        <Route path="/projects/:id/tasks" element={withSuspense(ProjectTasksPage)} />
        <Route path="/projects/:id/tasks/:taskId" element={withSuspense(TaskDetailPage)} />
        <Route path="/projects/:id/settings" element={withSuspense(ProjectSettingsPage)} />
        <Route path="/tasks" element={withSuspense(TaskListPage)} />
        <Route path="/tasks/:id" element={withSuspense(TaskDetailPage)} />
        <Route path="/my-tasks" element={withSuspense(MyTasksPage)} />
        <Route path="/company/settings" element={withSuspense(CompanySettingsPage)} />
        <Route path="/company/departments" element={withSuspense(DepartmentListPage)} />
        <Route path="/company/designations" element={withSuspense(DesignationListPage)} />
        <Route path="/company/employees" element={withSuspense(EmployeeListPage)} />
        <Route path="/company/employees/:id" element={withSuspense(EmployeeDetailPage)} />
        <Route path="/attendance" element={withSuspense(AttendancePage)} />
        <Route path="/leaves" element={withSuspense(LeavePage)} />
        <Route path="/holidays" element={withSuspense(HolidayPage)} />
        <Route path="/meetings" element={withSuspense(MeetingListPage)} />
        <Route path="/meetings/:id" element={withSuspense(MeetingDetailPage)} />
        <Route path="/clients" element={withSuspense(ClientListPage)} />
        <Route path="/clients/:id" element={withSuspense(ClientDetailPage)} />
        <Route path="/invoices" element={withSuspense(InvoiceListPage)} />
        <Route path="/invoices/:id" element={withSuspense(InvoiceDetailPage)} />
        <Route path="/expenses" element={withSuspense(ExpenseListPage)} />
        <Route path="/documents" element={withSuspense(DocumentListPage)} />
        <Route path="/knowledge-base" element={withSuspense(KnowledgeBasePage)} />
        <Route path="/wiki" element={withSuspense(WikiPage)} />
        <Route path="/announcements" element={withSuspense(AnnouncementPage)} />
        <Route path="/chat" element={withSuspense(ChatPage)} />
        <Route path="/reports" element={withSuspense(ReportsPage)} />
        <Route path="/reports/:type" element={withSuspense(ReportDetailPage)} />
        <Route path="/notifications" element={withSuspense(NotificationPage)} />
        <Route path="/settings" element={withSuspense(SettingsPage)} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              {withSuspense(AdminPage)}
            </AdminRoute>
          }
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={withSuspense(NotFoundPage)} />
    </Routes>
  );
}
