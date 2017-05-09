This project integrate create-react-app with electron.It is easier to develope, build and package. This project is already include electron-builder so you can just run a command to pack your app.

# install

```shell

$ yarn

```

# develope

you can change react-server port by modify package.json's port.

```shell
$ yarn start ## pure react

$ yarn electron ## pure electron

## react and electron(auto run electron when react-server is start)
$ yarn electron-react

```

# electron with builded React

```shell
$ yarn electron:pro

```

# build

```shell
$ yarn build
```

# pack

Tips: you can speed up downloading the electron by modify package.json's electronMirror.
eg. `"electronMirror": `https://npm.taobao.org/mirrors/electron/` for china user.

This project is already include electron-builder.If you encounter native-module problems. check [multi-platform-build](https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build);

Any package problem, pls check this out.[electron-builder's doc](https://github.com/electron-userland/electron-builder).

> ps: this doc may take you a lots of time.

```shell 
$ yarn pack:all 
$ yarn pack:mac 
$ yarn pack:win 
$ yarn pack:linux 
```

# TroubleShooting

leave it to issue.