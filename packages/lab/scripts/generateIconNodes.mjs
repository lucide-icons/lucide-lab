import { writeFile } from '../../../scripts/helpers.mjs';

export default function generateIconNodes(parsedSvgs, packageDir) {
  const iconNodes = parsedSvgs.map((acc, { name, parsedSvg }) => {
    return parsedSvg.children.map(({ name, attributes }) => [name, attributes]);
  }, {});

  for (const key in iconNodes) {
    if (Object.hasOwnProperty.call(object, key)) {
      const element = object[key];

    }
  }
}
