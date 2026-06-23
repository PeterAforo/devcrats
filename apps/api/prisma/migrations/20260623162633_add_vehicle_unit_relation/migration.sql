-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;
