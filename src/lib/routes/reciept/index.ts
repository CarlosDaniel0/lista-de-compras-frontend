import { APIRouter } from "../../entities/APIRouter";
const router = new APIRouter();

router.get("/", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const reciepts = await prisma.reciept.findMany({});
  //   res.send({ status: true, data: { reciepts } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
});

router.post("/", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const data = Reciept.parse(req.body).toEntity();
  //   const reciept = await prisma.reciept.create({ data });
  //   res.send({ status: true, message: 'Comprovante cadastrado com sucesso!', data: { reciept } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.put("/:id", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id } = req.params;
  //   const data = Reciept.parse(req.body).toEntity()
  //   const reciept = await prisma.reciept.update({ data, where: { id }});
  //   res.send({ status: true, message: 'Comprovante atualizado com sucesso!', data: { reciept } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.delete("/:id", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id } = req.params;
  //   const reciept = await prisma.reciept.delete({ where: { id }});
  //   res.send({ status: true, message: 'Comprovante removido com sucesso!', data: { reciept } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.get("/:id", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id } = req.params;
  //   const reciept = await prisma.reciept.findUnique({
  //     where: { id },
  //     include: { products: true },
  //   });
  //   res.send({ status: true, data: { reciept } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
});

router.get("/:id/product", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id: receipt_id } = req.params; 
  //   const products = await prisma.productReciept.findMany({ where: { receipt_id }});
  //   res.send({ status: true, data: { products } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
});

router.post("/:id/product", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id: receipt_id } = req.params;
  //   const content = (Array.isArray(req.body) ? req.body : [req.body]).map((e) =>
  //     Object.assign(e, { receipt_id })
  //   );
  //   const data = content.map(ProductReciept.parse).map((e) => e.toEntity());
  //   const product = await prisma.productReciept.createMany({ data });
  //   res.send({ status: true, message: 'Produto cadastrado com sucesso!', data: { product } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
});

router.get("/:id/product/:id_product", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id: receipt_id, id_product: id } = req.params;
  //   const product = await prisma.productReciept.findFirst({ where: { id, receipt_id }})
  //   res.send({ status: true, data: { product } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.put("/:id/product/:id_product", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id: receipt_id, id_product: id } = req.params;
  //   const data = ProductReciept.parse(req.body).toEntity()
  //   const product = await prisma.productReciept.update({ data, where: { id, receipt_id }})
  //   res.send({ status: true, message: 'Produto atualizado com sucesso!', data: { product } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.delete("/:id/product/:id_product", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id: receipt_id, id_product: id } = req.params;
  //   const product = await prisma.productReciept.delete({ where: { id, receipt_id }})
  //   res.send({ status: true, message: 'Produto removido com sucesso!', data: { product } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

export default router;
