-- CreateTable
CREATE TABLE "refresh_tokke
s" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokke
s_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokke
s_user_id_key" ON "refresh_tokke
s"("user_id");

-- AddForeignKey
ALTER TABLE "refresh_tokke
s" ADD CONSTRAINT "refresh_tokke
s_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
