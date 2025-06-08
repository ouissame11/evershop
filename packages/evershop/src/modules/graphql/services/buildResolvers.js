import path from 'path';
import url from 'url';
import { loadFiles } from '@graphql-tools/load-files';
import { mergeResolvers } from '@graphql-tools/merge';
import { getEnabledExtensions } from '../../../bin/extension/index.js';
import { CONSTANTS } from '../../../lib/helpers.js';

export async function buildResolvers(isAdmin = false) {
  const resolverSources = [
    path.join(CONSTANTS.MODULESPATH, '*/graphql/types/**/*.resolvers.{js,ts}')
  ];

  const extensions = getEnabledExtensions();
  extensions.forEach((extension) => {
    resolverSources.push(
      path.join(extension.path, 'graphql/types/**/*.resolvers.{js,ts}')
    );
  });

  const resolvers = mergeResolvers(
    await loadFiles(resolverSources, {
      ignoredExtensions: isAdmin
        ? []
        : ['.admin.resolvers.js', '.admin.resolvers.ts'],
      requireMethod: async (filePath) => {
        const mod = await import(url.pathToFileURL(filePath));
        return mod;
      }
    })
  );

  return resolvers;
}
