import { APIRouter } from "../../entities/APIRouter";
const router = new APIRouter();

router.post("/", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const credential = CredentialResponse.parse(req.body);

  //   let user = await prisma.user.findFirst({
  //     where: {
  //       email: credential.user?.email,
  //       name: credential.user?.name,
  //     },
  //   });
  //   if (!user && credential.user) {
  //     user = await prisma.user.create({
  //       data: credential.user.toEntity(),
  //     });
  //   }

  //   res.send({
  //     status: true,
  //     data: {
  //       user: Object.assign(user ?? {}, { token: credential.credential }),
  //     },
  //   });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
});

export default router;