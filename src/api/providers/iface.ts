import { networkInterfaces, NetworkInterfaceInfo } from 'os';

type NetworkInterface = NetworkInterfaceInfo & Record<'name', string>;
export const iface = {
  getInterfaces() {
    const interfaces = networkInterfaces();
    return Object.keys(interfaces).reduce((list, name) => {
      list.push(...interfaces[name].map(item => ({ name, ...item })));
      return list;
    }, new Array<NetworkInterface>());
  },
  getIp(version: 'v4' | 'v6' = 'v4') {
    const { BIND_HOST, NETWORK_IFACE } = process.env;
    if (BIND_HOST) {
      return BIND_HOST;
    }
    const interfaces = networkInterfaces();
    const information = interfaces[NETWORK_IFACE];
    const family = `IP${version}`;
    if (information?.length > 0) {
      for (const info of information) {
        if (info.family === family) {
          return info.address;
        }
      }
    }
  },
  getPort() {
    return parseInt(process.env.BIND_PORT || '53');
  }
};
