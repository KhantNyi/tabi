# Tabi

A slow, no-fail, top-down pixel-art walk through Japan. Ride the train between districts, step inside shops and temples, talk to people, collect stamps and play a few small games along the way.

The first city is **Tokyo**. More cities will be added later.

Everything is drawn in code and the music is synthesized in the browser, so there are no image or audio files and no build step.

## Run it

Open `index.html` in a browser. That's all.

You can also serve the folder with any static server if you prefer, for example `npx serve .` or `python -m http.server`.

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Walk | Arrows / WASD | D-pad |
| Interact, talk, enter, confirm | E / Space / Enter | E |
| Stamp book | Tab / B | BOOK |
| Back out of menus and minigames | Esc | - |
| Music on/off | M | ♫ |
| New game (on the title screen) | N | - |

## Tokyo

There are eight districts on one train line: Shibuya, Harajuku, Shinjuku, Ueno, Asakusa, Akihabara, Tokyo Station and Tokyo Tower.

You can walk into 15 places, each with its own indoor screen: a ramen shop, two clothes shops, a crepe café, a yakitori bar, an observation deck, the Tokyo Tower deck, a game center, a figure shop, Senso-ji's main hall, the panda house, the museum, a department-store food hall and conveyor sushi.

There are 21 stamps to collect, along with capsule figures and cats to pet. The minigames are:

- a crane game
- conveyor sushi
- a capsule machine
- a fortune slip
- a fitting room, which changes your outfit

## Project layout

```
index.html              the page; loads the scripts below in order
src/
  engine/
    core.js             canvas at 2x pixel density, pixel drawing helpers, colours, the bitmap font
    audio.js            chiptune music tracks and sound effects (Web Audio)
    topdown.js          canvas setup, input, noise, people seen from front/back/side, panels
  art/
    sprites.js          reusable art: people, trees, roofs, temples, shops, towers, icons
  world/
    world.js            building a map: terrain, ground painter, roads, buildings, rooms,
                        furniture, NPCs, cars, plus the shared registries MAPS and CITIES
  cities/
    tokyo.js            Tokyo's districts, rooms, dialogue, stamps and landmark art
  game/
    minigames.js        crane, sushi, capsule, fortune, fitting room
    main.js             the game loop: walking, doors, train line, stamp book, saving, drawing
```

Scripts are plain classic `<script>` tags that share one global scope, which is why the game works when opened straight from disk. Keep the load order in `index.html`: engine, then art, then world, then cities, then game.

## Adding a city

1. Copy `src/cities/tokyo.js` to `src/cities/<city>.js` and keep it wrapped in its own function so its helpers stay private.
2. Add the city's districts and rooms to `MAPS`. Every id has to be unique across all cities because they share one table.
   - An outdoor district needs `name`, `sub`, `tw`/`th` (its size in 16px tiles), `music`, `lay()` to paint the terrain and `deco()` to place buildings and people.
   - A room needs `indoor: 1`, `name` and `deco()` that calls `room({...})`.
3. Register the city with `CITIES.<city> = { id, name, tagline, start, line, stamps, cats, sprites() }`. Here `line` lists the stations in order and `stamps` maps each stamp id to `[label, icon, district]`.
4. Add a `<script>` tag for it in `index.html` after `world.js`.

The game starts with the first registered city. To open a specific one, use `index.html?city=<id>`. Each city keeps its own save in `localStorage`.

## Debug URL parameters

| Parameter | Effect |
|---|---|
| `?map=asakusa&x=320&y=460` | start in a district or room at a position |
| `?st=book`, `?st=line`, `?st=ride` | open the stamp book, the train line or a train ride |
| `?mini=crane&mt=1` | open a minigame (`crane`, `sushi`, `gacha`, `omikuji`, `dress`); `mt` fast-forwards it by that many seconds |
| `?sim=6000&seed=3` | walk around at random for that many frames before showing the first frame, pressing E often |

If a script error happens, it is printed in a red bar at the top of the canvas.
