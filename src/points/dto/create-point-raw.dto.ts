import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsBoolean, IsDecimal } from "class-validator";

export class CreatePointRawDto {
  @IsString()
  @ApiProperty({
    example: "023c1f03-94c3-4c39-91f2-8f69318f86c7",
    description: "UAV unique identifier",
  })
  readonly uuid: string;

  @IsString()
  @ApiProperty({
    example: "drone",
    description: "UAV icon",
  })
  readonly symbol: string;

  @IsString()
  @ApiProperty({
    example: "5552",
    description: "UAV identifier",
  })
  readonly droneid: string;

  @IsString()
  @ApiProperty({
    example: "Eleron-3",
    description: "Drone type",
  })
  readonly dronetype: string;

  @IsString()
  @ApiProperty({
    example: "0",
    description: "UAV identifier",
  })
  readonly networkaddress: string;

  @IsDecimal()
  @ApiProperty({ example: `+15.9`, description: "UAV Altitude (±AAA.AAA)" })
  readonly altitude: number;

  @IsDecimal()
  @ApiProperty({
    example: `+123456.7`,
    description: "UAV Lattitude (±DDMMSS.SSSS)",
  })
  readonly latitude: number;

  @IsDecimal()
  @ApiProperty({
    example: `-0985432.1`,
    description: "UAV Longtitute (±DDDMMSS.SSSS)",
  })
  readonly longitude: number;

  @IsNumber()
  @ApiProperty({
    example: 978,
    description: "UAV time in air",
  })
  readonly flighttime: number;

  @IsNumber()
  @ApiProperty({
    example: 90,
    description: "Expected UAV time left in air",
  })
  readonly remainingMinutes: number;

  @IsNumber()
  @ApiProperty({
    example: 1214,
    description: "Frequency used to transfer video stream",
  })
  readonly videoTxFreq: number;

  @IsDecimal()
  @ApiProperty({
    example: 303.1,
    description: "UAV direction in degrees",
  })
  readonly heading: number;

  @IsString()
  @ApiProperty({
    example: "16:49:06",
    description: "Time on UAV",
  })
  readonly uav_time: string;

  @IsNumber()
  @ApiProperty({
    example: 7151,
    description: "Distanse of UAV flight",
  })
  readonly distance: number;

  @IsDecimal()
  @ApiProperty({
    example: 0.7,
    description: "Azimuth",
  })
  readonly azimuth: number;

  @IsNumber()
  @ApiProperty({
    example: 60,
    description: "Stale",
  })
  readonly stale: number;

  @IsNumber()
  @ApiProperty({
    example: 1200,
    description: "Wipe",
  })
  readonly wipe: number;

  @IsBoolean()
  @ApiProperty({
    example: false,
    description: "IS UAV in danger state",
  })
  readonly danger: boolean;
}
