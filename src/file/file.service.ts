import { BadRequestException, Injectable } from '@nestjs/common';
import { createWriteStream, existsSync, unlinkSync } from 'fs';
import { extname } from 'path';

@Injectable()
export class FileService {
  async saveImage(
    image: {
      createReadStream: () => any;
      filename: string;
      mimetype: string;
    },
    nameFolder: string,
  ): Promise<string> {
    if (!image || !['image/jpeg'].includes(image.mimetype)) {
      throw new BadRequestException({ formatImage: 'Invalid format for image' });
    }
    const imageName = `${Date.now()}${extname(image.filename)}`;
    const imagePath = `/${nameFolder}/${imageName}`
    const stream = image.createReadStream()
    const outputPath = `public${imagePath}`
    const writeStream = createWriteStream(outputPath)
    stream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      stream.on('end', resolve)
      stream.on('error', reject)
    })

    return imagePath
  }

  async deleteImage(imagePath: string) {
    const imagePathToDelete = `public${imagePath}`
    if (existsSync(imagePathToDelete)) {
      unlinkSync(imagePathToDelete)
    }
  }
}
