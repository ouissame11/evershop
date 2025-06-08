import path from 'path';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
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

  // Extraire le contenu textuel des typeDefs pour vérifier la présence de "type Query"
  const typeDefsStr = typeof mergedTypeDefs === 'string'
    ? mergedTypeDefs
    : mergedTypeDefs.loc?.source.body || mergedTypeDefs.join(' ');

  // Ajouter un type Query vide si non présent
  if (!typeDefsStr.includes('type Query')) {
    mergedTypeDefs = mergeTypeDefs([
      mergedTypeDefs,
      `type Query { _empty: String }`
    ]);
  }

  return mergedTypeDefs;
}
