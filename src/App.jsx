
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./pages/Mainlayout.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./Dashboard.jsx";
import Product from "./pages/Product.jsx";
import AddItem from "./pages/AddItem";

function Page({ title }) {
  return <h1>{title}</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Signup */}
        <Route path="/signup" element={<Signup />} />

        {/* Main layout with Sidebar and Header */}
        <Route path="/" element={<MainLayout />}>
          {/* Dashboard */}
          <Route index element={<Dashboard />} />

          {/* Products */}
          <Route path="products" element={<Product />} />
          <Route path="product/add" element={<AddItem />} />


          {/* Other pages */}
          <Route path="storage" element={<Page title="Storage" />} />
          <Route path="billing" element={<Page title="Billing" />} />
          <Route path="parties" element={<Page title="Parties" />} />

          <Route
            path="income-expense"
            element={<Page title="Income & Expense" />}
          />

          <Route path="design" element={<Page title="Design" />} />
          <Route path="transport" element={<Page title="Transport" />} />
          <Route path="reports" element={<Page title="Reports" />} />

          <Route
            path="activity-log"
            element={<Page title="Activity Log" />}
          />

          <Route path="settings" element={<Page title="Settings" />} />
        </Route>

        {/* Unknown URL */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
