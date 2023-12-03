# Changelog

All notable changes to this project will be documented in this file.<br/>
The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).<br/><br/>

## [1.2.0](https://github.com/weebuinc/nameserver/tree/v1.2.0) [FEATURE] Added Support for BIND_HOST and BIND_PORT Environment Variables (2023-12-02)

- modified the `iface.getIp()` method to return the `BIND_HOST` env if it exists.
- added the `iface.getPort()` method to return the `BIND_PORT` env or `53` if the env is not specified.
- modifyed the `createUdpServer()` function to utilize the `iface.getPort()` method for the default `port` parameter.

<br/>

## [1.1.0](https://github.com/weebuinc/nameserver/tree/v1.1.0) [FEATURE] Full DNS Functional (2023-12-02)

- introduced the `sqlite3` self contained database for the `dns`.
- introduced the `network interface` feature that allows the `dns` to determine which IP to bind itself to.
- introduced the `query forwarding` feature that enables unresolved `dns` query to be forwarded to external name servers.
- introduced the `record resolution` feature for `A` records.
