import { logger } from '../../../../../logger';
import { detectPlatform } from '../../../../../modules/platform/util';
import * as allVersioning from '../../../../../modules/versioning';
import type { BranchUpgradeConfig } from '../../../../types';
import * as sourceGithub from './source-github';
import * as sourceGitlab from './source-gitlab';
import type { ChangeLogResult } from './types';

export * from './types';

const cache: Record<string, ChangeLogResult | null> = {};

export async function getChangeLogJSON(
  config: BranchUpgradeConfig
): Promise<ChangeLogResult | null> {
  const { sourceUrl, versioning, currentVersion, newVersion } = config;
  try {
    if (!(sourceUrl && currentVersion && newVersion)) {
      return null;
    }
    const version = allVersioning.get(versioning);
    if (version.equals(currentVersion, newVersion)) {
      return null;
    }
    const key = `${sourceUrl} (${currentVersion} -> ${newVersion})`;
    if (cache[key]) {
      return cache[key];
    }

    logger.debug(`Fetching changelog: ${key}`);

    let res: ChangeLogResult | null = null;

    const platform = detectPlatform(sourceUrl);

    switch (platform) {
      case 'gitlab':
        res = await sourceGitlab.getChangeLogJSON(config);
        break;
      case 'github':
        res = await sourceGithub.getChangeLogJSON(config);
        break;

      default:
        logger.info(
          { sourceUrl, hostType: platform },
          'Unsupported platform, skipping changelog fetching.'
        );
        break;
    }

    cache[key] = res;

    return res;
  } catch (err) /* istanbul ignore next */ {
    logger.error({ config, err }, 'getChangeLogJSON error');
    return null;
  }
}
