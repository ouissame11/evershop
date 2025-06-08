import path from 'path';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { print } from 'graphql';  // <- importer print pour convertir AST en string
import { getEnabledExtensions } from '../../../bin/extension/index.js';
import { CONSTANTS } from '../../../lib/helpers.js';

export function buildTypeDefs(isAdmin = false) {
  const typeSources = [
    path.join(CONSTANTS.MODULESPATH, '*/graphql/types/**/*.graphql')
  ];

  const extensions = getEnabledExtensions();
  extensions.forEach((extension) => {
    typeSources.push(path.join(extension.path, 'graphql/types/**/*.graphql'));
  });

  const loadedDefsArrays = typeSources.map((source) =>
    loadFilesSync(source, {
      ignoredExtensions: isAdmin ? [] : ['.admin.graphql']
    })
  );

  let mergedTypeDefs = mergeTypeDefs(loadedDefsArrays);

  // Convertir mergedTypeDefs AST en string SDL avec print
  const typeDefsStr = typeof mergedTypeDefs === 'string'
    ? mergedTypeDefs
    : print(mergedTypeDefs);

  // Ajouter un type Query vide si non présent
  if (!typeDefsStr.includes('type Query')) {
    mergedTypeDefs = mergeTypeDefs([
      mergedTypeDefs,
      `type Query { _empty: String }`
    ]);
  }

  return mergedTypeDefs;
}
