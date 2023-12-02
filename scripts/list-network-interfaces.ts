import { table } from 'table';
import { Matrix } from 'lib/types';
import { iface } from 'api/providers';

type Matrix2D = Matrix.Matrix2D;

function run() {
  try {
    const interfaces = iface.getInterfaces();

    const data: Matrix2D = [];

    // adding headers
    data.push(['SCOPE', 'NAME', 'MAC', 'FAMILY', 'ADDRESS']);

    for (const info of interfaces) {
      data.push([info.scopeid, info.name, info.mac, info.family, info.address]);
    }

    console.info(table(data));
  } catch (err) {
    console.error(err);
  }
}

run();
