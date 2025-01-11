import { APIRouter } from "../../entities/APIRouter";
const router = new APIRouter();

router.get("/", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const lists = await prisma.list.findMany({});
  //   res.send({ status: true, data: { lists } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
});

router.post("/", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const data = List.parse(req.body).toEntity()
  //   const list = await prisma.list.create({ data });
  //   res.send({ status: true, message: 'Lista Criada com sucesso!', data: { list } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.put("/:id", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id } = req.params;
  //   const data = List.parse(req.body).toEntity()
  //   const list = await prisma.list.update({ data, where: { id }});
  //   res.send({ status: true, message: 'Lista alterada com sucesso!', data: { list } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.delete("/:id", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id } = req.params;
  //   const list = await prisma.list.delete({ where: { id }});
  //   res.send({ status: true, message: 'Lista removida com sucesso!', data: { list } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.get("/:id", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id } = req.params
  //   const list = await prisma.list.findUnique({ where: { id }, include: { products: true }});
  //   res.send({ status: true, data: { list } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
});

router.get("/:id/product", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id: list_id } = req.params;
  //   const products = await prisma.productList.findMany({ where: { list_id } });
  //   res.send({ status: true, data: { products } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.post("/:id/product", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id: list_id } = req.params;
  //   const content = (Array.isArray(req.body) ? req.body : [req.body]).map((e) =>
  //     Object.assign(e, { list_id })
  //   );
  //   const data = content.map(ProductList.parse).map((e) => e.toEntity());
  //   const product = await prisma.productList.createMany({ data });
  //   res.send({ status: true, data: { product } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.get("/:id/product/:id_product", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id: list_id, id_product: id } = req.params;
  //   const product = await prisma.productList.findFirst({ where: { id, list_id }})
  //   res.send({ status: true, data: { product } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.put("/:id/product/:id_product", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id: list_id, id_product: id } = req.params;
  //   const product = await prisma.productList.findFirst({ where: { id, list_id }})
  //   res.send({ status: true, data: { product } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.put("/:id/product/:id_product", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id: list_id, id_product: id } = req.params;
  //   const data = ProductList.parse(req.body).toEntity()
  //   const product = await prisma.productList.update({ data, where: { id, list_id }})
  //   res.send({ status: true, data: { product } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.delete("/:id/product/:id_product", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id: list_id, id_product: id } = req.params;
  //   const product = await prisma.productList.delete({ where: { id, list_id }})
  //   res.send({ status: true, data: { product } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

export default router;
