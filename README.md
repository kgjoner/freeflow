# Free Flow

> A drag and drop app to build flowcharts.

![Images of how the pages look like](/assets/img/git-presentation.png)


## Packages

* Nuxt
* Dom-to-Image
* Bootstrap-Vue
* Nuxt-Fontawesome


## Overview

It is a simple static app, no backend needs. It began as a personal project to explore dynamic components, data flow and scalability, and it still lacks responsiveness.

As a common drag and drop app, it is pretty intuitive: the user can build the flowchart selecting the shapes and modelling them as they wish.

The state is constantly saved on local storage, so if the user closes the browser, when they come back their work will not be lost.


## Functions

* Drag shapes;
* Resize them;
* Type inside them;
* Lock/unlock their aspect ratio;
* Pick font size and color;
* Pick a background color;
* Pick border width, style and color;
* Copy an element;
* Align two elements horizontally/vertically;
* Build an arrow between two existing elements;
* Pick an arrow path;
* Label an arrow;
* Drag a label tag along its arrow body;
* Resize canvas, either by typing the new values in the size box or by dragging an element beyond the borders;
* Download the flowchart image as png;
* Autosave the canvas on local storage each 30 seconds;
* Check for a saved state in each new access to the website and load it;
* Clear the canvas;


## Folder Structure

```
 /api
 |   /state.js
 /assets
 |   /css
 |   |   /...
 |   /img
 |   |   /...
 /components
 |   /build
 |   |   /Component.vue
 |   |   /...
 |   /canvas
 |   |   /Component.vue
 |   |   /...
 |   /tools
 |   |   /Component.vue
 |   |   /...
 |   /nav.vue
 /layouts
 |   /default.vue
 /pages
 |   /index.vue
 /server
 |   /index.js
 /static
 |   favicon.ico
 /store
 |   arrow.js
 |   block.js
 |   canvas.js
 |   index.js
 |   mailer.js
```


## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run dev
```

### Compiles and generate static page
```
npm run generate
```
