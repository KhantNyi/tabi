'use strict';
// ---------- shops: shelves to browse, a basket, a till, and the little rituals that make each kind of shop its own ----------
// A shop's map says which shop it belongs to (shop: 'kb_tokyo', shared by every floor of the shop) and its kind (style:
// 'konbini' | 'figures' | 'boutique'). In deco(), shelf(x, y, label, goods) puts a BROWSE spot by a shelf and till(x, y)
// the register. What you pick up goes in the basket (G.kago.items) and comes off the shelves again if you walk out
// without paying; what you pay for (G.kago.paid) you can eat at the eat-in, wear out of the shop, or just carry.
// The till is a little ritual, different in each kind of shop: the konbini asks whether to warm your bento, the figure
// shop opens the box so you can check it, and the boutique wraps your things in tissue and walks you to the door.
const SHOP = (() => {
  const any = a => a[Math.random() * a.length | 0];
  const S = () => Snd.ctx && Snd.ctx.state === 'running' ? Snd.ctx.currentTime + 0.01 : 0;
  const yen = n => (n >= 1000 ? Math.floor(n / 1000) + ',' + String(n % 1000).padStart(3, '0') : n) + ' YEN';

  // ---------- goods: { n name, p price, k how it is drawn, c colour, a what the shelf label says, e eating it } ----------
  // warm: offered the microwave; chop / spoon: offered chopsticks or a spoon; bin: which bin its rubbish goes in
  // (0 burnable, 1 plastic, 2 cans and bottles); oni: an onigiri's filling, opened with the three pulls.
  const BENTO = [
    { n: 'SALMON ONIGIRI', p: 160, k: 'onigiri', c: '#f08a6a', oni: 0, bin: 1, a: 'FLAKES OF GRILLED SALMON IN THE MIDDLE. THE NUMBERS ON THE WRAPPER TELL YOU HOW TO OPEN IT.' },
    { n: 'TUNA MAYO ONIGIRI', p: 150, k: 'onigiri', c: '#f4ead4', oni: 1, bin: 1, a: 'THE MOST POPULAR ONIGIRI IN JAPAN, YEAR AFTER YEAR.' },
    { n: 'PICKLED PLUM ONIGIRI', p: 140, k: 'onigiri', c: '#c8382e', oni: 2, bin: 1, a: 'SALTY AND SOUR. THERE MAY BE A STONE. THERE IS USUALLY A STONE.' },
    { n: 'KARAAGE BENTO', p: 550, k: 'bento', c: '#c8783a', warm: 1, chop: 1, bin: 1, a: 'FRIED CHICKEN, RICE WITH A PICKLED PLUM ON TOP, A LITTLE PASTA SALAD FOR SOME REASON.', e: 'THE CHICKEN IS STILL CRISP. THE PICKLED PLUM ON THE RICE MAKES IT LOOK LIKE A FLAG. IT IS CALLED A HINOMARU BENTO.' },
    { n: 'CURRY RICE', p: 520, k: 'bento', c: '#a86a2a', warm: 1, spoon: 1, bin: 1, a: 'JAPANESE CURRY: THICK, SWEET, MILD. IT TASTES LIKE BEING TEN YEARS OLD.', e: 'THICK, SWEET CURRY ON STICKY RICE. YOU EAT IT FAR TOO FAST.' },
    { n: 'EGG SANDO', p: 290, k: 'sando', c: '#f2d040', bin: 1, a: 'SOFT WHITE BREAD, CRUSTS OFF, AND A LOT OF EGG.', e: 'IT IS SO SOFT IT BARELY EXISTS. THE EGG IS CREAMY AND A LITTLE SWEET.' },
    { n: 'COLD SOBA', p: 420, k: 'bento', c: '#8a6a4a', chop: 1, bin: 1, a: 'BUCKWHEAT NOODLES WITH A LITTLE POT OF DIPPING SAUCE AND A SPRING ONION.', e: 'YOU DIP AND SLURP. COLD, NUTTY AND CLEAN. PERFECT ON A HOT DAY.' },
  ];
  const SNACKS = [
    { n: 'NORI SALT CRISPS', p: 150, k: 'chips', c: '#5aa85a', bin: 1, a: 'POTATO CRISPS DUSTED WITH SEAWEED. THE BAG IS MOSTLY AIR, BUT THE AIR IS DELICIOUS.', e: 'SALTY AND GREEN. YOUR FINGERS WILL SMELL OF THE SEA FOR AN HOUR.' },
    { n: 'SOY RICE CRACKERS', p: 180, k: 'chips', c: '#c8783a', bin: 1, a: 'SENBEI: CRUNCHY RICE CRACKERS GLAZED WITH SOY. EACH ONE IN ITS OWN LITTLE PACKET.', e: 'CRUNCH. SOY. CRUNCH. THE PACKETS MULTIPLY ON THE COUNTER.' },
    { n: 'MATCHA WAFERS', p: 120, k: 'choco', c: '#6ab86a', bin: 1, a: 'GREEN TEA CHOCOLATE ON A WAFER. JAPAN HAS MORE FLAVOURS OF THIS THAN YOU COULD TRY IN A YEAR.', e: 'BITTER, SWEET AND GREEN. YOU UNDERSTAND THE HYPE.' },
    { n: 'DRIED SQUID', p: 300, k: 'chips', c: '#e8d0a0', bin: 1, a: 'CHEWY STRIPS OF DRIED SQUID. A SNACK FOR WITH A DRINK. OR FOR A VERY LONG TRAIN.', e: 'YOU CHEW. AND CHEW. AND CHEW. IT IS GOOD, AND IT IS STILL GOING.' },
  ];
  const NOODLES = [
    { n: 'CUP NOODLES', p: 230, k: 'cup', c: '#e0452f', chop: 1, cup: 1, bin: 0, a: 'SEAFOOD FLAVOUR. HOT WATER FROM THE POT AT THE EAT-IN, THEN THREE MINUTES.', e: 'YOU FILL IT AT THE HOT WATER POT AND WAIT THREE WHOLE MINUTES, STARING AT THE LID. THEN: SLURP.' },
    { n: 'MELON PAN', p: 160, k: 'bread', c: '#e8c060', bin: 1, a: 'A SWEET BUN WITH A CRACKLY COOKIE TOP. NO MELON IN IT. IT IS JUST SHAPED LIKE ONE.', e: 'THE CRISP TOP SHATTERS ALL OVER THE COUNTER. THE INSIDE IS FLUFFY AND WARM.' },
    { n: 'CURRY BREAD', p: 180, k: 'bread', c: '#c8783a', bin: 1, a: 'A FRIED BUN WITH CURRY INSIDE. CRUNCHY OUTSIDE, SPICY MIDDLE.', e: 'CRUNCH, THEN A MOUTHFUL OF CURRY. A PERFECT DESIGN.' },
    { n: 'YAKISOBA BUN', p: 200, k: 'bread', c: '#8a5a3a', bin: 1, a: 'FRIED NOODLES IN A HOT DOG BUN. CARBS IN CARBS. A STUDENT FAVOURITE.', e: 'NOODLES IN BREAD. IT SHOULD NOT WORK. IT WORKS.' },
  ];
  const SWEETS = [
    { n: 'CUSTARD PUDDING', p: 210, k: 'pudding', c: '#f2d070', spoon: 1, bin: 1, a: 'A WOBBLY CUSTARD WITH BURNT SUGAR ON TOP. KONBINI PUDDING IS SERIOUS BUSINESS.', e: 'IT WOBBLES ON THE SPOON. SMOOTH, SWEET, AND A LITTLE BITTER AT THE BOTTOM.' },
    { n: 'ROLL CAKE', p: 250, k: 'cake', c: '#f4ead4', spoon: 1, bin: 1, a: 'A SOFT SPONGE ROLLED AROUND MORE CREAM THAN SPONGE.', e: 'IT IS MOSTLY CREAM. YOU ARE NOT COMPLAINING.' },
    { n: 'STRAWBERRY DAIFUKU', p: 180, k: 'mochi', c: '#f9a8c8', bin: 1, a: 'A WHOLE STRAWBERRY IN SWEET BEAN PASTE, WRAPPED IN SOFT MOCHI.', e: 'SOFT, THEN SWEET, THEN A BURST OF STRAWBERRY. YOU SIT VERY STILL FOR A MOMENT.' },
  ];
  const ICE = [
    { n: 'MATCHA ICE CREAM', p: 160, k: 'ice', c: '#6ab86a', spoon: 1, bin: 1, a: 'DEEP GREEN AND A LITTLE BITTER. THE TINY WOODEN SPOON IS INSIDE THE LID.', e: 'COLD, CREAMY AND VERY GREEN. THE WOODEN SPOON TASTES SLIGHTLY OF TREE.' },
    { n: 'SODA ICE POP', p: 80, k: 'icepop', c: '#5ac8f0', bin: 0, a: 'A BLUE ICE POP. SOME STICKS SAY ATARI: A WINNER. YOU GET ANOTHER ONE FREE.', e: 'CRUNCHY BLUE ICE. YOU CHECK THE STICK. NOT A WINNER THIS TIME.' },
    { n: 'MOCHI ICE', p: 140, k: 'mochi', c: '#f4f1e6', bin: 1, a: 'TWO BALLS OF VANILLA ICE CREAM IN SOFT MOCHI, WITH A LITTLE PLASTIC STICK.', e: 'YOU WAIT A MINUTE FOR THE MOCHI TO SOFTEN. IT IS STRETCHY AND COLD AND PERFECT.' },
  ];
  const GOODS = [
    { n: 'TRAVEL TOOTHBRUSH', p: 220, k: 'goods', c: '#5aa8e0', a: 'A FOLDING TOOTHBRUSH AND A TINY TUBE OF TOOTHPASTE. FOR THE NIGHT YOU MISS THE LAST TRAIN.' },
    { n: 'SOCKS', p: 500, k: 'socks', c: '#3a3a4e', a: 'PLAIN BLACK SOCKS. FOR WHEN A RESTAURANT HAS TATAMI AND YOU HAVE A HOLE IN YOURS.' },
    { n: 'FACE TOWEL', p: 400, k: 'goods', c: '#f4f1e6', a: 'A SMALL WHITE TOWEL. JAPANESE SUMMERS ARE HUMID, AND EVERYONE CARRIES ONE.' },
    { n: 'PHONE CHARGER', p: 1500, k: 'goods', c: '#f4f1e6', a: 'A CABLE AND A PLUG. THE MOST EXPENSIVE THING IN THE SHOP, AND THE ONE EVERY TOURIST NEEDS.' },
    { n: 'POCKET TISSUES', p: 120, k: 'goods', c: '#f9a8c8', a: 'MANY PUBLIC TOILETS HAVE NO HAND TOWELS. NOW YOU KNOW.' },
  ];
  const HOT = [
    { n: 'KARAAGE BITES', p: 238, k: 'hotbox', c: '#c8382e', bin: 0, a: 'FRIED CHICKEN BITES FROM THE HOT CASE, IN A LITTLE BOX WITH A CARTOON CHICKEN ON IT.', e: 'JUICY AND CRISP, WITH A TOOTHPICK TO EAT THEM WITH. GONE IN ONE MINUTE.' },
    { n: 'CROQUETTE', p: 120, k: 'croq', c: '#c8903a', bin: 0, a: 'MASHED POTATO AND MINCE IN BREADCRUMBS, IN A PAPER SLEEVE.', e: 'CRISP, THEN SOFT, THEN TOO HOT. YOU BLOW ON IT AND TRY AGAIN.' },
    { n: 'STEAMED PORK BUN', p: 160, k: 'bun', c: '#f8f4ea', bin: 0, a: 'NIKUMAN: A FLUFFY WHITE BUN FROM THE STEAMER, WITH SAVOURY PORK INSIDE.', e: 'IT STEAMS WHEN YOU BREAK IT OPEN. YOUR GLASSES, IF YOU HAD ANY, WOULD FOG UP.' },
    { n: 'ODEN, THREE PIECES', p: 300, k: 'oden', c: '#c8a060', bin: 1, a: 'FROM THE BUBBLING POT: RADISH, EGG AND FISHCAKE IN DASHI. THE CLERK LADLES IT FOR YOU.', e: 'THE RADISH HAS SOAKED UP SO MUCH BROTH IT IS BASICALLY SOUP. THE EGG IS BROWN ALL THE WAY THROUGH.' },
    { n: 'HOT COFFEE CUP', p: 120, k: 'coffee', c: '#8a5a3a', coffee: 1, bin: 0, a: 'AN EMPTY CUP. PAY FOR IT HERE, THEN MAKE YOUR OWN AT THE COFFEE MACHINE.' },
  ];
  const UMBRELLA = { n: 'CLEAR UMBRELLA', p: 500, k: 'umbrella', c: '#c8d8e4', umb: 1, a: 'CLEAR PLASTIC, FIVE HUNDRED YEN. YOU CAN SEE THE RAIN THROUGH IT.' };
  // drinks from the fridge are the vending machine's (DRINKS in minigames.js), so paying for one adds it to your collection
  const fridge = () => DRINKS.map((d, i) => ({ n: d[0], p: d[2] + 10, k: 'drink', drink: i, c: d[3], bin: 2, a: d[5], e: d[6] })).filter((d, i) => !DRINKS[i][1]);
  const edible = it => !!(it.e || it.oni != null);

  // ---------- drawing one thing, standing on (x, y), about 14 high ----------
  function tri(g, x, y, w, h, c) { g.fillStyle = c; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + w, y); g.lineTo(x - w, y); g.closePath(); g.fill(); }
  function good(g, it, x, y) {
    const c = it.c || '#e0563f', l = lite(c, 0.35), d = dark(c, 0.3);
    switch (it.k) {
      case 'onigiri': tri(g, x, y, 7, 12, '#f8f8f4'); R(g, x - 4, y - 5, 8, 5, '#1d2a24'); disc(g, x, y - 7.5, 1.6, c); R(g, x - 0.5, y - 12, 1, 12, 'rgba(224,69,47,0.5)'); break;
      case 'bento': R(g, x - 8, y - 8, 16, 8, '#2a2430'); R(g, x - 7, y - 7, 7, 6, '#f8f8f4'); disc(g, x - 3.5, y - 4, 1.3, '#c8382e'); R(g, x + 1, y - 7, 6, 6, c); R(g, x + 2, y - 6.5, 3, 2, l); R(g, x - 8, y - 9, 16, 1.5, 'rgba(230,240,250,0.7)'); break;
      case 'sando': tri(g, x - 3, y, 5, 10, '#f4ead4'); tri(g, x + 3, y, 5, 10, '#f8f0e0'); R(g, x - 7, y - 3, 14, 2, c); R(g, x - 8, y - 1, 16, 1, '#c8c0b0'); break;
      case 'drink': g.drawImage(drinkSpr(it.drink), x - 4.5, y - 16); break;
      case 'chips': R(g, x - 6, y - 12, 12, 12, c); R(g, x - 6, y - 12, 12, 2, l); for (let k = 0; k < 6; k++) R(g, x - 6 + k * 2, y - 13, 1, 1, l); disc(g, x, y - 6, 3, '#f8f0d8'); R(g, x - 6, y - 1, 12, 1, d); break;
      case 'choco': R(g, x - 7, y - 5, 14, 5, '#5a3a28'); R(g, x - 7, y - 5, 9, 5, c); R(g, x - 7, y - 5, 9, 1, l); txt(g, 'MATCHA'.slice(0, 2), x - 6, y - 5, '#ffffff'); break;
      case 'pudding': R(g, x - 4, y - 7, 8, 7, c); R(g, x - 3.5, y - 9, 7, 2, '#8a4a20'); R(g, x - 4.5, y - 10, 9, 1.5, 'rgba(230,240,250,0.8)'); R(g, x - 4, y - 6, 1, 5, l); break;
      case 'cake': ell(g, x, y - 4, 7, 4, '#e8c890'); ell(g, x, y - 4, 4.5, 2.5, c); disc(g, x, y - 4, 1.5, '#e8c890'); R(g, x - 8, y - 9, 16, 1, 'rgba(230,240,250,0.7)'); break;
      case 'mochi': disc(g, x - 3, y - 4, 4, c); disc(g, x + 3, y - 4, 4, c); disc(g, x - 4, y - 5.5, 1.5, l); disc(g, x + 2, y - 5.5, 1.5, l); break;
      case 'ice': R(g, x - 5, y - 7, 10, 7, '#f4f1e6'); R(g, x - 5, y - 5, 10, 3, c); R(g, x - 6, y - 9, 12, 2, c); R(g, x - 6, y - 9, 12, 1, l); break;
      case 'icepop': R(g, x - 0.5, y - 4, 1.5, 4, '#d8c090'); R(g, x - 3, y - 14, 7, 10, c); R(g, x - 3, y - 14, 2, 10, l); break;
      case 'bread': ell(g, x, y - 4, 7, 4.5, c); ell(g, x - 1, y - 5.5, 5, 2.2, l); if (it.n === 'MELON PAN') for (let k = -4; k <= 4; k += 3) R(g, x + k, y - 8, U, 7, d); break;
      case 'cup': R(g, x - 5, y - 12, 10, 12, '#f4f1e6'); R(g, x - 5, y - 8, 10, 4, c); R(g, x - 6, y - 13, 12, 2, '#d8d0c0'); txt(g, 'CUP', x - 4.5, y - 8, '#ffffff'); break;
      case 'hotbox': R(g, x - 5, y - 8, 10, 8, c); R(g, x - 5, y - 8, 10, 1, l); for (let k = 0; k < 3; k++) disc(g, x - 3 + k * 3, y - 9, 1.8, '#d8902a'); disc(g, x, y - 4, 1.5, '#f2c14e'); break;
      case 'croq': ell(g, x, y - 4, 6, 4, c); ell(g, x - 1, y - 5, 4, 2, '#e8b860'); for (let k = 0; k < 5; k++) p1(g, x - 4 + k * 2, y - 4 + (k % 2), dark(c, 0.2)); break;
      case 'bun': ell(g, x, y - 4, 6, 4.5, c); for (let k = -2; k <= 2; k++) R(g, x + k, y - 9 + Math.abs(k) * 0.6, U, 2, '#d8d0c0'); break;
      case 'oden': R(g, x - 5, y - 7, 10, 7, '#f4f1e6'); R(g, x - 4, y - 8, 8, 2, '#c8a060'); R(g, x - 0.5, y - 15, 1, 8, '#d8c090'); disc(g, x, y - 13, 2.5, '#f4f0e0'); disc(g, x, y - 10, 2, '#a8703a'); break;
      case 'coffee': R(g, x - 3.5, y - 10, 7, 10, '#f4f1e6'); R(g, x - 4, y - 11, 8, 2, '#3a3a4e'); R(g, x - 3.5, y - 7, 7, 3, c); break;
      case 'umbrella': R(g, x - 0.5, y - 14, 1, 14, '#8a8496'); ell(g, x, y - 12, 7, 3, 'rgba(210,230,240,0.85)'); R(g, x - 7, y - 12, 14, 1, '#ffffff'); R(g, x - 1.5, y - 1, 3, 1, '#8a8496'); break;
      case 'socks': R(g, x - 5, y - 12, 4, 9, c); R(g, x - 5, y - 4, 7, 3, c); R(g, x + 1, y - 12, 4, 9, l); R(g, x + 1, y - 4, 6, 3, l); R(g, x - 5, y - 12, 4, 2, '#f4f1e6'); break;
      case 'goods': R(g, x - 6, y - 10, 12, 10, '#f4f1e6'); R(g, x - 6, y - 10, 12, 1, '#ffffff'); R(g, x - 6, y - 7, 12, 3, c); R(g, x - 6, y - 1, 12, 1, '#c8c0b0'); break;
      case 'figbox': R(g, x - 7, y - 16, 14, 16, c); R(g, x - 7, y - 16, 14, 1, l); R(g, x - 5, y - 14, 10, 10, '#cfeaff'); disc(g, x, y - 11, 2, '#f6cfa6'); R(g, x - 2, y - 9, 4, 5, it.fc || '#f06a8c'); R(g, x - 5, y - 3, 10, 2, '#ffffff'); break;
      case 'shirt': R(g, x - 5, y - 12, 10, 11, c); R(g, x - 8, y - 12, 3, 5, c); R(g, x + 5, y - 12, 3, 5, c); R(g, x - 5, y - 12, 10, 1, l); R(g, x - 1.5, y - 12, 3, 2, d); R(g, x - 0.5, y - 10, 1, 9, d); R(g, x + 5, y - 12, 1, 11, d); break;
      case 'tote': R(g, x - 5, y - 9, 10, 9, c); R(g, x - 3, y - 13, 1, 4, d); R(g, x + 2, y - 13, 1, 4, d); R(g, x - 3, y - 13, 6, 1, d); R(g, x - 5, y - 9, 10, 1, l); break;
      case 'hat': ell(g, x, y - 3, 8, 2.5, d); ell(g, x, y - 6, 5, 4, c); R(g, x - 5, y - 5, 10, 1, l); break;
      case 'clips': for (let k = 0; k < 3; k++) { disc(g, x - 4 + k * 4, y - 6, 2.2, [c, '#f2c14e', '#5ac8f0'][k]); disc(g, x - 4.5 + k * 4, y - 6.5, 0.8, '#ffffff'); } R(g, x - 6, y - 2, 12, 1, '#c8c0d0'); break;
      default: R(g, x - 5, y - 10, 10, 10, c);
    }
  }

  // ---------- the basket ----------
  // one per shop (every floor of the figure shop shares it); a new shop starts a new one
  function kago() { const id = M.def.shop; if (!G.kago || G.kago.id !== id) G.kago = { id, style: M.def.style, items: [], paid: [], trash: [], cups: 0 }; return G.kago; }
  const total = items => items.reduce((s, it) => s + it.p, 0);
  function hud() {
    const K = kago();
    if (K.items.length) return 'BASKET: ' + K.items.length + ' ' + (K.items.length > 1 ? 'THINGS' : 'THING') + ', ' + yen(total(K.items));
    const e = K.paid.filter(edible).length; if (e && M.def.style === 'konbini') return 'PAID FOR: ' + e + ' TO EAT AT THE EAT-IN';
    if (K.cups) return 'PAID FOR: A COFFEE CUP';
    return null;
  }
  const CAP = { konbini: 8, figures: 4, boutique: 3 }, BASKET = { konbini: 'BASKET', figures: 'BASKET', boutique: 'ARMS' };
  function shelf(x, y, label, goods, o) { M.SPOTS.push(Object.assign({ x, y, r: 14, label, mini: 'shelf', goods }, o || {})); }

  // ---------- browsing a shelf: < > to look along it, E to put one in the basket ----------
  const SHELF = {
    init(m) { m.goods = typeof m.sp.goods === 'function' ? m.sp.goods() : m.sp.goods; m.i = 0; m.flash = 0; m.msg = null; m.cap = CAP[M.def.style] || 6; },
    update(m, dt) {
      if (m.flash > 0) m.flash -= dt;
      const n = m.goods.length; if (KP.l) { m.i = (m.i + n - 1) % n; Snd.fx('ui'); m.msg = null; } if (KP.r) { m.i = (m.i + 1) % n; Snd.fx('ui'); m.msg = null; }
      if (KP.a && m.t > 0.15) {
        const K = kago(), it = m.goods[m.i];
        if (K.items.length >= m.cap) { m.msg = M.def.style === 'boutique' ? 'THREE AT A TIME, IN THE FITTING ROOM AND AT THE TILL.' : 'YOUR BASKET IS FULL. THE TILL IS OVER THERE.'; Snd.fx('land'); return; }
        if (it.umb && G.umbrella) { m.msg = 'YOU ALREADY HAVE ONE. EVERYONE IN JAPAN OWNS SIX, LEFT IN SIX DIFFERENT PLACES.'; return; }
        K.items.push(Object.assign({}, it)); m.flash = 0.5; m.msg = it.n + (M.def.style === 'boutique' ? ', OVER YOUR ARM.' : ' IN THE BASKET.'); Snd.fx('pick');
      }
    },
    draw(m) {
      const K = kago(), it = m.goods[m.i], n = m.goods.length;
      txtC(ctx, m.sp.title || m.sp.label.replace(/^BROWSE (THE )?/, ''), 160, 26, '#c8382e');
      R(ctx, 56, 70, 208, 3, '#c8c0b0'); R(ctx, 56, 73, 208, 1, '#8a8496');
      // five at a time, the chosen one in the middle; a short shelf shows everything, still in order
      const vis = n >= 5 ? [-2, -1, 0, 1, 2].map(j => [((m.i + j) % n + n) % n, j]) : m.goods.map((_, k) => [k, k - (n - 1) / 2]);
      for (const [k, j] of vis) {
        const x = 160 + j * 40, g = m.goods[k], on = k === m.i;
        if (on) { R(ctx, x - 17, 36, 34, 40, m.flash > 0 ? '#fff0b0' : '#f0e4c8'); R(ctx, x - 17, 36, 34, 1, '#c8382e'); R(ctx, x - 17, 75, 34, 1, '#c8382e'); }
        ctx.save(); ctx.translate(x, 70); if (on) ctx.scale(1.6, 1.6); good(ctx, g, 0, 0); ctx.restore();
        R(ctx, x - 9, 76, 18, 5, '#f2d040'); txtC(ctx, String(g.p), x, 76, '#3a2e40');
      }
      txtC(ctx, it.n + '  ' + yen(it.p), 160, 85, '#3a2e40');
      wrap(m.msg || it.a, 214).slice(0, 3).forEach((l, i) => txtC(ctx, l, 160, 94 + i * 7, m.msg ? '#3f7ab0' : '#6a5a6a'));
      txtC(ctx, BASKET[M.def.style] + ' ' + K.items.length + '/' + m.cap + (K.items.length ? '  ' + yen(total(K.items)) : ''), 160, 119, '#8a6a2a');
      txtC(ctx, '< > LOOK   E TAKE ONE   ESC DONE', 160, 129, '#8a7a6a');
    }
  };

  // ---------- the till ----------
  // a list of steps: scan, then questions (ask), little scenes (act), paying, and goodbye; a question can add steps
  const ask = (q, yes, no, o) => Object.assign({ k: 'ask', q, yes, no }, o || {});
  const pay = () => ({ k: 'pay' });
  const taxFree = items => total(items) >= 5000 ? [ask('"TAX FREE?" OVER FIVE THOUSAND YEN, VISITORS PAY NO TAX. MAY I SEE YOUR PASSPORT?', 'SHE SCANS IT AND STAPLES A LITTLE RECEIPT INSIDE. TEN PERCENT LESS TO PAY.', 'FULL PRICE, THEN. THE TAX PAYS FOR THE TRAINS, PROBABLY.', { then: (y, m) => { if (y) m.total = Math.round(m.total / 1.1); } })] : [];
  const STYLE = {
    konbini: { title: 'KONBINI', col: '#3f9a5a', plan(items) {
      const st = [{ k: 'scan' }];
      if (items.some(i => i.warm)) st.push(ask('"ATATAMEMASU KA?" SHALL I WARM IT UP?', '"HAI!" INTO THE MICROWAVE IT GOES.', '"KASHIKOMARIMASHITA." COLD IT IS. THAT IS ALLOWED.', { then: (y, m) => { if (y) m.steps.splice(m.si + 1, 0, { k: 'act', art: 'warm', dur: 2.2, text: 'MMMMMMMM... DING!' }); } }));
      if (items.some(i => i.chop)) st.push(ask('"OHASHI WA OTSUKE SHIMASU KA?" WOULD YOU LIKE CHOPSTICKS?', 'A PAIR OF WOODEN CHOPSTICKS IN A PAPER SLEEVE GOES IN.', 'NO CHOPSTICKS. YOU HAVE A PLAN. PROBABLY.'));
      if (items.some(i => i.spoon)) st.push(ask('"SUPUUN WA?" A LITTLE SPOON?', 'A TINY SPOON, WRAPPED IN PLASTIC, GOES IN.', 'NO SPOON. BRAVE.'));
      st.push(ask('"FUKURO WA?" WOULD YOU LIKE A BAG? IT IS THREE YEN.', 'A THIN WHITE BAG. HOT THINGS AND COLD THINGS GO IN SEPARATE ONES.', 'THE CLERK PUTS A STRIP OF TAPE ON EACH THING, SO EVERYONE CAN SEE IT IS PAID FOR.', { then: (y, m) => { if (y) m.total += 3; } }));
      st.push(ask('"POINTO KAADO WA?" DO YOU HAVE A POINT CARD?', 'NO PROBLEM AT ALL.', 'YOU SEARCH EVERY POCKET AND HAND OVER YOUR HOTEL KEY. THE CLERK HANDS IT BACK WITH A KIND SMILE.', { opts: ['NO, SORRY', 'UMM...'] }));
      st.push(pay(), { k: 'bye', text: '"ARIGATOU GOZAIMASHITA!" AND FROM THE BACK OF THE SHOP, THE OTHER CLERK SAYS IT TOO.' }); return st; } },
    figures: { title: 'FIGURE SHOP', col: '#e0563f', plan(items) {
      const st = [{ k: 'scan' }];
      if (items.some(i => i.k === 'figbox')) st.push({ k: 'act', art: 'box', dur: 0.6, text: '"PLEASE CHECK IT FOR DAMAGE." SHE SLIDES IT OUT OF THE BOX AND TURNS IT UNDER THE LIGHT. E: IT IS PERFECT.' });
      st.push(...taxFree(items));
      st.push(ask('"A PAPER BAG? OR ONE YOU CANNOT SEE THROUGH?"', 'A PAPER BAG WITH THE SHOP\'S NAME ON IT, SO EVERYONE KNOWS WHERE YOU HAVE BEEN.', 'A PLAIN BLACK BAG. NOBODY WILL EVER KNOW. EXCEPT EVERYONE ON THIS STREET, WHO HAS THE SAME BAG.', { opts: ['PAPER, PLEASE', 'THE SECRET ONE'] }));
      st.push(pay(), { k: 'bye', text: '"ARIGATOU GOZAIMASHITA! TAKE GOOD CARE OF THEM."' }); return st; } },
    boutique: { title: 'BOUTIQUE', col: '#f06a8c', plan(items) {
      const st = [{ k: 'scan' }, { k: 'act', art: 'wrap', dur: 2.4, text: 'SHE FOLDS EACH THING INTO TISSUE PAPER, SEALS IT WITH A STICKER, AND SLIDES IT INTO A STIFF PAPER BAG WITH RIBBON HANDLES.' }];
      st.push(...taxFree(items), pay(), { k: 'bye', text: '"ARIGATOU GOZAIMASU. I WILL WALK YOU TO THE DOOR."' }); return st; } },
  };
  function till(x, y, o) { M.SPOTS.push(Object.assign({ x, y, r: 14, label: 'PAY AT THE TILL', fn: () => { const K = kago(); if (!K.items.length) { dialog([M.def.style === 'boutique' ? 'NOTHING OVER YOUR ARM YET. THE RACKS ARE THAT WAY.' : 'YOUR BASKET IS EMPTY. THE SHELVES ARE THAT WAY.']); return; } G.state = 'mini'; G.mg = { k: 'till', sp: { label: 'TILL' }, t: 0 }; MG.till.init(G.mg); Snd.fx('ui'); } }, o || {})); }
  const TILL = {
    init(m) { const K = kago(); m.st = STYLE[K.style] || STYLE.konbini; m.items = K.items.slice(); m.total = total(m.items); m.steps = m.st.plan(m.items); m.si = 0; m.pt = 0; m.n = 0; m.sel = 0; m.say = null; m.paid = null; m.clerk = M.ACT.find(a => a.clerk); },
    next(m) { m.si++; m.pt = 0; m.sel = 0; m.say = null; },
    update(m, dt) {
      const s = m.steps[m.si], t0 = m.pt; m.pt += dt; const cross = v => t0 < v && m.pt >= v;
      if (s.k === 'scan') { if (m.n < m.items.length) { if (m.pt > 0.4) { m.n++; m.pt = 0; Snd.fx('beep'); } } else if (m.pt > 0.5) TILL.next(m); }
      else if (s.k === 'ask') {
        if (m.say) { if (m.pt > 0.3 && KP.a) TILL.next(m); return; }
        if (KP.l || KP.r) { m.sel ^= 1; Snd.fx('ui'); }
        if (KP.a && m.pt > 0.2) { const y = m.sel === 0; m.say = y ? s.yes : s.no; if (s.then) s.then(y, m); Snd.fx('talk'); m.pt = 0; }
      }
      else if (s.k === 'act') {
        if (s.art === 'warm') { if (cross(0.05)) { const t = S(); if (t) Snd.tone('sawtooth', 60, t, 2, 0.015); } if (cross(2.1)) Snd.fx('chime'); }
        if (s.art === 'wrap' && Math.floor(t0 * 3) !== Math.floor(m.pt * 3)) PLACES.SND.swish();
        if (m.pt > s.dur && (s.art !== 'box' || KP.a)) TILL.next(m);
      }
      else if (s.k === 'pay') {
        const opts = G.ic ? ['ic', 'cash'] : ['cash'];
        if (!m.paid) { if (opts.length > 1 && (KP.l || KP.r)) { m.sel ^= 1; Snd.fx('ui'); } if (KP.a && m.pt > 0.2) { m.paid = opts[m.sel] || 'cash'; m.pt = 0; Snd.fx(m.paid === 'ic' ? 'beep' : 'coin'); } }
        else if (m.pt > 1.5) TILL.next(m);
      }
      else if (s.k === 'bye') { if (cross(0.05)) Snd.fx('yay'); if (m.pt > 0.5 && KP.a) TILL.done(m); }
    },
    done(m) {
      const K = kago(), got = K.items.splice(0); let fit = -1;
      for (const it of got) { if (it.drink != null) G.cans[it.drink] = 1; if (it.umb) G.umbrella = 1; if (it.coffee) K.cups++; if (it.fit != null) fit = it.fit; K.paid.push(it); }
      if (fit >= 0) { G.fit = fit; pl.F = plLook(fit); }
      save(); G.mg = null; G.state = 'play';
      if (K.style === 'boutique') escort(fit >= 0 && M.def.stamp);
      else if (got.some(i => i.umb)) dialog(['THE CLERK TAKES THE LABEL OFF YOUR UMBRELLA FOR YOU. WHEN IT RAINS NOW, YOU WILL PUT IT UP.']);
    },
    draw(m) {
      const s = m.steps[m.si], st = m.st;
      txtC(ctx, st.title, 160, 24, st.col);
      // the clerk, behind the counter, bowing at the end
      if (m.clerk) { const f = s.k === 'bye' && m.pt < 1.6 ? m.clerk.F.bow : m.clerk.F.d[0]; ctx.drawImage(f, 54, 36, f.lw * 1.5, f.lh * 1.5); }
      R(ctx, 50, 76, 132, 5, '#c89a6a'); R(ctx, 50, 76, 132, 1, '#f0d0a0'); R(ctx, 50, 81, 132, 3, '#8a5a3a');
      // the register's screen
      R(ctx, 190, 34, 78, 48, '#2a2430'); R(ctx, 192, 36, 74, 44, '#1d3a2a');
      const shown = m.items.slice(0, m.n).slice(-4); shown.forEach((it, i) => { txt(ctx, it.n.slice(0, 11), 194, 38 + i * 7, '#8affaa'); txt(ctx, String(it.p), 264 - tw(String(it.p)), 38 + i * 7, '#8affaa'); });
      R(ctx, 194, 67, 70, U, '#5ad88a'); txt(ctx, 'TOTAL', 194, 70, '#f2c14e'); const tt = yen(m.n < m.items.length ? total(m.items.slice(0, m.n)) : m.total); txt(ctx, tt, 264 - tw(tt), 70, '#f2c14e');
      // the counter: the thing being scanned slides past the red light, or the scene of the moment
      if (s.k === 'scan' && m.n < m.items.length) { const x = 104 + Math.min(1, m.pt / 0.4) * 60; good(ctx, m.items[m.n], x, 76); R(ctx, 140, 56, 1, 20, 'rgba(255,60,60,0.75)'); }
      else if (s.k === 'act' && s.art === 'warm') { R(ctx, 110, 50, 44, 26, '#e8e4ec'); R(ctx, 112, 52, 30, 22, '#2a2430'); const on = m.pt < 2.1; R(ctx, 113, 53, 28, 20, on ? '#f8d070' : '#3a3446'); if (on) { ctx.save(); ctx.translate(127, 72); ctx.scale(1, 0.6); good(ctx, m.items.find(i => i.warm), Math.sin(m.pt * 3) * 3, 0); ctx.restore(); } R(ctx, 145, 54, 7, 4, '#1d1626'); txt(ctx, on ? String(Math.max(0, 2 - Math.floor(m.pt))) : 'END', 145, 54, '#5ad88a'); }
      else if (s.k === 'act' && s.art === 'box') { const it = m.items.find(i => i.k === 'figbox'); R(ctx, 96, 46, 20, 30, it.c); R(ctx, 98, 48, 16, 20, '#cfeaff'); const k = Math.min(1, m.pt / 0.6); ctx.save(); ctx.translate(138, 76); ctx.scale(2, 2); disc(ctx, 0, -10, 2.5, '#f6cfa6'); R(ctx, -2.5, -8, 5, 7, it.fc || '#f06a8c'); R(ctx, -3, -1, 6, 1, '#3a3346'); ctx.restore(); if (k >= 1) for (let i = 0; i < 4; i++) { const a = G.t * 3 + i * 1.57; R(ctx, 138 + Math.cos(a) * 14, 60 + Math.sin(a) * 10, 1, 1, '#fff8c0'); } }
      else if (s.k === 'act' && s.art === 'wrap') { const k = Math.min(1, m.pt / 2); R(ctx, 104, 54, 52, 22, '#f4f0f4'); for (let i = 0; i < 5; i++) R(ctx, 104 + i * 10, 54, 1, 22 * (1 - k), '#e0d8e8'); ctx.save(); ctx.translate(130, 72); good(ctx, m.items[0], 0, -2 + k * 30); ctx.restore(); R(ctx, 104, 52, 52, 2, '#f4f0f4'); if (k > 0.6) { disc(ctx, 130, 64, 3, st.col); txtC(ctx, '*', 130, 62, '#ffffff'); } if (k >= 1) { R(ctx, 160, 50, 18, 26, '#f8f0e8'); R(ctx, 160, 50, 18, 2, st.col); R(ctx, 164, 44, 1, 7, st.col); R(ctx, 173, 44, 1, 7, st.col); } }
      else if (s.k === 'pay' && m.paid) { if (m.paid === 'ic') { R(ctx, 120, 56, 24, 20, '#3a3a4e'); R(ctx, 123, 59, 18, 10, m.pt < 0.5 ? '#5ad88a' : '#2a6a4a'); txtC(ctx, 'PI!', 132, 61, '#ffffff'); } else { R(ctx, 108, 66, 40, 10, '#3a3a4e'); R(ctx, 110, 67, 36, 7, '#5a5468'); R(ctx, 113, 68, 16, 5, '#c8d8b0'); for (let i = 0; i < 3; i++) disc(ctx, 134 + i * 4, 70, 2, ['#d9b04a', '#c8c0d4', '#c8c0d4'][i]); } }
      else if (m.items.length) { const show = m.items.slice(0, 5); show.forEach((it, i) => good(ctx, it, 100 + i * 14, 76)); }
      // what is said, and what you can answer
      const L = (lines, y, col) => wrap(lines, 216).slice(0, 3).forEach((l, i) => txtC(ctx, l, 160, y + i * 7, col || '#3a2e40'));
      if (s.k === 'scan') L('PI. PI. PI. EACH THING GOES PAST THE SCANNER, AND THE SCREEN ADDS IT UP.', 92, '#6a5a6a');
      else if (s.k === 'ask') { if (m.say) { L(m.say, 92, '#3f7ab0'); txtC(ctx, 'E', 160, 128, '#8a7a6a'); } else { L(s.q, 90); (s.opts || ['YES, PLEASE', 'NO, THANKS']).forEach((o, i) => { const x = 96 + i * 72, w = 64; R(ctx, x, 112, w, 11, m.sel === i ? '#c8382e' : '#5a5468'); txtC(ctx, o, x + w / 2, 115, '#fff8e8'); }); txtC(ctx, '< > CHOOSE   E SAY IT', 160, 129, '#8a7a6a'); } }
      else if (s.k === 'act') L(s.text, 92);
      else if (s.k === 'pay') {
        if (m.paid) L(m.paid === 'ic' ? 'YOU TOUCH YOUR IC CARD TO THE READER. PI! PAID.' : 'YOU PUT THE MONEY ON THE LITTLE TRAY, NOT IN THEIR HAND. THE CHANGE COMES BACK WITH THE RECEIPT ON TOP, COUNTED OUT FOR YOU TO SEE.', 92, '#3f7ab0');
        else { L('THAT IS ' + yen(m.total) + ', PLEASE.', 92); const opts = G.ic ? ['TAP YOUR IC CARD', 'PAY IN CASH'] : ['PAY IN CASH']; opts.forEach((o, i) => { const w = 80, x = opts.length > 1 ? 76 + i * 88 : 120; R(ctx, x, 112, w, 11, m.sel === i ? '#c8382e' : '#5a5468'); txtC(ctx, o, x + w / 2, 115, '#fff8e8'); }); }
      }
      else if (s.k === 'bye') { L(s.text, 92, st.col); txtC(ctx, 'E TO TAKE YOUR THINGS', 160, 129, '#8a7a6a'); }
    },
  };

  // ---------- the boutique's goodbye: a member of staff carries your bag to the door and bows ----------
  function escort(stamp) {
    const n = M.ACT.find(a => a.staff && a.carry !== undefined) || M.ACT.find(a => a.clerk); if (!n) { if (stamp) award(stamp); return; }
    n.escort = { ph: 0, t: 0, stamp }; n.carry = 1; G.state = 'play';
  }
  function escortUpd(n, dt) {
    const E = n.escort; E.t += dt;
    const go2 = (x, y) => { const dx = x - n.x, dy = y - n.y, d = Math.hypot(dx, dy); if (d < 1.5) return true; const v = Math.min(d, 34 * dt); n.x += dx / d * v; n.y += dy / d * v; n.mv = true; n.wt += dt; n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'l' : 'r') : (dy < 0 ? 'u' : 'd'); return false; };
    const door = [M.w / 2 + 16, M.h - 24];
    if (E.ph === 0) { if (go2(...(E.via || door))) { if (E.via) E.via = null; else { E.ph = 1; E.t = 0; n.mv = false; n.dir = 'l'; say(n, 'HERE YOU ARE. ARIGATOU GOZAIMASHITA!'); } } }
    else if (E.ph === 1) { if (E.t > 0.6 && n.carry) { n.carry = 0; Snd.fx('page'); NET.say('SHE HANDS YOU THE BAG AT THE DOOR, THEN BOWS UNTIL YOU ARE OUT OF SIGHT.', 4); } if (E.t > 0.8) n.act = 'bow'; if (E.t > 3) { n.act = null; E.ph = 2; if (E.stamp) award(E.stamp); } }
    else if (go2(n.hx, n.hy)) { n.mv = false; n.dir = 'd'; n.escort = null; }
  }
  // a person who can be told to carry something (the bag, a basket of stock)
  function staffDraw(e, x, y) { ell(ctx, x, y, 6, 2, 'rgba(22,30,50,0.32)'); ctx.drawImage(frameOf(e), snap(x - 10), snap(y - 27)); if (e.carry) { const bx = x + (e.dir === 'l' ? -11 : 5); R(ctx, bx, y - 15, 7, 8, e.carryC || '#f4ead4'); R(ctx, bx, y - 15, 7, 1, '#ffffff'); R(ctx, bx + 1.5, y - 18, 1, 3, '#c8382e'); R(ctx, bx + 4.5, y - 18, 1, 3, '#c8382e'); } }

  // ---------- shoppers: people who come in, take something from a shelf, pay, and go ----------
  // path: [[x, y, wait, face], ...]; a negative wait means out of the door for that long (and a chime when they come back)
  function shopper(name, tint, path, lines) {
    const n = npc(name, path[0][0], path[0][1], { tint, lines: lines || ['...'] }); n.path = path; n.pi = 1; n.pw = 0;
    n.upd = (n, dt) => {
      if (n.pw > 0) { n.pw -= dt; n.mv = false; if (n.pw <= 0 && n.hide) { n.hide = false; arrive(); } return; }
      if (n.sayT > 0) { n.mv = false; return; }
      const [tx, ty, w, face] = n.path[n.pi], dx = tx - n.x, dy = ty - n.y, d = Math.hypot(dx, dy);
      if (d < 1.5) { n.pi = (n.pi + 1) % n.path.length; n.mv = false; if (w < 0) { n.hide = true; n.pw = -w; } else { n.pw = w || 0; if (face) n.dir = face; } return; }
      const v = Math.min(d, 24 * dt); n.x += dx / d * v; n.y += dy / d * v; n.mv = true; n.wt += dt; n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'l' : 'r') : (dy < 0 ? 'u' : 'd');
    };
    return n;
  }
  // someone comes in: the door chimes, and every member of staff calls out, one after another (a konbini's echo)
  function arrive() {
    if (M.def.style === 'konbini') { const t = S(); if (t) ['E6', 'C6', 'D6', 'G5'].forEach((s, i) => Snd.tone('sine', nf(s), t + i * 0.16, 0.26, 0.025, { pluck: 1 })); }
    M.ACT.filter(a => a.staff || a.clerk).forEach((a, i) => { a.greet = 0.3 + i * 0.7; });
  }
  // every frame in a shop: staff greetings and calls, the escort, and the basket left by the door if you walk out
  function tick() {
    const K = kago(), dt = 1 / 60;
    if (M.fitting && G.state === 'play') M.fitting = 0; // out of the fitting room (or stepped out with ESC): the curtain opens
    for (const a of M.ACT) {
      if (a.greet > 0 && (a.greet -= dt) <= 0) say(a, any(['IRASSHAIMASE!', 'IRASSHAIMASE!', 'IRASSHAIMASEEE!']));
      if (a.escort) escortUpd(a, dt);
      if (a.calls && !a.escort && G.state === 'play' && (a.callT = (a.callT || 6) - dt) <= 0) { a.callT = 7 + Math.random() * 6; if (Math.hypot(pl.x - a.x, pl.y - a.y) < 160) say(a, any(a.calls)); }
    }
    if (M.def.front && K.items.length && pl.y > M.h - 10) { K.items = []; NET.say('YOU LEAVE THE ' + (M.def.style === 'boutique' ? 'CLOTHES ON A RACK' : 'BASKET') + ' BY THE DOOR. NOTHING UNPAID GOES OUTSIDE.', 4); }
  }
  function enter() { kago(); }

  // ---------- the konbini's eat-in counter, its bins, its coffee machine, its toilet ----------
  function eatIn() {
    const K = kago(), i = K.paid.findIndex(edible);
    if (i < 0) { dialog(K.paid.length ? ['NOTHING YOU BOUGHT IS FOR EATING. THE STOOLS LOOK OUT AT THE STREET ANYWAY, SO YOU SIT FOR A MINUTE.'] : ['A COUNTER ALONG THE WINDOW, WITH STOOLS AND A HOT WATER POT. BUY SOMETHING, THEN COME AND EAT IT HERE.', 'EATING WHILE WALKING IS A LITTLE RUDE IN JAPAN. THIS IS WHERE YOU DO IT INSTEAD.']); return; }
    const it = K.paid.splice(i, 1)[0]; K.trash.push([it.k === 'onigiri' ? 'ONIGIRI WRAPPER' : it.k === 'drink' ? (DRINKS[it.drink][4] === 'bottle' ? 'PLASTIC BOTTLE' : 'EMPTY CAN') : it.k === 'cup' ? 'NOODLE CUP' : it.k === 'icepop' ? 'ICE POP STICK' : it.bin === 0 ? 'PAPER WRAPPER' : 'PLASTIC TRAY', it.bin]);
    if (it.chop || it.spoon) K.trash.push([it.chop ? 'WOODEN CHOPSTICKS' : 'LITTLE SPOON', it.chop ? 0 : 1]);
    pl.dir = 'd';
    if (it.oni != null) { G.state = 'mini'; G.mg = { k: 'onigiri', sp: { oni: it.oni, label: 'EAT' }, t: 0 }; MG.onigiri.init(G.mg); return; }
    Snd.fx(it.k === 'drink' || it.k === 'cup' ? 'slurp' : 'munch'); dialog([it.e, K.paid.some(edible) ? 'THERE IS STILL MORE IN THE BAG.' : 'THE RUBBISH GOES IN THE BINS BY THE DOOR. THERE ARE THREE OF THEM, AND THEY MEAN IT.']);
  }
  const BINS = [['BURNABLE', '#e0563f'], ['PLASTIC', '#f2c14e'], ['CANS AND BOTTLES', '#5aa8e0']];
  function sortSpot(x, y) { M.SPOTS.push({ x, y, r: 13, label: 'SORT YOUR RUBBISH', fn: () => { const K = kago(); if (!K.trash.length) { dialog(['THREE BINS: BURNABLE, PLASTIC, CANS AND BOTTLES. THERE ARE ALMOST NO BINS ON JAPANESE STREETS, SO PEOPLE CARRY THEIR RUBBISH HOME, OR BRING IT BACK HERE.']); return; } G.state = 'mini'; G.mg = { k: 'sort', sp: { label: 'BINS' }, t: 0 }; MG.sort.init(G.mg); } }); }
  const SORT = {
    init(m) { m.q = kago().trash.splice(0); m.i = 0; m.pt = 0; m.ok = 0; m.res = null; },
    update(m, dt) {
      m.pt += dt;
      if (m.res) { if (m.pt > 0.8) { m.res = null; m.i++; m.pt = 0; if (m.i >= m.q.length) endMini(false, m.ok === m.q.length ? ['EVERYTHING IN THE RIGHT BIN. THE CLERK, WHO WAS WATCHING, GIVES A TINY NOD OF RESPECT.'] : ['THE CLERK QUIETLY MOVES ' + (m.q.length - m.ok > 1 ? 'A COUPLE OF THINGS' : 'ONE THING') + ' TO THE RIGHT BIN. THE LITTLE PICTURES ON THE LIDS HELP, NEXT TIME.']); } return; }
      const k = KP.l ? 0 : KP.d ? 1 : KP.r ? 2 : -1; if (k < 0) return; const ok = k === m.q[m.i][1]; m.res = { k, ok }; if (ok) m.ok++; Snd.fx(ok ? 'clink' : 'land'); m.pt = 0;
    },
    draw(m) {
      txtC(ctx, 'SORT YOUR RUBBISH', 160, 26, '#3f9a5a'); const cur = m.q[m.i];
      BINS.forEach(([n, c], i) => { const x = 92 + i * 68; R(ctx, x - 18, 86, 36, 26, '#8a8496'); R(ctx, x - 20, 82, 40, 6, c); R(ctx, x - 20, 82, 40, 1, lite(c, 0.4)); R(ctx, x - 6, 84, 12, 2, '#1d1626'); txtC(ctx, n.split(' ')[0], x, 98, '#ffffff'); if (i === 2) txtC(ctx, '& BOTTLES', x, 105, '#ffffff'); txtC(ctx, ['<', 'DOWN', '>'][i], x, 116, '#8a7a6a'); });
      if (cur) { const r = m.res, x = r ? 92 + r.k * 68 : 160, y = r ? 50 + Math.min(1, m.pt / 0.3) * 30 : 50 + Math.sin(G.t * 3) * 2; if (!r || m.pt < 0.3) { R(ctx, x - 4, y - 4, 8, 8, '#f4f1e6'); R(ctx, x - 4, y - 4, 8, 2, BINS[cur[1]][1]); } txtC(ctx, cur[0], 160, 36, '#3a2e40'); if (r) txtC(ctx, r.ok ? 'YES!' : 'HMM, NOT THAT ONE.', 160, 64, r.ok ? '#3f9a5a' : '#c8382e'); }
      txtC(ctx, (m.i + 1 > m.q.length ? m.q.length : m.i + 1) + ' OF ' + m.q.length, 160, 129, '#8a7a6a');
    }
  };
  function coffee() {
    const K = kago();
    if (!K.cups) { dialog(['THE MACHINE GRINDS BEANS FOR EACH CUP. BUT IT WANTS A CUP FIRST, AND THE CUPS ARE SOLD AT THE TILL: ASK FOR A HOT COFFEE CUP AT THE HOT CASE.']); return; }
    K.cups--; K.paid.splice(K.paid.findIndex(i => i.coffee), 1); K.trash.push(['PAPER CUP', 0]); const t = S(); if (t) { Snd.noise(t, 1.6, 0.03, 300, 1200, Snd.sfx); Snd.noise(t + 0.2, 1.2, 0.02, 2000, 5000, Snd.sfx); }
    Snd.fx('slurp'); dialog(['YOU PUT THE CUP IN AND PRESS THE BUTTON. THE MACHINE GRINDS FRESH BEANS JUST FOR YOU.', 'IT IS GENUINELY GOOD COFFEE, FOR ONE HUNDRED AND TWENTY YEN. NOBODY CAN EXPLAIN HOW.']);
  }
  // ---------- a Japanese toilet's control panel ----------
  const WB = [['SPRAY', 'A SMALL NOZZLE EXTENDS POLITELY AND GETS TO WORK. YOU STARE AT THE CEILING.'], ['GENTLE', 'THE SAME, BUT GENTLER. THERE IS A KNOB FOR PRESSURE AND ONE FOR WATER TEMPERATURE.'], ['DRY', 'A WARM BREEZE. THE SEAT, YOU REALISE, HAS BEEN HEATED THIS WHOLE TIME.'], ['MUSIC', 'THE SOUND OF A FLOWING STREAM, SO NOBODY OUTSIDE HEARS ANYTHING ELSE. IT IS CALLED OTOHIME.'], ['STOP', 'EVERYTHING STOPS. THE MOST IMPORTANT BUTTON. IT IS USUALLY RED.'], ['FLUSH', '']];
  const WASH = {
    init(m) { m.i = 0; m.on = null; m.ot = 0; m.used = 0; m.log = 'A HEATED SEAT, AND A PANEL OF BUTTONS ON THE ARMREST. THE PICTURES ON THEM ARE VERY CLEAR.'; },
    update(m, dt) {
      m.ot += dt; if (m.done) { if (m.ot > 1.8) endMini(false, ['THE LID CLOSES BY ITSELF. YOU WASH YOUR HANDS, BOW SLIGHTLY TO THE CLERK, AND SAY "ARIGATOU." THE CLERK BOWS BACK.']); return; }
      if (KP.l) { m.i = (m.i + 5) % 6; Snd.fx('ui'); } if (KP.r) { m.i = (m.i + 1) % 6; Snd.fx('ui'); }
      if (KP.a && m.t > 0.2) {
        const b = WB[m.i][0], t = S(); m.on = b; m.ot = 0; m.used++;
        if (b === 'FLUSH') { m.done = 1; m.log = 'WHOOSH. THE LID CLOSES ITSELF, VERY SLOWLY.'; if (t) Snd.noise(t, 1.6, 0.07, 120, 1800, Snd.sfx); return; }
        m.log = WB[m.i][1]; if (!t) return;
        if (b === 'SPRAY' || b === 'GENTLE') Snd.noise(t, 1.2, b === 'SPRAY' ? 0.03 : 0.015, 1800, 6000, Snd.sfx);
        else if (b === 'DRY') Snd.noise(t, 1.4, 0.03, 200, 900, Snd.sfx);
        else if (b === 'MUSIC') { Snd.noise(t, 2.5, 0.025, 600, 2600, Snd.sfx); ['G6', 'E6', 'A6', 'G6'].forEach((s, i) => Snd.tone('sine', nf(s), t + 0.3 + i * 0.5, 0.12, 0.02, { pluck: 1 })); }
        else Snd.fx('ui');
      }
    },
    draw(m) {
      txtC(ctx, 'THE TOILET', 160, 26, '#3f7ab0');
      R(ctx, 70, 36, 180, 34, '#e8e4ec'); R(ctx, 70, 36, 180, 1, '#ffffff'); R(ctx, 70, 69, 180, 1, '#a8a2b4');
      WB.forEach(([n], i) => { const x = 80 + i * 28, on = i === m.i, c = n === 'STOP' ? '#e0452f' : n === 'FLUSH' ? '#3f7ab0' : '#8a8496'; disc(ctx, x + 6, 48, 6.5, on ? '#c8382e' : '#3a3446'); disc(ctx, x + 6, 48, 5.5, c); R(ctx, x + 3, 46, 6, 1, '#ffffff'); if (m.on === n && m.ot < 1.4) disc(ctx, x + 6, 48, 2, '#ffffff'); txtC(ctx, n, x + 6, 58, on ? '#c8382e' : '#3a2e40'); });
      wrap(m.log, 214).slice(0, 4).forEach((l, i) => txtC(ctx, l, 160, 80 + i * 8, '#3a2e40'));
      txtC(ctx, m.done ? '' : '< > CHOOSE   E PRESS', 160, 129, '#8a7a6a');
    }
  };

  // ---------- capsule toys: machines of little series to collect (G.caps[series] = {0: 1, ...}) ----------
  const SERIES = {
    cats: ['CATS IN CUPS', ['TEACUP CAT', 'RAMEN BOWL CAT', 'COFFEE CUP CAT', 'FLOWERPOT CAT'], ['#f4f1e6', '#f2c14e', '#8a5a3a', '#c8603a'], 300],
    tiny: ['TINY KONBINI', ['MINI ONIGIRI', 'MINI CUP NOODLES', 'MINI PUDDING', 'MINI MELON PAN'], ['#f08a6a', '#e0452f', '#f2d070', '#e8c060'], 400],
    sleepy: ['SLEEPY ANIMALS', ['SLEEPY PANDA', 'SLEEPY FOX', 'SLEEPY DEER', 'SLEEPY CAPYBARA'], ['#f8f4ea', '#e8803a', '#c48a54', '#a8784a'], 300],
    sushi: ['SUSHI KEYCHAINS', ['TUNA', 'SALMON ROE', 'EGG', 'SHRIMP'], ['#d8404a', '#f08a2a', '#f2d04a', '#f8b8a0'], 200],
  };
  function capArt(g, key, i, x, y, s) {
    const S_ = SERIES[key], c = S_[2][i]; g.save(); g.translate(x, y); g.scale(s, s);
    if (key === 'cats') { R(g, -6, -6, 12, 6, i === 1 ? '#f4f1e6' : i === 3 ? '#c8603a' : '#e8e4ec'); R(g, -6, -6, 12, 1, '#ffffff'); disc(g, 0, -8, 4.5, i === 2 ? '#3a3a4e' : '#f2a03a'); tri(g, -3, -11, 1.6, 3, i === 2 ? '#3a3a4e' : '#f2a03a'); tri(g, 3, -11, 1.6, 3, i === 2 ? '#3a3a4e' : '#f2a03a'); p1(g, -1.5, -8.5, '#1d1626'); p1(g, 1.5, -8.5, '#1d1626'); if (i === 1) R(g, -5, -6, 10, 1, '#f2c14e'); }
    else if (key === 'tiny') good(g, { k: ['onigiri', 'cup', 'pudding', 'bread'][i], c, n: i === 3 ? 'MELON PAN' : '' }, 0, 0);
    else if (key === 'sleepy') { ell(g, 0, -4, 7, 4, c); disc(g, -3, -6, 3.5, c); if (i === 0) { disc(g, -5, -9, 1.3, '#2a2430'); disc(g, -1, -9, 1.3, '#2a2430'); ell(g, -4, -6, 1, 1.2, '#2a2430'); } if (i === 1) { tri(g, -5, -8.5, 1.4, 3, c); tri(g, -1, -8.5, 1.4, 3, c); R(g, 3, -4, 5, 2, '#f8f4ea'); } if (i === 2) { R(g, -4, -11, U, 3, '#8a6a48'); R(g, -2, -11, U, 3, '#8a6a48'); disc(g, 2, -5, 0.8, '#f8ecd6'); } R(g, -5, -6, 1.5, U, '#2a2430'); R(g, -2, -6, 1.5, U, '#2a2430'); txt(g, 'Z', 3, -13, '#5aa8e0'); }
    else { R(g, -0.5, -14, 1, 4, '#c8c0d4'); disc(g, 0, -15, 1.6, '#c8c0d4'); ell(g, 0, -4, 6, 3, '#f8f8f4'); if (i === 1) { for (let k = 0; k < 5; k++) disc(g, -3 + k * 1.5, -7, 1.1, c); R(g, -5, -6, 10, 2, '#1d2a24'); } else { ell(g, 0, -7, 6.5, 2.5, c); if (i === 2) R(g, -1, -9, 2, 5, '#1d2a24'); if (i === 3) for (let k = -4; k <= 4; k += 2) R(g, k, -8, U, 2, '#e8806a'); } }
    g.restore();
  }
  const CAPS = {
    init(m) { m.key = m.sp.series; m.s = SERIES[m.key]; m.f = Math.random() * 4 | 0; G.caps = G.caps || {}; },
    update(m, dt) {
      const t0 = m.t - dt, x = v => t0 < v && m.t >= v; [0.15, 0.3, 0.45].slice(0, Math.round(m.s[3] / 100)).forEach(v => { if (x(v)) Snd.fx('coin'); }); if (x(0.9)) Snd.fx('gacon'); if (x(1.6)) Snd.fx('yay');
      if (m.t > 2.1 && KP.a) {
        const box = G.caps[m.key] = G.caps[m.key] || {}, nw = !box[m.f]; box[m.f] = 1; save(); const have = count(box);
        endMini(false, [(nw ? 'NEW: ' : 'ANOTHER ') + m.s[1][m.f] + '. ' + have + ' OF 4 ' + m.s[0] + '.', have === 4 ? (nw ? 'THE WHOLE SET! YOU LINE THEM UP ON YOUR PALM AND GRIN AT NOBODY IN PARTICULAR.' : 'YOU ALREADY HAVE THE WHOLE SET. THIS ONE CAN BE A PRESENT.') : nw ? 'THE EMPTY CAPSULE GOES IN THE RECYCLING BOX ON THE SIDE OF THE MACHINE.' : 'THE DREADED DOUBLE. EVERY COLLECTOR KNOWS THIS FEELING.']);
      }
    },
    draw(m) {
      const [name, , cols, price] = m.s; txtC(ctx, name, 160, 26, '#c8382e'); txtC(ctx, price + ' YEN A GO', 160, 34, '#8a7a6a');
      const sh = m.t < 0.9 && m.t > 0.5 ? Math.sin(m.t * 50) : 0; R(ctx, 104 + sh, 42, 48, 70, '#f4f1e6'); R(ctx, 104 + sh, 42, 48, 2, '#ffffff'); R(ctx, 108 + sh, 46, 40, 32, '#cfeaff'); for (let i = 0; i < 10; i++) disc(ctx, 113 + sh + (i * 13 % 30), 56 + (i * 7 % 18), 3.5, cols[i % 4]);
      R(ctx, 108 + sh, 80, 40, 20, cols[0] === '#f4f1e6' ? '#f2a03a' : cols[0]); disc(ctx, 128 + sh, 90, 5, '#f4f1e6'); R(ctx, 127 + sh + Math.cos(m.t * 9) * (m.t > 0.5 && m.t < 0.9 ? 3 : 0), 89, 2, 2, '#3a3346'); R(ctx, 120, 103, 16, 5, '#1d1626');
      // the set on the card on the front
      m.s[1].forEach((n, i) => { const x = 176 + (i % 2) * 34, y = 66 + (i >> 1) * 30, have = G.caps[m.key] && G.caps[m.key][i]; R(ctx, x - 14, y - 22, 28, 26, have ? '#fff8e0' : '#e8e0d0'); if (have || i === m.f && m.t > 1.6) capArt(ctx, m.key, i, x, y, 1); else txtC(ctx, '?', x, y - 12, '#b8a888'); });
      if (m.t > 0.9) { const open = m.t > 1.6, y = Math.min(118, 108 + (m.t - 0.9) * 30); if (!open) { disc(ctx, 128, y, 6, cols[m.f]); R(ctx, 122, y, 12, 1, '#1d1626'); disc(ctx, 126, y - 3, 1.8, '#ffffff'); } else { capArt(ctx, m.key, m.f, 76, 92, 2); wrap(m.s[1][m.f], 54).forEach((l, i) => txtC(ctx, l, 76, 97 + i * 7, '#c8382e')); } }
      txtC(ctx, m.t > 2.1 ? 'E TO TAKE IT' : 'CLUNK... CLUNK...', 160, 129, '#8a7a6a');
    }
  };

  // ---------- the boutique's fitting room ----------
  const FIT = {
    init(m) { m.list = kago().items.filter(i => i.fit != null); m.i = 0; m.ph = 'try'; m.pt = 0; M.fitting = 1; },
    update(m, dt) {
      m.pt += dt; const n = m.list.length;
      if (m.ph === 'try') { if (KP.l) { m.i = (m.i + n - 1) % n; Snd.fx('ui'); } if (KP.r) { m.i = (m.i + 1) % n; Snd.fx('ui'); } if (KP.a && m.t > 0.2) { m.ph = 'ask'; m.pt = 0; Snd.fx('talk'); } }
      else if (m.pt > 1.6 && KP.a) { M.fitting = 0; m.list[m.i].tried = 1; endMini(false, ['"IKAGA DESU KA?" HOW IS IT? SHE ASKS FROM OUTSIDE THE CURTAIN.', 'THE ' + m.list[m.i].n + ' FITS. YOU STEP BACK INTO YOUR SHOES. PAY FOR IT AT THE TILL, AND YOU CAN WEAR IT OUT OF THE SHOP.']); }
    },
    draw(m) {
      const it = m.list[m.i]; txtC(ctx, 'FITTING ROOM', 160, 26, '#c8382e');
      R(ctx, 120, 34, 80, 82, '#8a8496'); R(ctx, 123, 37, 74, 76, '#cfeaff'); R(ctx, 127, 39, 5, 72, '#ffffff'); const f = plLook(it.fit).d[Math.floor(G.t * 2) % 2 ? 0 : 5]; ctx.drawImage(f, 136, 52, 48, 64);
      R(ctx, 58, 34, 14, 82, '#c8486a'); for (let y = 36; y < 116; y += 6) R(ctx, 58, y, 14, 1, '#a83a58'); R(ctx, 248, 34, 14, 82, '#c8486a'); for (let y = 36; y < 116; y += 6) R(ctx, 248, y, 14, 1, '#a83a58');
      if (m.list.length > 1) { txt(ctx, '<', 106, 70, '#c8382e', null, 2); txt(ctx, '>', 208, 70, '#c8382e', null, 2); }
      txtC(ctx, m.ph === 'ask' ? '"IKAGA DESU KA?"' : it.n + '  ' + yen(it.p), 160, 120, '#3a2e40'); txtC(ctx, m.ph === 'ask' ? 'E: "IT FITS!"' : '< > SWAP   E THIS ONE   ESC STEP OUT', 160, 129, '#8a7a6a');
    }
  };
  function fittingRoom(x, y) { M.SPOTS.push({ x, y, r: 14, label: 'USE THE FITTING ROOM', fn: () => { const has = kago().items.some(i => i.fit != null); if (!has) { dialog(['"PLEASE BRING SOMETHING TO TRY ON. UP TO THREE AT A TIME!" THE RACKS ARE ALL AROUND YOU.']); return; } dialog(['"SHOES OFF, PLEASE." YOU STEP OUT OF YOUR SHOES AND ONTO THE LITTLE RAISED FLOOR. THE CURTAIN SWISHES SHUT.'], () => { G.state = 'mini'; G.mg = { k: 'fitting', sp: { label: 'FIT' }, t: 0 }; MG.fitting.init(G.mg); }); } }); }

  // ---------- shop furniture ----------
  let made = false;
  function sprites() {
    if (made) return; made = true;
    // konbini gondolas, each with its own goods on two shelves and a sign on top
    const gond = (name, sign, row) => one(name, 64, 28, g => { R(g, 2, 8, 60, 18, '#e8e8e4'); R(g, 2, 8, 60, 1, '#ffffff'); R(g, 2, 25, 60, 1, '#a8a2b4'); R(g, 18, 0, 28, 7, '#3f9a5a'); txtC(g, sign, 32, 1, '#ffffff'); for (let r = 0; r < 2; r++) { R(g, 2, 16 + r * 9, 60, 1, '#c8c0c8'); for (let x = 5; x < 59; x += 6) row(g, x, 15 + r * 9, (x + r * 7) % 5); } }, 1);
    gond('kgSnack', 'SNACKS', (g, x, y, k) => { const c = ['#e0563f', '#f2c14e', '#5aa85a', '#8a6aff', '#f06a8c'][k]; R(g, x, y - 6, 5, 6, c); R(g, x, y - 6, 5, 1, lite(c, 0.4)); disc(g, x + 2.5, y - 3, 1.2, '#f8f0d8'); });
    gond('kgNoodle', 'NOODLES', (g, x, y, k) => { if (k % 2) { R(g, x, y - 6, 5, 6, '#f4f1e6'); R(g, x, y - 4, 5, 2, ['#e0452f', '#f2a03a', '#5aa85a'][k % 3]); } else { ell(g, x + 2.5, y - 2, 3, 2, ['#e8c060', '#c8783a', '#8a5a3a'][k % 3]); } });
    gond('kgGoods', 'DAILY', (g, x, y, k) => { const c = ['#5aa8e0', '#f4f1e6', '#f9a8c8', '#3a3a4e', '#8fc97a'][k]; R(g, x, y - 5, 5, 5, '#f4f1e6'); R(g, x, y - 3.5, 5, 2, c); });
    gond('kgSweet', 'SWEETS', (g, x, y, k) => { const c = ['#f2d070', '#f9a8c8', '#f4ead4', '#6ab86a', '#a86a2a'][k]; R(g, x + 0.5, y - 4, 4, 4, c); R(g, x, y - 5, 5, 1, 'rgba(230,240,250,0.8)'); });
    one('kFreezer', 30, 20, g => { R(g, 1, 4, 28, 15, '#e8e8e4'); R(g, 1, 4, 28, 1, '#ffffff'); R(g, 3, 5, 24, 8, '#bfe0f0'); for (let i = 0; i < 6; i++) { const c = ['#6ab86a', '#5ac8f0', '#f4f1e6', '#f9a8c8', '#f2d070', '#a86a2a'][i]; R(g, 4 + i * 4, 7 + (i % 2) * 2, 3, 3, c); } R(g, 3, 5, 24, 1, '#ffffff'); R(g, 15, 5, U, 8, '#ffffff'); R(g, 1, 18, 28, 1, '#a8a2b4'); txt(g, 'ICE', 11, 13.5, '#5aa8e0'); }, 1);
    one('kBack', 88, 26, g => { R(g, 0, 0, 88, 26, '#5a5468'); R(g, 0, 0, 88, 1, '#8a8496'); for (let r = 0; r < 3; r++) for (let x = 3; x < 46; x += 3) R(g, x, 3 + r * 6, 2, 4, ['#f4f1e6', '#3a5ac8', '#c8382e', '#f2c14e', '#3a3a4e'][(x + r) % 5]); R(g, 50, 6, 18, 12, '#e8e4ec'); R(g, 51, 7, 12, 10, '#2a2430'); R(g, 64, 8, 3, 2, '#5ad88a'); R(g, 72, 4, 12, 16, '#e8e4ec'); R(g, 73, 5, 10, 6, '#f4f1e6'); R(g, 0, 20, 88, 6, '#c89a6a'); R(g, 0, 20, 88, 1, '#f0d0a0'); });
    one('kEatin', 128, 14, g => { R(g, 0, 0, 128, 6, '#c89a6a'); R(g, 0, 0, 128, 1, '#f0d0a0'); R(g, 0, 6, 128, 8, '#8a5a3a'); for (let x = 8; x < 128; x += 16) R(g, x, 6, U, 8, '#6a4028'); R(g, 112, -0, 10, 6, '#c8c0d4'); });
    one('kPot', 10, 14, g => { R(g, 1, 3, 8, 11, '#e8e4ec'); R(g, 1, 3, 8, 1, '#ffffff'); R(g, 3, 0, 4, 3, '#8a8496'); R(g, 7, 6, 3, 2, '#8a8496'); R(g, 2, 9, 6, 2, '#e0452f'); }, 1);
    one('kBins', 40, 22, g => { BINS.forEach(([, c], i) => { const x = 1 + i * 13; R(g, x, 6, 12, 16, '#8a8496'); R(g, x, 6, 12, 1, '#c8c0d4'); R(g, x - 0.5, 3, 13, 4, c); R(g, x + 4, 4, 4, 1.5, '#1d1626'); }); }, 1);
    one('kStool', 8, 10, g => { R(g, 3.5, 4, 1, 6, '#5a5468'); ell(g, 4, 3, 3.5, 2.2, '#3a3a4e'); ell(g, 3.5, 2.5, 2, 1, '#6a6a80'); }, 1);
    one('kGate', 6, 16, g => { R(g, 0, 0, 6, 16, '#c89a6a'); R(g, 0, 0, 6, 1, '#f0d0a0'); R(g, 0, 15, 6, 1, '#6a4028'); });
    // the figure shop: islands of capsule machines, a big featured machine, a change machine, rental glass cases, a junk bin
    one('gRow', 74, 30, g => { for (let i = 0; i < 6; i++) { const x = 1 + i * 12, c = ['#f06a8c', '#5aa8e0', '#f2c14e', '#5aa85a', '#8a6aff', '#e0563f'][i]; R(g, x, 2, 11, 27, '#f4f1e6'); R(g, x, 2, 11, 1, '#ffffff'); R(g, x + 10, 2, 1, 27, '#c8c0d0'); R(g, x + 1, 0, 9, 4, c); for (const yy of [5, 16]) { R(g, x + 1.5, yy, 8, 7, '#cfeaff'); for (let k = 0; k < 4; k++) disc(g, x + 3.5 + (k % 2) * 4, yy + 2.5 + (k >> 1) * 2.5, 1.3, ['#f06a8c', '#f2c14e', '#5aa8e0', '#8fc97a'][(k + i) % 4]); R(g, x + 1.5, yy + 7.5, 8, 3, c); disc(g, x + 5.5, yy + 9, 1, '#f4f1e6'); } } }, 1);
    one('gBig', 26, 38, g => { R(g, 1, 4, 24, 34, '#e0563f'); R(g, 1, 4, 24, 1, '#f08a7a'); R(g, 0, 0, 26, 6, '#f2c14e'); txt(g, 'HERO', 4, 0.5, '#c8382e'); R(g, 3, 8, 20, 16, '#cfeaff'); for (let k = 0; k < 9; k++) disc(g, 6 + (k % 3) * 7, 11 + (k / 3 | 0) * 5, 2.2, FIGC[k % 6]); R(g, 3, 8, 20, 1, '#ffffff'); disc(g, 13, 29, 3.5, '#f4f1e6'); R(g, 12, 28.5, 2, 1, '#3a3346'); R(g, 8, 34, 10, 3, '#1d1626'); }, 1);
    one('gChange', 16, 28, g => { R(g, 1, 0, 14, 28, '#5a6a8a'); R(g, 1, 0, 14, 1, '#8a9ab8'); R(g, 3, 3, 10, 5, '#f2c14e'); txt(g, '100', 3.5, 3, '#3a2e40'); R(g, 4, 11, 8, 2, '#1d1626'); R(g, 4, 20, 8, 5, '#3a3a4e'); disc(g, 8, 23, 1.2, '#c8c0d4'); }, 1);
    for (let v = 0; v < 4; v++) one('gCase' + v, 28, 48, g => { const r = RNG(v * 17 + 3); R(g, 1, 0, 26, 48, '#8a8496'); R(g, 2, 1, 24, 40, '#dff0fa'); R(g, 2, 1, 1, 40, '#ffffff'); for (let s = 0; s < 4; s++) { R(g, 2, 10 + s * 10, 24, 1, '#c8d8e4'); for (let k = 0; k < 4; k++) { const x = 5 + k * 5.5 + r() * 1.5, c = FIGC[r() * 6 | 0]; if (r() < 0.82) { disc(g, x + 1, 4 + s * 10, 1.2, '#f6cfa6'); R(g, x, 5.5 + s * 10, 2.5, 4, c); } else R(g, x - 0.5, 3 + s * 10, 4, 7, ['#e0563f', '#5aa8e0', '#f2c14e'][r() * 3 | 0]); } } R(g, 1, 41, 26, 7, '#5a5468'); R(g, 9, 43, 10, 3, '#f4f1e6'); }, 1);
    one('gJunk', 28, 18, g => { R(g, 1, 6, 26, 12, '#8a8496'); for (let x = 2; x < 27; x += 3) R(g, x, 6, U, 12, '#c8c0d4'); for (let k = 0; k < 8; k++) R(g, 3 + k * 3, 2 + (k * 5 % 4), 3, 5, ['#e0563f', '#3a3a4e', '#f2c14e', '#5aa8e0', '#8a6aff'][k % 5]); R(g, 1, 6, 26, 1, '#e8e4ec'); R(g, 6, 0, 14, 4, '#f2c14e'); txt(g, 'JUNK', 7, -0.5, '#3a2e40'); }, 1);
    // the boutique: mannequins, the fitting rooms (curtain open and shut), a long mirror, a table of folded tees, accessories
    one('bMirror', 14, 40, g => { R(g, 0, 0, 14, 40, '#d9b04a'); R(g, 1.5, 1.5, 11, 36, '#cfeaff'); R(g, 3, 3, 2, 30, '#ffffff'); R(g, 8, 6, 1, 20, '#ffffff'); R(g, 2, 38, 10, 2, '#8a6a2a'); }, 1);
    for (const shut of [0, 1]) one(shut ? 'bFitC' : 'bFitO', 32, 48, g => { R(g, 0, 0, 32, 4, '#5a5468'); R(g, 1, 4, 30, 44, '#f4eef0'); R(g, 1, 40, 30, 8, '#d8c8b8'); R(g, 1, 40, 30, 1, '#ffffff'); if (shut) { for (let x = 2; x < 31; x += 3) { R(g, x, 4, 3, 38, '#c8486a'); R(g, x, 4, 1, 38, '#e06a8a'); } } else { for (let x = 2; x < 9; x += 3) { R(g, x, 4, 3, 38, '#c8486a'); R(g, x, 4, 1, 38, '#e06a8a'); } R(g, 20, 8, 9, 30, '#cfeaff'); R(g, 21, 10, 2, 24, '#ffffff'); R(g, 12, 20, 6, 1, '#c8c0d4'); } R(g, 0, 0, 32, 1, '#8a8496'); });
    one('bTees', 34, 20, g => { ell(g, 17, 13, 16, 6, '#8a5a3a'); ell(g, 17, 12, 16, 6, '#e8d8c0'); for (let k = 0; k < 4; k++) { const x = 5 + k * 7, c = ['#f4f1e6', '#f06a8c', '#5aa8e0', '#3a3a4e'][k]; for (let s = 0; s < 3; s++) { R(g, x, 9 - s * 2, 6, 2, c); R(g, x, 9 - s * 2, 6, U, lite(c, 0.3)); } } R(g, 16, 17, 2, 3, '#6a4028'); }, 1);
    one('bAcc', 22, 32, g => { R(g, 10, 6, 2, 24, '#c8c0d4'); R(g, 4, 30, 14, 2, '#8a8496'); R(g, 2, 6, 18, 1, '#c8c0d4'); ell(g, 5, 5, 4, 2.5, '#f2c14e'); ell(g, 17, 5, 4, 2.5, '#3a3a4e'); R(g, 3, 12, 6, 7, '#e8d8c0'); R(g, 13, 12, 6, 7, '#f06a8c'); R(g, 4, 10, 1, 2, '#8a5a3a'); R(g, 7, 10, 1, 2, '#8a5a3a'); }, 1);
  }
  // a mannequin wearing a colour, cached per colour like furniture
  function manq(x, y, col) { const key = 'manq' + col; let s = FUR[key]; if (!s) { const c = mk(16, 38), g = c.g; R(g, 7, 30, 2, 6, '#8a8496'); ell(g, 8, 36.5, 6, 1.5, '#5a5468'); R(g, 4, 18, 8, 12, '#e8e4ec'); R(g, 3, 9, 10, 11, col); R(g, 1, 9, 2, 9, col); R(g, 13, 9, 2, 9, col); R(g, 3, 9, 10, 1, lite(col, 0.35)); R(g, 7, 9, 2, 3, dark(col, 0.3)); disc(g, 8, 5, 3.6, '#f4f0ec'); disc(g, 7, 4, 1.2, '#ffffff'); s = FUR[key] = outline(c); } put(s, x, y, 8, 37); block(x - 6, y - 4, x + 6, y); }

  return { sprites, shelf, till, kago, hud, tick, enter, shopper, arrive, staffDraw, eatIn, sortSpot, coffee, fittingRoom, manq, good, capArt, SERIES, edible,
    BENTO, SNACKS, NOODLES, SWEETS, ICE, GOODS, HOT, UMBRELLA, fridge, yen, total,
    minis: { shelf: SHELF, till: TILL, sort: SORT, washlet: WASH, capsule: CAPS, fitting: FIT } };
})();
