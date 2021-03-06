# Meepo

[![Build Status](https://travis-ci.org/elipskiy/shri-team-2-elipskiy.svg?branch=master)](https://travis-ci.org/elipskiy/shri-team-2-elipskiy)
[![Dependencies](https://david-dm.org/elipskiy/shri-team-2-elipskiy.png)](https://david-dm.org/elipskiy/shri-team-2-elipskiy)
[![](https://reposs.herokuapp.com/?path=elipskiy/shri-team-2-elipskiy)](https://github.com/ruddfawcett/reposs)


Awesome online code editor that lets people collaborate in real-time.

## Сделано за последние 2 недели:

* Смена темы сайта
* Смена языка редактора
* Авторизация с помощью Github
* Подгружается gravatar
* Изменены некоторые стили ace editor
* Добавлен чат
* Добавлена возможность сохранения чужих проектов в список своих проектов
* Добавлено удаление проектов
* Добавлена возможность смены пароля
* Добавлена возможность изменения отображаемого имени
* Сервер разбит на модули
* Усовершенствована вёрстка по БЭМу
* Имплементация gulp задачи по сборке картинок
* Добавлены тесты

## Вклад в проект:

##### Сервер:
* Подключена бд(mongo)
* Регистрация/авторизация пользователей
* Создание проектов
* Цвета пользователей
* Реализация сокет соединения
* Дописаны тесты root и user для работы с бд
* Деплой

##### Клиент:
* Вёрстка index, profile, projects, signin/signup страниц
* Вёрстка блоков и логика некоторых
* Цветовая схема сайта
* Цвета пользователей
* Отображение курсоров других пользователй

## Installing

App development depends on npm, the Node package manager, which is distributed with Node.js. If you haven't done so already, be sure to [download](http://nodejs.org/download/) and run the prebuilt Node.js installer for your platform from the Node.js website. Then, to run app locally, follow these steps:

1. Clone the app [GitHub repo](https://github.com/elipskiy/shri-team-2-elipskiy) in your desktop.
2. Use your command line tool to navigate to the cloned app directory and install the modules required to run the demo:

   ```
   cd shri-team-2-elipskiy
   npm update
   ```

3. Install [gulp](http://gulpjs.com/) globally:

   ```
   npm install -g gulp
   ```

4. Install [mongodb](http://www.mongodb.org/downloads)

## Running

Run mongo:

```
mongod
```

Run server:

```
npm start
```

The app should start on [http://localhost:3000/](http://localhost:3000/)

Run server in debug mode:

```
npm run dev
```

The app should start on [http://localhost:3000/](http://localhost:3000/)

## Testing

Just run in console:
```
npm test
```


## Reports

Now we have code analysis and test coverage reports.

Just run in console:
```
npm run report
```
 See `report` folder.


## Team: Muffin Commandos

| <img alt="Egor Lipskiy" src="https://avatars1.githubusercontent.com/u/2931416?s=70" width="70"> | <img alt="Alexander Sologub" src="https://avatars0.githubusercontent.com/u/902788" width="70"> | <img alt="Dmitry" src="https://avatars1.githubusercontent.com/u/1198848?s=70" width="70"> |
|---|---|---|
| [elipskiy](https://github.com/elipskiy) | [marvelousNinja](https://github.com/marvelousNinja) | [Semigradsky](https://github.com/Semigradsky) |
