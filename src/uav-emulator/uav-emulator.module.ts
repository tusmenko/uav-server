import { Module } from "@nestjs/common";
import { UavEmulatorService } from "./uav-emulator.service";

@Module({
  providers: [UavEmulatorService],
})
export class UavEmulatorModule {}
