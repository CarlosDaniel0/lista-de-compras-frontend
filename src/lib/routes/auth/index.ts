import { CredentialResponse } from '@react-oauth/google'
import { APIRouter } from '../../entities/APIRouter'
import { databaseErrorResponse } from '../../utils'
import { SQLite } from '../../entities/SQLite'
import { UserData } from '../../entities/UserData'
const router = new APIRouter()

router.post('/', async (req, res, channel) => {
  const sqlite = new SQLite(channel)
  try {
    const credential: CredentialResponse = req.body
    let user = await sqlite.user.findFirst({})

    const data = UserData.parse(req.body)
    if (!user?.id) {
      user = await sqlite.user.create({
        data: data.toEntity()
      })
    }
    else {
      await sqlite.user.delete({})
      user = await sqlite.user.create({
        data: user
      })
    }

    res.send({
      status: !!user,
      data: {
        user: user
          ? Object.assign(
              user,
              { token: credential.credential }
            )
          : null,
      },
    })
  } catch (e) {
    res.send(databaseErrorResponse(e instanceof Error ? e?.message : ''))
  }
})

export default router
