// import { PrismaClient } from "@prisma/client";
// import express from "express";
// import adapter from "../../database/prisma";
// import { databaseErrorResponse } from "../../utils/constants";
// import { ProductSupermarket } from "../../entities/ProductSupermarket";
// import { Supermarket } from "../../entities/Supermarket";
import { APIRouter } from "../../entities/APIRouter";
const router = new APIRouter();

router.get("/", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const supermarkets = await prisma.supermarket.findMany({});
  //   res.send({ status: true, data: { supermarkets } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.post("/", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const data = Supermarket.parse(req.body).toEntity()
  //   const supermarket = await prisma.supermarket.create({ data });
  //   res.send({ status: true, message: 'Supermercado cadastrado com sucesso!', data: { supermarket } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.put("/:id", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id } = req.params;
  //   const data = Supermarket.parse(req.body).toEntity()
  //   const supermarket = await prisma.supermarket.update({ data, where: { id }});
  //   res.send({ status: true, message: 'Supermercado atualizado com sucesso!', data: { supermarket } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.delete("/:id", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id } = req.params;
  //   const supermarket = await prisma.supermarket.delete({ where: { id }});
  //   res.send({ status: true, message: 'Supermercado removido com sucesso!', data: { supermarket } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.get("/:id", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id } = req.params;
  //   const supermarket = await prisma.supermarket.findUnique({
  //     where: { id },
  //     include: { products: true },
  //   });
  //   res.send({ status: true, data: { supermarket } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.get("/:id/product", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id: supermarket_id } = req.params;
  //   const products = await prisma.productSupermarket.findMany({
  //     where: { supermarket_id },
  //   });
  //   res.send({ status: true, data: { products } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.post("/:id/product", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id: supermarket_id } = req.params;
  //   const content = (Array.isArray(req.body) ? req.body : [req.body]).map(
  //     (item) => Object.assign(item, { supermarket_id })
  //   );
  //   const data = content.map(ProductSupermarket.parse).map((e) => e.toEntity());
  //   const products = await prisma.productSupermarket.createMany({ data });
  //   res.send({ status: true, data: { products } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.put("/:id/product/:id_product", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id: supermarket_id, id_product: id } = req.params;
  //   const data = ProductSupermarket.parse(req.body).toEntity()
  //   const product = await prisma.productSupermarket.update({ data, where: { id, supermarket_id }})
  //   res.send({ status: true, data: { product } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.delete("/:id/product/:id_product", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { id: supermarket_id, id_product: id } = req.params;
  //   const product = await prisma.productSupermarket.delete({ where: { id, supermarket_id }})
  //   res.send({ status: true, data: { product } });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

router.get("/:id/product/:barcode", async () => {
  // const prisma = new PrismaClient({ adapter });

  // try {
  //   const { barcode } = req.params;
  //   const product = await prisma.productSupermarket.findFirst({
  //     where: { barcode: { contains: barcode } },
  //   });
  //   const rest = product ? { data: { product } } : {};
  //   res.send({
  //     status: true,
  //     message: product
  //       ? "Produto encontrado na base de dados"
  //       : "Produto não encontrado na base de dados",
  //     ...rest,
  //   });
  // } catch (e) {
  //   res.send(databaseErrorResponse(e instanceof Error ? e?.message : ""));
  // }
})

export default router;
