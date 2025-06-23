import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import LoteFijo from "./pages/LoteFijo"
import IntervaloFijo from "./pages/IntervaloFijo"
import Proveedores from "./pages/Provider"
import Compras from "./pages/Order"
import Ventas from "./pages/Sale"

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lote-fijo" element={<LoteFijo />} />
          <Route path="/intervalo-fijo" element={<IntervaloFijo />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/ventas" element={<Ventas />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
