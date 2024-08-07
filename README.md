# ZeroChess

[![Build][build-badge]][build-link]
[![License][license-badge]][license-link]
[![Release][release-badge]][release-link]

This desktop application is designed to analyze the accuracy of chess moves by evaluating games imported from the Lichess online platform using the open-source Stockfish engine.

The analysis provides insights into performance across various game rhythms, against different types of opponents, and when playing as specific pieces, among other detailed statistics.

## Installation

To set up ZeroChess, clone the repository and install dependencies:

```bash
  git clone --depth 1 --branch main https://github.com/OscarDavilaSampedro/zerochess.git
  cd zerochess
  npm install
```

## Starting development

To start the application in the development environment, use:

```bash
  npm start
```

## Packaging for production

To package the application for your local platform, run:

```bash
  npm run package
```

## Author

- [@OscarDavilaSampedro](https://github.com/OscarDavilaSampedro)

## License

This work is licensed under a [MIT License][license-link].

[build-link]: https://github.com/OscarDavilaSampedro/zerochess/actions/workflows/test.yml
[license-link]: https://github.com/OscarDavilaSampedro/zerochess/blob/main/LICENSE
[release-link]: https://github.com/OscarDavilaSampedro/zerochess/releases/latest

[build-badge]: https://img.shields.io/github/actions/workflow/status/OscarDavilaSampedro/zerochess/test.yml?&style=for-the-badge&label=ZeroChess&logo=github
[license-badge]: https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge&color=success
[release-badge]: https://img.shields.io/github/v/tag/OscarDavilaSampedro/zerochess?style=for-the-badge&label=latest%20release
