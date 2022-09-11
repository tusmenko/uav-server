import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { PointsService } from "./points.service";
import { CreatePointDto } from "./dto/create-point.dto";
import { Point } from "./entities/data.entity";

@ApiBearerAuth()
@ApiTags("points")
@Controller("points")
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Post()
  @ApiOperation({ summary: "Populate uav position" })
  @ApiResponse({
    status: 200,
  })
  async create(@Body() createPointDto: CreatePointDto): Promise<Point> {
    return this.pointsService.create(createPointDto);
  }

  @Get(":data")
  @ApiOperation({
    summary:
      "Endpoint to test the data population via Sockets. The data will be sent to all clients",
  })
  @ApiResponse({
    status: 200,
  })
  test(@Param("data") data: string): void {
    this.pointsService.test(data);
  }
}
