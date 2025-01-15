import { APIRouter } from "../entities/APIRouter"
import auth from './auth'
import list from './list'
import reciept from './reciept'
import supermarket from './supermarket'

const router = new APIRouter()

router.use('/auth', auth)
router.use('/lists', list)
router.use('/reciepts', reciept)
router.use('/supermarkets', supermarket)

export default router