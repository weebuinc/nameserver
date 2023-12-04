# Changelog

All notable changes to this project will be documented in this file.<br/>
The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).<br/><br/>

## [1.3.0](https://github.com/weebuinc/nameserver/tree/v1.3.0) [FEATURE] Added Support for DNS-over-HTTPS (DoH) (2023-12-04)

- added the `createHttpServer()` function that creates a service with logic that handles DoH.
- added the `SSL_ENABLED` environment variable that indicates whether or not to enable SSL.
- added the `SSL_CA` environment variable that provides the certificate authority public certificate.
- added the `SSL_CERT` environment variable that provides the server public certificate.
- added the `SSL_KEY` environment variable that provides the server private key.
- added the `getBinaryPacket()` utility function to extract the `dns` packet from the binary body of http request.
- added the `sendBinaryPacket()` utility function to send the `dns` packet as binary to the client socket.
- added the `sendStatus()` utility function to send a status code to the client socket.
- added the `iface.getHttpPort()` method to provide the http port.
- added the `start-http-server` script to launch the DoH server.

<br/>

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
