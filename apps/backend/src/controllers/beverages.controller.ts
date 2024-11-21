import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Put,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateBeverageRequest,
  CreateBeverageRequestSchama,
  GetBeverageRequest,
} from '@overtheairbrew/models';
import { Response } from 'express';
import { Public } from '../auth/public.decorator';
import { IdResponseDto } from '../id.response.dto';
import { BeveragesService } from '../services/beverages.service';
import { ZodBodyValidationPipe } from '../validation/validation.pipe';

@ApiTags('beverages')
@Controller('/beverages')
@ApiBearerAuth()
export class BeveragesController {
  constructor(private beveragesService: BeveragesService) {}

  @Post('/')
  @ApiCreatedResponse({
    type: IdResponseDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new ZodBodyValidationPipe(CreateBeverageRequestSchama))
  async createBeverage(
    @Body() body: CreateBeverageRequest,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'jpeg',
        })
        .addMaxSizeValidator({
          maxSize: 999999,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.beveragesService.createBeverage(body, file);
  }

  @Get('/')
  @ApiOkResponse({
    type: GetBeverageRequest,
    isArray: true,
  })
  async getAllBeverages() {
    return this.beveragesService.getAllBeverages();
  }

  @Get('/:beverageId')
  @ApiOkResponse({
    type: GetBeverageRequest,
  })
  async getOneBeverage(@Param('beverageId') beverageId: string) {
    return this.beveragesService.getOneBeverage(beverageId);
  }

  @Put('/:beverageId')
  @ApiNoContentResponse()
  @UsePipes(new ZodBodyValidationPipe(CreateBeverageRequestSchama))
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBeverage(
    @Param('beverageId') beverageId: string,
    @Body() body: CreateBeverageRequest,
  ) {
    return this.beveragesService.updateBeverage(beverageId, body);
  }

  @Get('/:beverageId/image')
  @Public()
  async getImage(
    @Param('beverageId') beverageId: string,
    @Res() res: Response,
  ) {
    const file = await this.beveragesService.getBeverageImage(beverageId);
    file.pipe(res);
  }
}
