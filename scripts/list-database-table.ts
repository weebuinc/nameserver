import { inspect } from 'util';
import iq from 'inquirer';
import { table } from 'table';

import { Database, Matrix } from 'lib/types';
import { getBasename } from 'api/utils';
import { promptRepo, recordRepo, serverRepo, versionRepo } from 'api/repos';

type TableKey = Database.TableKey;
const { tables } = Database.Constants;
const key = getBasename(__filename);

interface Prompt {
  tableKey: TableKey;
}
async function run() {
  try {
    const prev = promptRepo.get<Prompt>(key) || ({} as Prompt);
    const filter = (value: TableKey, ans: Prompt) => {
      promptRepo.put(key, ans);
      return value;
    };

    const answers = await iq.prompt<Prompt>([
      {
        name: 'tableKey',
        type: 'list',
        choices: tables,
        message: `choose a table to list:`,
        default: prev.tableKey,
        filter
      }
    ]);

    const { tableKey } = answers;
    promptRepo.put(key, answers);

    if (tableKey === 'prompts') {
      const prompts = promptRepo.list();
      console.info(
        table(
          prompts.reduce(
            (matrix, prompt) => {
              matrix.push([prompt.key, inspect(JSON.parse(prompt.data), true, 100, true)]);
              return matrix;
            },
            [['KEY', 'DATA']]
          )
        )
      );
    } else if (tableKey === 'records') {
      const records = recordRepo.list();
      console.info(
        table(
          records.reduce(
            (matrix, record) => {
              matrix.push([record.name, record.type, record.address]);
              return matrix;
            },
            [['NAME', 'TYPE', 'ADDRESS']] as Matrix.Matrix2D
          )
        )
      );
    } else if (tableKey === 'servers') {
      const servers = serverRepo.list();
      console.info(
        table(
          servers.reduce(
            (matrix, server) => {
              matrix.push([server.address, server.priority]);
              return matrix;
            },
            [['ADDRESS', 'PRIORITY']] as Matrix.Matrix2D
          )
        )
      );
    } else if (tableKey === 'versions') {
      const versions = versionRepo.list();
      console.info(
        table(
          versions.reduce(
            (matrix, version) => {
              matrix.push([
                version.tag,
                version.description,
                version.script
                  ?.trim()
                  .split('\n')
                  .map(line => line.trim())
                  .join('\n')
              ]);
              return matrix;
            },
            [['TAG', 'DESCRIPTION', 'SCRIPT']]
          )
        )
      );
    }
  } catch (err) {
    console.error(err);
  }
}

run();
