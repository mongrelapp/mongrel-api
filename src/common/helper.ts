import { extension } from 'mime-types';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as uuid from 'uuid';
import { unlinkSync } from 'fs';
import { Logger } from '@nestjs/common';
import { storagePath } from './constants';

export const storeAsSync = (dir: string, file: IUploadedFile) => {
  const fileName = `${dir}/${uuid.v4()}.${extension(file.mimetype)}`;

  // create public dir
  const publicDirExists = existsSync('public');
  if (!publicDirExists) mkdirSync('public');

  // create storage dir
  const storageDirExists = existsSync(storagePath);
  if (!storageDirExists) mkdirSync(storagePath);

  // create provided dir
  const exists = existsSync(`${storagePath}/${dir}`);
  if (!exists) mkdirSync(`${storagePath}/${dir}`);

  // save
  try {
    writeFileSync(`${storagePath}/${fileName}`, file.buffer);
    return fileName;
  } catch (error) {
    Logger.log(error.message);
  }
};

export const unlinkFile = async (filename: string) => {
  try {
    unlinkSync(storagePath + `/${filename}`);
  } catch (error) {
    Logger.log(error.message);
  }
};
