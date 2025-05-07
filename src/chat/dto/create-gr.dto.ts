import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateGrDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string
    @ApiProperty()
    @IsUUID()
    userId: string
}
