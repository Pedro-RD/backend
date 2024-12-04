import { PipeTransform, Injectable, ArgumentMetadata, ForbiddenException, Logger } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
    logger = new Logger('FileSizeValidationPipe');
    transform(value: any, metadata: ArgumentMetadata) {
        // "value" is an object containing the file's attributes and metadata
        // check if file size is less than 1MB and png or jpg or jpeg
        this.logger.log(`Incoming file: ${JSON.stringify(value)} with metadata: ${JSON.stringify(metadata)}`);

        if (!value) {
            throw new ForbiddenException('Arquivo não encontrado');
        }

        const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
        if (!allowedMimeTypes.includes(value.mimetype)) {
            this;
            throw new ForbiddenException('Formato de arquivo inválido. Apenas PNG, JPG e JPEG são permitidos');
        }

        if (value.size > 1000000) {
            throw new ForbiddenException('Tamanho máximo permitido é 1MB');
        }

        return value;
    }
}
