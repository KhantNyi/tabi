# Tabi

A slow, no-fail, top-down pixel-art walk through Japan. Ride the train between districts, step inside shops and temples, talk to people, collect stamps and play a few small games along the way.

There are nine places to visit: **Tokyo**, **Kamakura**, **Kawaguchiko** (Mount Fuji), **Kyoto**, **Nara**, **Osaka**, **Hiroshima** (with Miyajima), **Sapporo** and **Okinawa**. Most are joined by the shinkansen; Sapporo is a flight and Okinawa is a cruise. Each place has its own stamp book page, 132 stamps in all.

Everything is drawn in code and the music is synthesized in the browser, so there are no image or audio files and no build step.

## Run it

Open `index.html` in a browser. That's all.

You can also serve the folder with any static server if you prefer, for example `npx serve .` or `python -m http.server`.

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Walk | Arrows / WASD | Drag anywhere on the left side (floating joystick) |
| Interact, talk, enter, confirm | E / Space / Enter | E button, or tap to advance dialogue |
| Menu while walking (stamp book, play together, settings, main menu) | Esc / P | ☰ |
| Back out of menus and minigames | Esc | ✕ button, or tap outside a menu |
| Stamp book | Tab / B | BOOK |
| Play together (start, join or leave a room) | T | Menu, then PLAY TOGETHER |
| Say something (bow, cheer, a preset phrase) | C | ··· (while in a room) |
| What's new | Main menu, or the last page of the stamp book | the same |
| Train line | E at a station | Tap a stop, then tap it again to ride |
| Shinkansen to another city | E at the blue shinkansen sign by the main station (Tokyo Station, Kyoto Station, Namba, Kawaguchiko, Nara). Every train-line menu says where it is. | Tap a city, then tap it again to ride |
| Turn the stamp book's page | Left / Right | Tap the left or right side |
| Sound on/off | M, or Settings | Settings |
| Fullscreen | F, or Settings | Settings (turns on by itself when you start on a phone) |
| New trip (start over) | Main menu | Main menu |

## Menus

The game opens on a **title screen**: Fuji at dusk, swaying lanterns, falling petals and a shinkansen gliding past now and then. Its menu offers CONTINUE (or START YOUR TRIP), YOUR TRAVELLER, PLAY TOGETHER, WHAT IS NEW, SETTINGS and NEW TRIP, which asks before it clears anything. While walking, Esc (☰ on a phone) opens a smaller menu with the stamp book, YOUR TRAVELLER, PLAY TOGETHER, SAY SOMETHING, settings and the way back to the title screen.

**Your traveller:** choose a hair style (short, long, bun, cap or sun hat) and colour, skin tone, top, trousers or a skirt and their colour, and a bag (or none). SURPRISE ME picks for you. A new trip starts here. The Harajuku fitting room and the Kyoto kimono shop add to the tops, and friends playing together see your traveller as you made it. **Settings** has sound (remembered), fullscreen, your nickname for playing together, and HOW TO PLAY.

Every menu is a list: arrow keys and E, or one tap on a line. On a line with a value, left and right change it, and a tap on its left arrow steps back. Esc, or a tap outside the buttons, goes back to wherever you came from.

## Tokyo

There are eight districts on one train line: Shibuya, Harajuku, Shinjuku, Ueno, Asakusa, Akihabara, Tokyo Station and Tokyo Tower. The shinkansen to other cities leaves from Tokyo Station.

The four city-street districts go on north, up the avenue that crosses their main street:
- **Shibuya:** Center Gai, a lane of shops and photo booths under its banner.
- **Shinjuku:** Omoide Yokocho, rows of tiny lantern-lit yakitori stalls with narrow alleys between them.
- **Akihabara:** back streets of parts stalls, a maid café and a wall of capsule machines.
- **Tokyo Station:** Marunouchi, a gravel walk beside the Imperial Palace moat, its stone walls and a bridge.

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

## Kamakura

An old capital by the sea, an hour from Tokyo by train. Three stops on the little green Enoden line.

- **Kamakura:** snack shops along Komachi-dori up to Tsurugaoka Hachimangu. The red hall stands at the top of a long stair above two lotus ponds, joined by a drum bridge. Cherry trees line the raised path down to the great torii. A rickshaw goes from the station square.
- **Hase:** the Great Buddha sits in the open air, and you can go inside him. Hasedera climbs past rows of little stone Jizo to a hall and a lookout over the bay, with a hillside path of hydrangeas above.
- **The crossing by the sea:**
  - The Enoden runs past on a clock everyone shares, one way and then the other. The crossing gates come down with bells and flashing lights, and the classic photo only counts while a train is in it.
  - Below the road are the beach, surfers on the swell, and kites wheeling overhead. Buy a shirasu bun at the beach hut and one of them takes it.
  - The surf school runs the surfing minigame: paddle into a wave, stand up in time, then stay in the green pocket.

## Hiroshima and Miyajima

- **Hiroshima Station and Hondori:** streetcars ring their bells along the main road (the photo needs one in it). The covered arcade has a lemonade stand, and Okonomimura, where you build a Hiroshima okonomiyaki layer by layer: drop each layer as it slides over the stack, and whatever overhangs is trimmed.
- **Peace Memorial Park:** the Dome across the river, the Children's Peace Monument (fold a paper crane by pressing the arrow each fold asks for), the Peace Bell, the Flame of Peace and the cenotaph. Praying there is a quiet bow, with no coin and no clapping. The tone in the park is gentle on purpose.
- **Miyajima** is a boat ride from the park, or the train and ferry from the station.
  - The tide comes and goes on the shared clock, and the note at the top of the screen shows where it is. At high tide the great torii and the shrine float on the sea. At low tide the water draws back and you can walk out across the sand to touch the torii. If the tide catches you, it nudges you back to shore.
  - Deer wander the shore. There are grilled oysters, the world's biggest rice scoop and a pagoda on the hill. Fill maple-leaf moulds with batter at the momiji manju shop: hold E to pour and stop at the line.

## Sapporo

Sapporo is in February, during the Snow Festival. Snow falls on every map, your footprints stay in it for a while, and everyone's breath steams. Snow settles on every roof, sign and branch, and icicles hang from the eaves. You get here by plane: the airport sign at Odori, or a flight from any airport gate. New Chitose Airport is on the line.

- **Odori Park:**
  - snow sculptures (a castle as big as a house, a giant owl) and ice sculptures that glint;
  - a snow slide to go down;
  - grilled corn, and a snowball toss where you knock down five bears as they pop up;
  - the old clock tower, and the TV tower with a clock showing the real time.
- **Susukino:** neon on the snow, ice sculptures lit from inside, a streetcar loop, and lamb on a dome-shaped grill. In Ramen Yokocho, the chef calls out your toppings; add them in the order he said.
- **Otaru:**
  - a canal of old stone warehouses at dusk, with gas lamps and snow candles, and a canal cruise;
  - a glass workshop: hold E to blow a float, a cup and a vase, and let go at the ring;
  - a hall of music boxes, and a steam clock that whistles every minute and a half (the HUD counts down to it).

## Okinawa

You come to Okinawa by sea, though there are flights from the airports too. The cruise ship is a scene of its own: out on the open sea, then sunset on deck, then a night under the stars, then land at dawn, with dolphins playing at the bow. A monorail runs above the streets of Naha.

- **Naha Port:** the ship at the wharf (board it to sail anywhere), a shrine on a cliff over a little beach, and a giant shisa lion-dog to pat.
- **Kokusai-dori:** red-tiled roofs with shisa on them, sata andagi doughnuts, the Makishi fish market and Okinawa soba. Eisa drummers dance in the road; join them in a rhythm game.
- **Shuri Castle:** curving limestone walls, the Shureimon gate, and the red Seiden above its striped courtyard.
- **Emerald Beach:**
  - white sand, water in every shade of blue, and sea turtles coming up to breathe;
  - shells to collect, a hammock, and purple sweet potato ice cream;
  - a glass-bottomed boat to steer over the reef. Look through the glass and find five kinds of sea life for the stamp.

## Getting around Japan

The shinkansen sign (or a city's own gateway: Kamakura's JR sign, Sapporo's airport sign, Okinawa's ship) opens a map of all of Japan with the way to each place:
- **the shinkansen** between the cities on Honshu;
- **a local train** between Tokyo and Kamakura;
- **a flight** to or from Sapporo, landing at the city's airport. When the city has no airport, an airport train takes you the rest of the way.
- **a cruise** to or from Okinawa. Arriving anywhere else, a train takes you on from the port.

## Everywhere

- **Photos:** whenever you take a photo, an instant-photo card drops in and develops from a cream haze. It shows the view in front of you (with you out of the shot), a caption, and an orange date print. A few Fuji views are painted as postcards instead.
- **Vending machines:** every vending machine in every city works. Pick one of eight hot and cold drinks, then stop the four-digit lucky number. Four of a kind (ATARI!) wins a second drink free. The drinks you have tried are kept in a collection, shown in the stamp book. At night the machines glow.

## Life in the streets

None of this is a goal; it is there so the places feel lived in. It all lives in `src/world/life.js`.

- **People notice you.** People walking a route step aside for you, sometimes with a "SUMIMASEN!". People standing about glance at you as you pass, and some say hello. The greeting suits the time and the city: KONBANWA at night, MOUKARIMAKKA in Osaka, OIDEYASU in Kyoto, and a compliment if you are wearing a kimono.
- **Shopkeepers call out** "IRASSHAIMASE!" (or "MAIDO!" in Osaka) as you walk past their door.
- **Animals:**
  - pigeons on plazas peck about and scatter when you walk through them, then flutter back;
  - butterflies drift around the parks;
  - a cat you have just petted follows you for a while.
- **Little scenes** play nearby every 15 to 30 seconds:
  - a bicycle rings its bell and slows down if you are in the way;
  - a gust of petals or leaves blows past;
  - a crow lands on a lamp and caws;
  - a school group files past behind its teacher;
  - two friends stop to chat;
  - a tourist walks up and asks you to take their photo (press E);
  - now and then, a festival shrine is carried down the street to a drum.
- **Overheard chats:** half the time, the friends mention a stamp in this city you have not found yet, and where to look.
- **Sounds of the place:**
  - water lapping, birdsong in the parks, cars swishing past;
  - temple bells near places to pray, the station chime, Shibuya's crossing chirp;
  - a busker by some stations, getting louder as you walk closer;
  - footsteps that change with the ground: grass, gravel, stone, wooden bridges and floors, tatami;
  - a murmur of voices in busy rooms.
- **Things moving:**
  - steam over noodle shops and smoke from food stalls and incense burners;
  - leaves that match their tree (maple, ginkgo, sakura) drifting down;
  - water that glints;
  - birds crossing the sky;
  - street lights that breathe and neon that flickers at night.

## Airports

A new trip starts in the air: the plane lands at **Haneda**, and you step off at the arrivals gate. Existing saves carry on where they were. Both airports are stops on their city's train line, so you can come back any time: Haneda on Tokyo's line, **Kansai** on Osaka's.

- **Arrivals:** take the moving walkway down to the immigration booths and show your passport (that's the WELCOME TO JAPAN stamp). Then find your suitcase on the baggage carousel: it's the one with the red ribbon. Press E when it reaches the yellow box. After that comes customs.
- **The main hall:**
  - a departure board whose letters flip over;
  - an IC card machine (after that, the gates beep when you ride the train);
  - money exchange, information, shops, and travellers wheeling suitcases;
  - announcements with the two-note chime;
  - trains, and a bus straight to the city centre.
- **Departures:** check in (your suitcase is heavier for every city you've visited), walk through security (the arches beep), and sit in the gate lounge.
- **The gate desk** is where you choose a flight: to the other airport, or **FLY HOME**. Flights are a window-seat view of take-off, the cloud layer (Fuji pokes through between Tokyo and Osaka) and the landing. Your first domestic flight earns a stamp.
- **Flying home** ends the trip with a scrapbook: the cities you saw, your stamps, cats, drinks, figures, wishes and how many steps you walked. You never have to fly home. Afterwards you can keep wandering, or start a new trip.
- **Haneda's observation deck** (up the escalator): planes take off and land in front of the bay, with Fuji on the horizon.
- **Kansai** stands on an island in the sea; look out of the gate lounge window for its stamp.

It all lives in `src/world/airport.js`. `airport(id, {...})` builds a terminal the way `concourse()` builds a station, and a city calls it before `city()`.

## Rides and small things to do

All of these are in `src/world/rides.js`.

- **Rickshaw tours (Asakusa, Arashiyama):** talk to the puller and climb in. They jog a loop past the sights, talking as they go: the Thunder Gate, Nakamise, Senso-ji and the pagoda in Asakusa; the bamboo grove and Tenryu-ji's side gate in Arashiyama.
  - The cart is drawn from four sides: it turns with the route, the spokes spin, it bobs with the puller's stride, and it kicks up dust on gravel.
  - Press ✕ to hop off at any point; the puller takes the cart back alone.
  - Finishing the loop earns a stamp.
- **The Dotonbori canal cruise:** board at the canal walk. The boat slides under the bridges while the guide tells jokes.
- **Boats you steer:**
  - swan boats on Ueno's pond and on Lake Kawaguchi;
  - a rowing boat on the river at Arashiyama, with oars that sweep and splash.

  Steer with the arrows or the stick. Boats drift, bump the banks and leave a wake. Press E at the dock to return the boat, or ✕ to go straight back. Stay out a while and you earn a stamp.
- **Benches:** sit on any bench with room in front of it. A cat nearby may wander over to join you; move to stand up.
- **Bowing:** bow from SAY SOMETHING, and people near you bow back (so do the deer).
- **Shrines** have a water basin to wash your hands at, and a rack where you can hang a wish plaque (pick from six wishes) or draw a fortune and tie it on. Your plaque and your knots stay on the rack.
- **Koi** swim in the ponds at Kinkaku-ji, Tenryu-ji and Sarusawa (and among the swan boats at Ueno). Feed them from the shore and they rush to the food.

On slow phones the game notices when frames get expensive and thins out the extra effects (water sparkle, wakes, steam, falling leaves) until there is room again.

## Photos

Every TAKE A PHOTO spot gives you an instant-photo card. The camera frames the landmark the spot points at, not just whatever is on screen. It draws the scene again without you in it, and steps back for tall landmarks such as Kyoto Tower or Tsutenkaku. A spot can name its own frame (`frame: [x, y, w, h]`), and a few views are painted as postcards instead (Mirror Fuji, Chureito and the Skytree).

## Big stations

At Tokyo Station, Kyoto Station and Shin-Osaka (from Namba), the blue shinkansen sign leads into the station instead of straight onto a train. The station has two levels. Downstairs is the concourse, where commuters hurry across in streams, with ticket gates (a lane runs straight down from each escalator) and shops built into the wall. Escalators lead up to the platform, where the Nozomi waits. Board at any door. Blue SHINKANSEN signs point up to the trains, and yellow EXIT signs point down and out. Walking through the glass doors at the bottom takes you back out to the city. Walk into a stream and it slows, carries you along and nudges you out, so you pick your gaps. A departure board and a note at the top of the screen count down to the next train, but there's no way to miss out: another comes in two and a half minutes. Arriving by shinkansen, you step off on the platform and walk out through the crowd. Kawaguchiko and Nara keep their small-town signs.

## Playing together

Two or more people can walk around Japan together. Choose PLAY TOGETHER (from either menu, or press T), then START A NEW ROOM, and share the four-letter code. Friends choose JOIN A ROOM WITH A CODE and type it in. When the game is hosted on a website, the menu offers an invite link instead (`?room=CODE`), and opening the link joins.

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

The last page of the stamp book lists every version and what it added, and WHAT IS NEW on the main menu opens it directly. Returning players get a note when the version changes. Versions live in `src/game/changelog.js`, newest first. The top entry is the game's version.

## Saving

Progress is saved in `localStorage` as one save for the whole trip: stamps from every city, figures, cats, the drinks you have tried, your traveller's look and outfit, your nickname for playing together and where you were. A save from the Tokyo-only version is picked up automatically. Some small things reset when you reload: deer crackers, and which Kuromon stalls you have tasted.

## Screens and phones

The view fills the whole screen on every device, with the controls drawn on top of the game.

- **Desktop and phones held sideways:** pixels stay a whole-number size, and a bigger or wider screen shows more of the city rather than bigger pixels.
- **Phones held upright:** you see a narrower, taller slice of the city. The stamp book and the train line switch to one-column lists.
- **Menus and rooms:** menus stay centred, and rooms smaller than the screen sit in the middle of it. On a phone held upright, menu buttons grow to a comfortable size for thumbs.
- **Minigames and train rides** are laid out for a 320-wide screen. On a phone held upright they are shrunk to fit the width.
- **Touch:** only BOOK and ☰ sit in the corner. The joystick and buttons hide while a menu is open, because menus are tapped directly. Double-tap and pinch zoom are switched off, so tapping quickly never zooms the page.
- **Room codes** are typed into a real text box, so the phone's own keyboard comes up. Pasting a whole invite link works too. The text is large enough that iOS does not zoom in on it.

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
    station.js          the shinkansen concourses at the big stations: the train, gates, crowds and departure board
    airport.js          the airports: arrivals, departures, the observation deck, flights and the scrapbook ending
    places.js           shared by the far cities: travel by plane and ship, the cruise scene, passing trains and crossings, snow, waves
    rides.js            rickshaw tours, the canal cruise, boats to steer, benches, bowing, shrine basins and racks, koi
    life.js             life in the streets: reactions, passing scenes, birds and butterflies, ambient sound, steam and leaves
    world.js            building a map: terrain, ground painter, roads, buildings, rooms,
                        furniture, NPCs, cars, forests, ledges, steps, bridges and walls,
                        plus the shared registries MAPS and CITIES, and the hooks net.js uses
                        (OTHERS, on/emit, worldTime). north() adds a district above a street map.
                        settle() checks every crowd path, cat and
                        wanderer once a map is built, so nobody walks through walls or on water
  cities/
    tokyo.js            Tokyo's districts, rooms, dialogue, stamps and landmark art
    fuji.js             Kawaguchiko: the lake, the clouds on Fuji, the ropeway summit, onsen and noodles
    kyoto.js            Kyoto's five districts, the tea ceremony, kimono rental, monkeys
    nara.js             Nara's map, rooms, deer, the mochi minigame and landmark art
    osaka.js            Osaka's four districts, the takoyaki minigame and landmark art
    kamakura.js         Kamakura: the shrine, the Great Buddha, the Enoden crossing, the beach and the surfing minigame
    hiroshima.js        Hiroshima and Miyajima: streetcars, the Peace Park, the tide, paper cranes, okonomiyaki and maple cakes
    sapporo.js          Sapporo in the snow: Odori, Susukino, Otaru, New Chitose, and the snowball, ramen and glass minigames
    okinawa.js          Okinawa: the port and its ship, Kokusai-dori, Shuri, the beach and its glass-bottomed boat, the eisa
  game/
    minigames.js        crane, sushi, capsule, fortune, fitting room, vending machine
    changelog.js        the versions and what each one added (the stamp book's last page)
    menus.js            the title screen, the menu while walking, your traveller, settings, how to play, typing a room code
    main.js             the game loop: walking, doors, trains, the shinkansen, stamp book, photo cards, saving, drawing
  net/
    net.js              playing together: rooms, friends' avatars, SAY SOMETHING, and the moments made for two
```

Scripts are plain classic `<script>` tags that share one global scope, which is why the game works when opened straight from disk. Keep the load order in `index.html`: engine, art, world (with `station.js`), cities, then `minigames.js`, `changelog.js`, `net.js`, `menus.js` and finally `main.js`, which boots the game.

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
   - Getting there: `via: 'plane'` makes the city a flight away, and `via: 'ship'` makes it a cruise (`dock: [mapId, x, y, dir]` is where the ship comes in). `local: 'tokyo'` makes the trip to that city a local train. `gate: [how, where]` changes the travel hint on the train line, and `rideSpr` names the view from the local train's window.
4. Put a `shinkansen(x, y)` spot on the hub map (or `gateway(x, y, label, sprite)` for any other way out), add the city's position to `JPOS` in `main.js`, and add a `<script>` tag for it in `index.html` after `world.js`. The order of the tags is the order of the cities on the shinkansen and in the stamp book.
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
| `?st=menu&kind=pause` | open a menu (`main`, `pause`, `look`, `settings`, `help`, `confirm`, `join`) |
| `?map=tk_shinkansen` | start in a station concourse (`tk_`, `ky_` or `os_shinkansen`) |
| `?map=shibuya&ov=1` | the whole of a map at once, including the districts north of the Tokyo streets |
| `?st=tog`, `?st=say`, `?st=book&pg=together`, `?st=book&pg=updates` | open the play-together menu, SAY SOMETHING, or a page of the stamp book |
| `?sim=6000&seed=3` | walk around at random for that many frames before showing the first frame, pressing E often |

If a script error happens, it is printed in a red bar at the top of the canvas.
