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
    const { NETWORK_IFACE } = process.env;
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
  }
};
