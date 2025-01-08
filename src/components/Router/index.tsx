import { Route, Routes } from 'react-router-dom'
import Lists from '../../pages/Lists'
import Error from '../../pages/Error'
import Barcode from '../Reader/Barcode'
import Register from '../../pages/Register'
import Supermarkets from '../../pages/Supermarkets'
// import Map from '../Map'
import Reciepts from '../../pages/Reciepts'
import Home from '../../pages/Home'
import PrivacyPolicy from '../../pages/PrivacyPolicy'
import TermsOfUse from '../../pages/TermsOfUse'
import ProtectedRouters from './ProtectedRouters'
import RedirectRouters from './RedirectRouters'
import Products from '../../pages/Products/list'
import CreateOrUpdateSupermarket from '../../pages/Supermarkets/CreateOrUpdate'

function Router() {
  return (
    <Routes>
      <Route element={<RedirectRouters />}>
        <Route path="/" element={<Home />} />
      </Route>
      <Route element={<ProtectedRouters />}>
        <Route path="/list" element={<Lists />} />
        <Route path="/list/:id" element={<Products />} />
        <Route path="/supermarkets" element={<Supermarkets />} />
        <Route path="/supermarkets/:id" element={<Products />} />
        <Route path="/supermarkets/create" element={<CreateOrUpdateSupermarket />} />
        <Route path="/supermarkets/update/:id" element={<CreateOrUpdateSupermarket />} />
        <Route path="/reciepts" element={<Reciepts />} />
        {/* <Route path="/map" element={<Map />} /> */}
        <Route path="/barcode" element={<Barcode />} />
        <Route path="/edit" element={<Register />} />
      </Route>
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-use" element={<TermsOfUse />} />
      <Route path="*" element={<Error />} />
    </Routes>
  )
}

export default Router
