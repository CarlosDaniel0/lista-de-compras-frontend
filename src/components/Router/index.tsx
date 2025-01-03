import { Route, Routes } from 'react-router-dom'
import Lists from '../../pages/Lists'
import Error from '../../pages/Error'
import Barcode from '../Reader/Barcode'
import Register from '../../pages/Register'
import Supermarkets from '../../pages/Supermarkets'
import Map from '../Map'
import Reciepts from '../../pages/Reciepts'
import List from '../../pages/List'
import Home from '../../pages/Home'
import PrivacyPolicy from '../../pages/PrivacyPolicy'
import TermsOfUse from '../../pages/TermsOfUse'

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/list" element={<Lists />} />
      <Route path="/list/:id" element={<List />} />
      <Route path="/supermarkets" element={<Supermarkets />} />
      <Route path="/reciepts" element={<Reciepts />} />
      <Route path="/map" element={<Map />} />
      <Route path="/barcode" element={<Barcode />} />
      <Route path="/edit" element={<Register />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-use" element={<TermsOfUse />} />
      <Route path="*" element={<Error />} />
    </Routes>
  )
}

export default Router
