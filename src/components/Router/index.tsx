import { Route, Routes } from 'react-router-dom'
import Lists from '../../pages/Lists'
import Error from '../../pages/Error'
import Barcode from '../Reader/Barcode'
import Supermarkets from '../../pages/Supermarkets'
import Reciepts from '../../pages/Reciepts'
import Home from '../../pages/Home'
import PrivacyPolicy from '../../pages/PrivacyPolicy'
import TermsOfUse from '../../pages/TermsOfUse'
import ProtectedRouters from './ProtectedRouters'
import RedirectRouters from './RedirectRouters'
import Products from '../../pages/Products'
import CreateOrUpdateSupermarket from '../../pages/Supermarkets/CreateOrUpdate'
import CreateOrUpdateReciept from '../../pages/Reciepts/CreateOrUpdate'
import CreateOrUpdateProducts from '../../pages/Products/CreateOrUpdate'
import Camera from '../Reader/Camera'
import QRCode from '../Reader/QRCode'
import Settings from '../../pages/Settings'

function Router() {
  return (
    <Routes>
      <Route element={<RedirectRouters />}>
        <Route path="/" element={<Home />} />
      </Route>
      <Route element={<ProtectedRouters />}>
        <Route path="/lists" element={<Lists />} />
        <Route path="/lists/:id" element={<Products path='lists' />} />
        <Route path="/lists/:id/create" element={<CreateOrUpdateProducts path='lists' />} />
        <Route path="/lists/:id/update/:product_id" element={<CreateOrUpdateProducts path='lists' />} />
        <Route path="/supermarkets" element={<Supermarkets />} />
        <Route path="/supermarkets/:id" element={<Products path='supermarkets' />} />
        <Route path="/supermarkets/create" element={<CreateOrUpdateSupermarket />} />
        <Route path="/supermarkets/update/:id" element={<CreateOrUpdateSupermarket />} />
        <Route path="/supermarkets/:id/create" element={<CreateOrUpdateProducts path='supermarkets' />} />
        <Route path="/supermarkets/:id/update/:product_id" element={<CreateOrUpdateProducts path='supermarkets' />} />
        <Route path="/reciepts" element={<Reciepts />} />
        <Route path="/reciepts/:id" element={<Products path='reciepts' />} />
        <Route path="/reciepts/create" element={<CreateOrUpdateReciept />} />
        <Route path="/reciepts/update/:id" element={<CreateOrUpdateReciept />} />
        <Route path="/reciepts/:id/create" element={<CreateOrUpdateProducts path='reciepts' />} />
        <Route path="/reciepts/:id/update/:product_id" element={<CreateOrUpdateProducts path='reciepts' />} />
        <Route path="/qrcode" element={<QRCode />} />
        <Route path="/barcode" element={<Barcode />} />
        <Route path="/camera" element={<Camera />} />
        <Route path='/settings' element={<Settings />} />
      </Route>
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-use" element={<TermsOfUse />} />
      <Route path="*" element={<Error />} />
    </Routes>
  )
}

export default Router
