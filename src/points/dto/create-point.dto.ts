import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsDate } from "class-validator";

export class CreatePointDto {
  @IsString()
  @ApiProperty({
    example: "023c1f03-94c3-4c39-91f2-8f69318f86c7",
    description: "UAV identifier",
  })
  readonly uid: string;

  @IsDate()
  @ApiProperty({
    example: "Sun, 11 Sep 2022 14:58:16 GMT",
    description: "UTC Time",
  })
  readonly timestamp: Date;

  @IsNumber()
  @ApiProperty({ example: `+15.9`, description: "UAV Altitude (±AAA.AAA)" })
  readonly altitude: string;

  @IsString()
  @ApiProperty({
    example: `+123456.7`,
    description: "UAV Lattitude (±DDMMSS.SSSS)",
  })
  readonly lattitude: string;

  @IsString()
  @ApiProperty({
    example: `-0985432.1`,
    description: "UAV Longtitute (±DDDMMSS.SSSS)",
  })
  readonly longtitute: string;
}
