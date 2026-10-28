import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./pages/Mainlayout.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./Dashboard.jsx";
import Product from "./pages/Product.jsx";
import Storage from "./pages/Storage.jsx";
import Billing  from "./pages/Billing.jsx";
import WarehouseType from "./pages/WarehouseType.jsx";
import Zone from "./pages/Zone.jsx";
import ZoneType from "./pages/ZoneType.jsx";



function Page({ title }) {
  return <h1>{title}</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Product />} />
          <Route path="storage" element={<Storage />} />
         


          
       
          <Route path="parties" element={<Page title="Parties" />} />
          <Route path="income-expense" element={<Page title="Income & Expense" />} />
          <Route path="design" element={<Page title="Design" />} />
          <Route path="transport" element={<Page title="Transport" />} />
          <Route path="reports" element={<Page title="Reports" />} />
          <Route path="activity-log" element={<Page title="Activity Log" />} />
          <Route path="settings" element={<Page title="Settings" />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;