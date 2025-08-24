🌀 HypnoMaze - A 3D Project Showcase
====================================

**HypnoMaze** is not just a portfolio; it's an immersive 3D experience. Navigate a dynamically generated, hypnotic maze to discover cool open-source projects, each waiting at a portal in the maze's dead ends.

### ✨ [**Live Demo: projects.divyeshvishwakarma.com**](https://www.google.com/search?q=https://projects.divyeshvishwakarma.com) ✨

🚀 Features
-----------

Feature

Description

Status

**Dynamic Maze**

A new maze is generated every time using a Depth-First Search algorithm. No two runs are the same!

✅ Complete

**Interactive Portals**

Every dead-end features a portal to a different project, complete with title, blurb, and a link.

✅ Complete

**Hypnotic Shaders**

Walls, floor, and ceiling are rendered with a mesmerizing, procedural shader that reacts to your movement.

✅ Complete

**First-Person Controls**

Smooth, intuitive controls (WASD to move, Mouse to look) make exploration seamless.

✅ Complete

**Mini-Map**

Feeling lost? Press M to toggle a mini-map and find your way.

✅ Complete

**Anti-Stick Physics**

A custom nudge mechanic prevents you from getting stuck in corners, ensuring smooth gameplay.

✅ Complete

🛠️ Getting Started Locally
---------------------------

Want to run your own version of HypnoMaze? It's easy!
```shell
git clone [https://github.com/divyesh1099/hypnomaze.git](https://github.com/divyesh1099/hypnomaze.git)

cd hypnomaze
    
npm install
    
npm run devYour local copy will be running at http://localhost:3000.
```    

🎨 Showcase Your Own Projects
-----------------------------

The best part about HypnoMaze is how easy it is to add your own projects.

1.  **Open the App.jsx file.**
    
2.  **Find the PROJECTS array** at the top of the file.
    
3.  **Add your project details** as a new object in the array. That's it!
    

```   // src/App.jsx  
const PROJECTS = [    // ... existing projects    {      title: 'Your Awesome Project',      url: '[https://github.com/your-username/your-repo](https://github.com/your-username/your-repo)',      blurb: 'A short, catchy description of what your project does.'    },    // ... more of your projects  ];
```

The maze will automatically create a portal for your new project.

🤝 Contributing
---------------

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://www.google.com/search?q=https://github.com/divyesh1099/hypnomaze/issues).

📜 License
----------

This project is open source and available under the [MIT License](https://www.google.com/search?q=LICENSE).