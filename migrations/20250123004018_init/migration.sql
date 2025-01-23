-- CreateTable
CREATE TABLE "Supermarket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "sync" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Wholesale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "min_quantity" DECIMAL NOT NULL,
    "price" DECIMAL NOT NULL,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "sync" BOOLEAN NOT NULL DEFAULT false,
    "product_id" TEXT NOT NULL,
    CONSTRAINT "Wholesale_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ProductSupermarket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Coordinates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lat" REAL NOT NULL,
    "long" REAL NOT NULL,
    "supermarket_id" TEXT NOT NULL,
    CONSTRAINT "Coordinates_supermarket_id_fkey" FOREIGN KEY ("supermarket_id") REFERENCES "Supermarket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductSupermarket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "unity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "barcode" TEXT,
    "price" DECIMAL NOT NULL,
    "last_update" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "sync" BOOLEAN NOT NULL DEFAULT false,
    "supermarket_id" TEXT NOT NULL,
    CONSTRAINT "ProductSupermarket_supermarket_id_fkey" FOREIGN KEY ("supermarket_id") REFERENCES "Supermarket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "List" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "sync" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "List_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "unity" TEXT,
    "quantity" REAL NOT NULL,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "sync" BOOLEAN NOT NULL DEFAULT false,
    "list_id" TEXT NOT NULL,
    "product_id" TEXT,
    "supermarket_id" TEXT,
    CONSTRAINT "ProductList_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ProductSupermarket" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProductList_supermarket_id_fkey" FOREIGN KEY ("supermarket_id") REFERENCES "Supermarket" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProductList_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "List" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reciept" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL NOT NULL,
    "discount" DECIMAL NOT NULL,
    "supermarket_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "sync" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Reciept_supermarket_id_fkey" FOREIGN KEY ("supermarket_id") REFERENCES "Supermarket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reciept_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductReciept" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "index" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "price" DECIMAL NOT NULL,
    "total" DECIMAL NOT NULL,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "sync" BOOLEAN NOT NULL DEFAULT false,
    "receipt_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    CONSTRAINT "ProductReciept_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "Reciept" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductReciept_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ProductSupermarket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "picture" TEXT
);

-- CreateTable
CREATE TABLE "Tables" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "sync" BOOLEAN NOT NULL DEFAULT true
);

-- CreateIndex
CREATE UNIQUE INDEX "Wholesale_product_id_key" ON "Wholesale"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "Coordinates_supermarket_id_key" ON "Coordinates"("supermarket_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
