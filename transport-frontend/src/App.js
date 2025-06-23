import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboardLayout from './Components/AdminComponents/AdminLayouts/AdminDashboardLayout';
import AdminDashboardPage from './Components/AdminComponents/AdminPages/AdminDashboardPage';
import AdminLocationsPage from './Components/AdminComponents/AdminPages/AdminLocationsPage';
import AdminStudentsPage from './Components/AdminComponents/AdminPages/AdminStudentsPage';
import AdminSettingsPage from './Components/AdminComponents/AdminPages/AdminSettingsPage';
import AdminPaymentPage from './Components/AdminComponents/AdminPages/AdminPaymentPage';
import AdminReportPage from './Components/AdminComponents/AdminPages/AdminReportPage';
import TodayReportPage from './Components/AdminComponents/AdminPages/TodayReportPage';
import MomoPaymentPage from './Components/AdminComponents/AdminPages/MomoPaymentPage';
import AdminUsersPage from './Components/AdminComponents/AdminPages/AdminUsersPage';
import AddUserForm from './Components/AdminComponents/AdminPages/AddUserForm';
import ChangePasswordForm from './Components/AdminComponents/AdminPages/ChangePasswordForm';
import ResetParentPasswordForm from './Components/AdminComponents/AdminPages/ResetParentPasswordForm';
import WeeklyReportPageV2 from './Components/AdminComponents/AdminPages/WeeklyReportPageV2';
import LoginPage from './Components/LogingComponents/LoginPage';
import Footer from './Components/FooterComponents/Footer';
import UnpaidReportPage from './Components/AdminComponents/AdminPages/UnpaidReportPage';
import AbsenteeismPage from './Components/AdminComponents/AdminPages/AbsenteeismPage.';
import AbsentListPage from './Components/AdminComponents/AdminPages/AbsentListPage';
import AccountantDashboardLayout from './Components/AccountantComponents/AccountantLayouts/AccountantDashboardLayout';
import CashierDashboardLayout from './Components/CashierComponents/CashierLayouts/CashierDashboardLayout';
import RegistrarDashboardLayout from './Components/RegistrarComponents/RegistrarLayouts/RegistrarDashboardLayout';
import UnauthorizedPage from './Components/LogingComponents/UnauthorizedPage';
import ProtectedRoute from './Auth/ProtectedRoute';
import WeeklySummaryPage from './Components/AdminComponents/AdminPages/WeeklySummaryPage';
import TransportCashBalancingPage from './Components/AdminComponents/AdminPages/TransportCashBalancingPage';
import TransportAddCashReceivedForm from './Components/AdminComponents/AdminPages/TransportAddCashReceivedForm';
import TransportDailyBalancingPage from './Components/AdminComponents/AdminPages/TransportDailyBalancingPage';
import SystemLogs from './Components/AdminComponents/AdminPages/SystemLogs';
import CashierTransportWeeklyReportPage from './Components/AdminComponents/AdminPages/CashierTransportWeeklyReportPage';


function App() {
  return (
    <Router>
       
       
     <Routes>

             {/* Public route */}
              {/* .........LoginPage....... */}

              <Route path="/" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage/>} />

             
             {/* .......Admin Routes.......... */}
             
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
              <Route path="/admin" element={<AdminDashboardLayout />}>
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<AdminDashboardPage />} />
                            <Route path="/admin/locations" element={<AdminLocationsPage/>} />
                            <Route path="/admin/students" element={<AdminStudentsPage/>} />
                            <Route path="/admin/settings" element={<AdminSettingsPage/>} />
                            <Route path="/admin/payments" element={<AdminPaymentPage/>} />
                            <Route path="/admin/reports" element={<AdminReportPage/>} />
                            <Route path="/admin/today" element={<TodayReportPage/>} />
                            <Route path="/admin/momo" element={<MomoPaymentPage/>} />
                            <Route path="/admin/users" element={<AdminUsersPage/>} />
                            <Route path="/admin/users/add" element={<AddUserForm/>} />
                            <Route path="/admin/users/change-password" element={<ChangePasswordForm/>} />
                            <Route path="/admin/users/reset-parent-password" element={<ResetParentPasswordForm/>} />
                            <Route path="/admin/weekly" element={<WeeklyReportPageV2/>} />
                            <Route path="/admin/unpaid" element={<UnpaidReportPage/>} />
                            <Route path="/admin/absenteeism" element={<AbsenteeismPage/>} />
                            <Route path="/admin/absentees" element={<AbsentListPage/>} />
                            <Route path="/admin/balancing" element={<TransportCashBalancingPage/>} />
                            <Route path="/admin/summary" element={<WeeklySummaryPage/>} />
                            <Route path="/admin/transport-add-received" element={<TransportAddCashReceivedForm/>} />
                            <Route path="/admin/transport-daily-balancing" element={<TransportDailyBalancingPage/>} />
                            <Route path="/admin/logs" element={<SystemLogs/>} />
                            <Route path="/admin/cashier-weekly" element={<CashierTransportWeeklyReportPage/>} />



                
              </Route>
        </Route>


         {/* .......Accountant Routes.......... */}
             <Route element={<ProtectedRoute allowedRoles={["Accountant"]} />}>
                  <Route path="/accountant" element={<AccountantDashboardLayout />}>
                          <Route index element={<Navigate to="dashboard" replace />} />
                          <Route path="dashboard" element={<AdminDashboardPage />} />
                          <Route path="/accountant/payments" element={<AdminPaymentPage />} />
                          <Route path="/accountant/momo" element={<MomoPaymentPage />} />
                          <Route path="/accountant/reports" element={<AdminReportPage />} />
                          <Route path="/accountant/change-password" element={<ChangePasswordForm/>} />
                          <Route path="/accountant/today" element={<TodayReportPage/>} />
                          <Route path="/accountant/weekly" element={<WeeklyReportPageV2/>} />
                          <Route path="/accountant/unpaid" element={<UnpaidReportPage/>} />
                          <Route path="/accountant/balancing" element={<TransportCashBalancingPage/>} />
                           <Route path="/accountant/transport-add-received" element={<TransportAddCashReceivedForm/>} />
                            <Route path="/accountant/transport-daily-balancing" element={<TransportDailyBalancingPage/>} />
                           <Route path="/accountant/transport-add-received" element={<TransportAddCashReceivedForm/>} />
                            <Route path="/accountant/transport-daily-balancing" element={<TransportDailyBalancingPage/>} />
                            <Route path="/accountant/cashier-weekly" element={<CashierTransportWeeklyReportPage/>} />
                            <Route path="/accountant/summary" element={<WeeklySummaryPage/>} />



                  </Route>  
              </Route>  


          {/* .......Cashier Routes.......... */}
        
               <Route element={<ProtectedRoute allowedRoles={["Cashier"]} />}>
                     <Route path="/cashier" element={<CashierDashboardLayout />}>
                              <Route index element={<Navigate to="dashboard" replace />} />
                              <Route path="dashboard" element={<AdminDashboardPage />} />
                              <Route path="/cashier/payments" element={<AdminPaymentPage />} />
                              <Route path="/cashier/reports" element={<AdminReportPage/>} />
                               <Route path="/cashier/change-password" element={<ChangePasswordForm/>} />
                               <Route path="/cashier/today" element={<TodayReportPage/>} />
                              <Route path="/cashier/weekly" element={<WeeklyReportPageV2/>} />
                              <Route path="/cashier/unpaid" element={<UnpaidReportPage/>} />
                              <Route path="/cashier/cashier-weekly" element={<CashierTransportWeeklyReportPage/>} />



                      </Route>
               </Route>



          {/* .......Registrar Routes.......... */}

            <Route element={<ProtectedRoute allowedRoles={["Registrar"]} />}>
                    <Route path="/registrar" element={<RegistrarDashboardLayout />}>
                                <Route index element={<Navigate to="dashboard" replace />} />
                                <Route path="dashboard" element={<AdminDashboardPage />} />
                                <Route path="/registrar/students" element={<AdminStudentsPage />} />
                                 <Route path="/registrar/change-password" element={<ChangePasswordForm/>} />



                    </Route>
           </Route>


     </Routes>

     <Footer/>
    </Router>
  );
}

export default App;
