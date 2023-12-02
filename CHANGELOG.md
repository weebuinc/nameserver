# Changelog

All notable changes to this project will be documented in this file.<br/>
The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).<br/><br/>

## [1.1.0](https://github.com/weebuinc/nameserver/tree/v1.1.0) [FEATURE] Full DNS Functional (2023-12-02)

- Introduced the `sqlite3` self contained database for the `dns`.
- Introduced the `network interface` feature that allows the `dns` to determine which IP to bind itself to.
- Introduced the `query forwarding` feature that enables unresolved `dns` query to be forwarded to external name servers.
- Introduced the `record resolution` feature for `A` records.
