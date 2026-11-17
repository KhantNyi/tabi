# Tabi

A slow, no-fail, top-down pixel-art walk through Japan. Ride the train between districts, step inside shops and temples, talk to people, collect stamps and play a few small games along the way.

There are five places to visit, joined by the shinkansen: **Tokyo**, **Kawaguchiko** (Mount Fuji), **Kyoto**, **Nara** and **Osaka**. Each has its own stamp book page, 70 stamps in all.

Everything is drawn in code and the music is synthesized in the browser, so there are no image or audio files and no build step.

## Run it

Open `index.html` in a browser. That's all.

You can also serve the folder with any static server if you prefer, for example `npx serve .` or `python -m http.server`.

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Walk | Arrows / WASD | Drag anywhere on the left side (floating joystick) |
| Interact, talk, enter, confirm | E / Space / Enter | E button, or tap to advance dialogue |
| Back out of menus and minigames | Esc | ✕ button, or tap outside a menu |
| Stamp book | Tab / B | BOOK |
| Play together (start, join or leave a room) | T | 2P |
| Say something (bow, cheer, a preset phrase) | C | ··· (while in a room) |
| What's new | V on the title screen, or the last page of the stamp book | Tap the version line on the title screen |
| Train line | E at a station | Tap a stop, then tap it again to ride |
| Shinkansen to another city | E at the blue shinkansen sign by the main station (Tokyo Station, Kyoto Station, Namba, Kawaguchiko, Nara). Every train-line menu says where it is. | Tap a city, then tap it again to ride |
| Turn the stamp book's page | Left / Right | Tap the left or right side |
| Music on/off | M | ♫ |
| Fullscreen | F | ⤢ (turns on by itself when you start on a phone) |
| New game (on the title screen) | N | - |

## Tokyo

There are eight districts on one train line: Shibuya, Harajuku, Shinjuku, Ueno, Asakusa, Akihabara, Tokyo Station and Tokyo Tower. The shinkansen to other cities leaves from Tokyo Station.

You can walk into 15 places, each with its own indoor screen: a ramen shop, two clothes shops, a crepe café, a yakitori bar, an observation deck, the Tokyo Tower deck, a game center, a figure shop, Senso-ji's main hall, the panda house, the museum, a department-store food hall and conveyor sushi.

There are 21 stamps to collect, along with capsule figures and cats to pet. The minigames are:

- a crane game
- conveyor sushi
- a capsule machine
- a fortune slip
- a fitting room, which changes your outfit

## Kawaguchiko

A lake town under Mount Fuji, explored on foot, plus a ropeway up to a small summit.

- **Fuji and the clouds:** Fuji fills the skyline across the lake, but clouds cover the summit for part of every half minute. The Fuji photo stamps only count while the peak is clear, and a small sign next to the stamp counter says CLEAR or CLOUDY.
- **Fuji on the horizon:** Fuji is far away, so it barely moves as you walk. Near the shore the camera lifts toward it, and the skyline stays at the top of the view, sliding over the far water rather than scrolling off. It drifts sideways at a third of your pace and scrolls away once you head inland. The still lake below shows an upside-down Fuji.
- **Places:** Chureito Pagoda up a terraced hillside, a pier out into the lake, Oishi Park's lavender and kochia on a raised bank, and the Kachi Kachi ropeway to a lookout with a tanuki, a rabbit and a bell.
- **Inside:** a lakeside onsen and a hoto noodle house.
- **Collecting:** 8 stamps and 4 cats.

## Kyoto

Five districts on a bus line.

- **Kyoto Station:** Kyoto Tower, and the shinkansen.
- **Fushimi Inari:** the shrine and its foxes, then a tunnel of orange torii up the mountain. There's an udon stop halfway, a lookout at the top, and an old trail back down.
- **Gion:** lantern-lit Hanamikoji at dusk, then a stone lane climbing past Yasaka Pagoda to Kiyomizu-dera. Its stage stands on stilts over the trees, and a trail leads down to the Otowa waterfall.
- **Arashiyama:** a bamboo grove that winds into Tenryu-ji's side gate, the river and its bridge, and a hill of monkeys.
- **Kinkaku-ji:** a loop path around the mirror pond, which reflects the golden pavilion, and Ryoan-ji's rock garden.
- **Inside:** a tea ceremony (whisk the tea to a foam before time runs out) and kimono rental, which adds four kimonos to your outfits. There's also a kitsune udon shop.
- **Collecting:** 18 stamps and 6 cats.

## Osaka

Four districts on the loop line.

- **Dotonbori:** a street and a canal walk below it, joined by steps and bridges, with neon signs reflected in the water. Hozen-ji's lantern alley hides behind the shops, through a gap in the row.
- **Kuromon Market:** a food arcade; taste three stalls for a stamp.
- **Shinsekai:** Tsutenkaku stands on four legs over the street and you can walk under it. Billiken is there too, and so is kushikatsu (one dip only).
- **Osaka Castle:** the keep, behind two moats and walls of giant stones, and a plum grove outside.
- **Inside:** a takoyaki stand (turn each ball when it is golden), okonomiyaki, kushikatsu and the top floor of the keep.
- **Collecting:** 12 stamps and 5 cats.

## Nara

Nara is one large map you explore on foot, with no trains. It runs from the station street through the old town to Sarusawa Pond, Kofuku-ji, the deer park, Todai-ji, the Nigatsu-do hillside, Mount Wakakusa, Kasuga Taisha and the floating pavilion. Each area's name appears as you walk into it.

- Buy deer crackers at the stall and the deer will follow you. Feed three to earn a stamp; without crackers they bow.
- Three places to go inside: the Great Buddha Hall (squeeze through the pillar), a mochi shop with a pounding minigame, and a hillside tea house.
- 11 stamps and 3 cats, one of them in a walled garden you can only reach through a gap in its wall.

## Everywhere

- **Photos:** whenever you take a photo, an instant-photo card drops in and develops from a cream haze. It shows the view in front of you (with you out of the shot), a caption, and an orange date print. A few Fuji views are painted as postcards instead.
- **Vending machines:** every vending machine in every city works. Pick one of eight hot and cold drinks, then stop the four-digit lucky number. Four of a kind (ATARI!) wins a second drink free. The drinks you have tried are kept in a collection, shown in the stamp book. At night the machines glow.

## Playing together

Two or more people can walk around Japan together. Press T (2P on a phone), choose START A NEW ROOM, and share the four-letter code. Friends press T, choose JOIN A ROOM and enter it. When the game is hosted on a website, the menu offers an invite link instead (`?room=CODE`), and opening the link joins.

- **Seeing each other:** friends on your map appear in their own outfits with a name tag. Friends elsewhere on the same map get an arrow at the edge of the screen. The menu lists where everyone is. When a friend's tab goes quiet, their avatar fades.
- **Talking:** C opens SAY SOMETHING, with a bow, a cheer and eight preset phrases. There is no free-text chat, and names are animal nicknames (TANUKI, NEKO...), so a stranger who guessed a code could only wave.
- **Your own progress:** everyone keeps their own stamp book and save. Fuji's clouds run on the wall clock, so friends at the lake see the same sky.
- **Better together:** four stamps on the TOGETHER page of the book need a friend:
  - **Group photo:** take a photo with a friend in the frame.
  - **Bell for two:** ring the summit bell within a few seconds of each other.
  - **Travel together:** board a train when a friend nearby asks you along.
  - **A drink for a friend:** win an ATARI and give the second drink away.

Players connect directly to each other over WebRTC, using [Trystero](https://github.com/dmotz/trystero). Public Nostr relays introduce players, and after that they talk peer to peer. The library is loaded from a CDN only when you first join a room, so playing alone makes no network requests. A few strict networks block direct connections between players. Supporting those would need a TURN server.

## What's new

The last page of the stamp book lists every version and what it added. Press V on the title screen to open it directly. Returning players get a note when the version changes. Versions live in `src/game/changelog.js`, newest first. The top entry is the game's version.

## Saving

Progress is saved in `localStorage` as one save for the whole trip: stamps from every city, figures, cats, the drinks you have tried, your outfit, your nickname for playing together and where you were. A save from the Tokyo-only version is picked up automatically. Some small things reset when you reload: deer crackers, and which Kuromon stalls you have tasted.

## Screens and phones

The view fills the whole screen on every device, with the controls drawn on top of the game.

- **Desktop and phones held sideways:** pixels stay a whole-number size, and a bigger or wider screen shows more of the city rather than bigger pixels.
- **Phones held upright:** you see a narrower, taller slice of the city. The stamp book and the train line switch to one-column lists.
- **Menus and rooms:** menus stay centred, and rooms smaller than the screen sit in the middle of it.

On iPhone, Safari can't make a web page fullscreen. Use Share, then Add to Home Screen, and open it from there instead.

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
                        furniture, NPCs, cars, forests, ledges, steps, bridges and walls,
                        plus the shared registries MAPS and CITIES, and the hooks net.js uses
                        (OTHERS, on/emit, worldTime)
  cities/
    tokyo.js            Tokyo's districts, rooms, dialogue, stamps and landmark art
    fuji.js             Kawaguchiko: the lake, the clouds on Fuji, the ropeway summit, onsen and noodles
    kyoto.js            Kyoto's five districts, the tea ceremony, kimono rental, monkeys
    nara.js             Nara's map, rooms, deer, the mochi minigame and landmark art
    osaka.js            Osaka's four districts, the takoyaki minigame and landmark art
  game/
    minigames.js        crane, sushi, capsule, fortune, fitting room, vending machine
    changelog.js        the versions and what each one added (the stamp book's last page)
    main.js             the game loop: walking, doors, trains, the shinkansen, stamp book, photo cards, saving, drawing
  net/
    net.js              playing together: rooms, friends' avatars, SAY SOMETHING, and the moments made for two
```

Scripts are plain classic `<script>` tags that share one global scope, which is why the game works when opened straight from disk. Keep the load order in `index.html`: engine, art, world, cities, then `minigames.js`, `changelog.js`, `net.js` and finally `main.js`, which boots the game.

## Adding a city

1. Copy `src/cities/nara.js` (one big map) or `src/cities/tokyo.js` (districts on a train line) to `src/cities/<city>.js`. Keep it wrapped in its own function so its helpers stay private.
2. Add the city's maps to `MAPS`. Every id has to be unique across all cities because they share one table.
   - An outdoor map needs `name`, `sub`, `tw`/`th` (its size in 16px tiles), `music`, `lay()` to paint the terrain and `deco()` to place buildings and people.
   - A room needs `indoor: 1`, `name` and `deco()` that calls `room({...})`.
   - A big map can list `zones: [[x0, y0, x1, y1, name, sub], ...]`. The name shows when the player walks into one.
3. Call `city({ id, name, tagline, start, hub, line, stamps, cats, sprites() })` after the maps. It registers the city and claims every map defined since the previous city.
   - `start` is where a new game begins, and `hub` is where the shinkansen arrives.
   - `line` lists the local train stations in order. Use `[]` if there are none, and give `areas: [[mapId, label], ...]` instead to lay out the stamp book.
   - `stamps` maps each stamp id to `[label, icon, area]`.
   - Optional: `minis` adds minigames and `hud()` shows a small counter next to the stamps.
   - A map can set `lookUp: [y0, y1]` to lift the camera toward a view at its top (fully above `y0`, easing off by `y1`).
   - A photo spot (`act: 'snap'`) can set `aim()` to frame its photo, or `photo(g, w, h)` to paint the picture itself.
4. Put a `shinkansen(x, y)` spot on the hub map, add the city's position to `JPOS` in `main.js`, and add a `<script>` tag for it in `index.html` after `world.js`. The order of the tags is the order of the cities on the shinkansen and in the stamp book.
5. A station is `station(x, y, name)`, or `busStop(x, y)` for a bus. To ride somewhere that isn't on the line, such as a ropeway, call `rideTo({ label, name, go: [mapId, x, y] })` from a spot's `fn`.

### Making a map that isn't a box

A map is a rectangle of terrain, but the part you can walk on is whatever shape `lay()` carves out of it.

- `tRect`, `tOval` and `tRoad` paint terrain. Painting forest (`FR`) and then carving grass, paving and paths out of it gives a winding, irregular shape.
- `wild(kinds, gap)` turns every forest cell into woods you can't cross. Use `gap` 2 or 3 to keep trees back from narrow paths so they stay visible. Trees near the edge are real objects you can walk behind; the deep interior is painted onto the ground, so a big forest costs almost nothing to draw.
- `ledge(points, height, 'stone' | 'rock' | 'earth')` draws a retaining wall or cliff that splits the ground into levels, and `steps(x, y)` cuts a flight of stairs through it.
- `bridge(x0, y0, x1, y1)` crosses water (water is never walkable). `wallH` and `wallV` build roofed temple walls; leave gaps for gates.
- `roofs(x0, y0, x1, y1)` fills the ground behind a row of shops with rooftops, and `bottomRow()` lines the bottom edge with buildings.

City streets can stay on a grid, since that's what they are. Parks, temples and old towns read better with these.

## Debug URL parameters

| Parameter | Effect |
|---|---|
| `?map=asakusa&x=320&y=460` | start in a district or room at a position |
| `?city=nara` | start in that city |
| `?st=japan`, `?st=shink` | open the shinkansen map, or a shinkansen ride |
| `?ov=1` | draw the whole map at once (with `map=`), to check its layout |
| `?st=book`, `?st=line`, `?st=ride` | open the stamp book, the train line or a train ride |
| `?mini=crane&mt=1` | open a minigame (`crane`, `sushi`, `gacha`, `omikuji`, `dress`, `mochi`, `tea`, `tako`, `vend`); `mt` fast-forwards it by that many seconds |
| `?room=ABCD&net=local` | join a room through a BroadcastChannel instead of the internet, so two tabs of one browser can play together (serve the folder over http for this) |
| `?st=tog`, `?st=say`, `?st=book&pg=together`, `?st=book&pg=updates` | open the play-together menu, SAY SOMETHING, or a page of the stamp book |
| `?sim=6000&seed=3` | walk around at random for that many frames before showing the first frame, pressing E often |

If a script error happens, it is printed in a red bar at the top of the canvas.
