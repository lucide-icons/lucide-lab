#!/usr/bin/env bun
import { $, write } from "bun"
import { readdir, unlink } from 'node:fs/promises';

const mainLibraryIconFileNames = await readdir('../lucide/icons');
const labLibraryIconFileNames = await readdir('./icons');

const filterSvgs = (fileName) => fileName.endsWith('.svg')

// const fileNamesWithoutExtension = fileNames.map((fileName) => fileName.split('.')[0]);
const mainLibraryIcons = mainLibraryIconFileNames.filter(filterSvgs).map((fileName) => fileName.split('.')[0])
const labLibraryIcons = labLibraryIconFileNames.filter(filterSvgs).map((fileName) => fileName.split('.')[0])

for (const icon of mainLibraryIcons) {
  console.log(icon);
  try {
    await unlink(`./icons/${icon}.svg`)
    await unlink(`./icons/${icon}.json`)
  } catch (error) {
    
  }
}
