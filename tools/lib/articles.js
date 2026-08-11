/**
 * articles.js — long-form guides.
 *
 * Kept as a JS module rather than JSON because the bodies are prose with inline
 * links, which JSON makes miserable to write and read. Build-time only: nothing
 * here is ever fetched by the browser.
 *
 * Each article should stand on its own as something worth reading. If one ever
 * reads as filler wrapped around a link to a quiz, it should be deleted rather
 * than padded.
 */

export const ARTICLES = [
  {
    slug: 'how-to-memorise-every-country',
    title: 'How to memorise all 195 countries',
    metaTitle: 'How to Memorise All 195 Countries — A Method That Works',
    description:
      'A practical method for learning every country in the world: the order to learn them in, why flags come before capitals, and how long it actually takes.',
    updated: '11 August 2026',
    summary:
      'Most people stall at around forty countries. The gap between that and all 195 is not talent, it is method — and the method is more specific than "practise more".',
    body: `
<p>Almost everyone can name thirty or forty countries without thinking. Almost nobody gets to 195 by accident. The gap between those two numbers is not intelligence or memory; it is that the first forty are learned incidentally, from news and football and holidays, and the remaining 155 have to be learned deliberately.</p>

<p>Deliberately does not mean painfully. It means in a particular order, in short sessions, with immediate correction. Here is what actually works.</p>

<h2>Why the obvious approach fails</h2>

<p>The instinct is to find an alphabetical list and work down it. This fails for a specific reason: alphabetical order destroys every useful association. Afghanistan, Albania, Algeria, Andorra — four countries on three continents with nothing in common. Your memory has nothing to attach them to, so each one is stored as an isolated fact, and isolated facts decay fast.</p>

<p>The second instinct is to stare at a world map until it sinks in. This fails differently. Recognition is not recall. You will feel like you know the map while you are looking at it and discover you cannot produce a single name once it is gone. Anything that lets you passively review without being tested is giving you a false reading of your own knowledge.</p>

<h2>Learn regions, not countries</h2>

<p>The unit of learning should be a region of five to fifteen countries, not a single country and not a whole continent.</p>

<p>Regions work because they give you scaffolding. When you learn Central America as a block — Guatemala, Belize, Honduras, El Salvador, Nicaragua, Costa Rica, Panama — you are not learning seven facts. You are learning one chain, running north to south, where each country holds the next in place. Miss one and the gap is obvious. That is the difference between a list and a structure.</p>

<p>A reasonable division into blocks:</p>

<ul>
  <li><strong>Start:</strong> South America (12), Central America (7), Northern Europe (10)</li>
  <li><strong>Then:</strong> Western Europe, Southern Europe, the Balkans, Eastern Europe</li>
  <li><strong>Then:</strong> East Asia, Southeast Asia, South Asia, Central Asia, the Middle East</li>
  <li><strong>Then:</strong> North Africa, West Africa, East Africa, Central Africa, Southern Africa</li>
  <li><strong>Last:</strong> the Caribbean, the Pacific islands</li>
</ul>

<p>South America first is a deliberate choice. Twelve countries, all large, all distinct in shape, no microstates, and a clear spatial arrangement. It is the easiest complete region in the world, and finishing something complete early matters more than it sounds. Leave the Caribbean and the Pacific until last for the opposite reason: they are the two blocks where the countries are small, numerous and easily confused, and attempting them early is the most common point at which people give up.</p>

<h2>Flags before capitals</h2>

<p>If you are learning names, flags and capitals, learn them in that order — and put a real gap between flags and capitals.</p>

<p>Flags are visual, and visual memory is both faster to form and more durable than verbal memory. More usefully, a flag becomes a hook. Once you can recognise Ghana's flag, the name Ghana has something to hang on, and the capital Accra later attaches to that same cluster rather than floating free.</p>

<p>Capitals are the hardest of the three because nothing about the word points to the country. There is no logic connecting Bishkek to Kyrgyzstan or Thimphu to Bhutan; the link is arbitrary and has to be built by repetition alone. Attempting capitals before the country names are solid means building an arbitrary link onto an unstable foundation, which is why capitals feel disproportionately hard when people rush them.</p>

<p>In practice: <a href="/game/continent-quiz.html">continents</a> until they are automatic, then <a href="/game/flag-quiz.html">flags</a> region by region, then <a href="/game/capital-quiz.html">capitals</a> over the same regions in the same order.</p>

<h2>Short sessions, spaced out</h2>

<p>Ten minutes a day beats an hour on Sunday, and it is not close. This is one of the most reliably reproduced findings in the study of memory: the same total time distributed across more days produces substantially better retention than the same time massed together.</p>

<p>The reason is that forgetting is part of the mechanism. Each time you nearly forget something and then retrieve it, the memory is strengthened more than it would be by smooth uninterrupted review. Cramming removes the forgetting, and with it most of the benefit. A round that takes a minute, done most days, will get you further in a month than three long sessions.</p>

<h2>Use the near-misses</h2>

<p>The most valuable moment in any session is the one where you get an answer wrong but nearly right — you said Guinea and it was Guinea-Bissau, or Slovakia when it was Slovenia. Those pairs are where your knowledge is genuinely incomplete, and they are worth more attention than the countries you missed completely.</p>

<p>A country you have never heard of takes one exposure to start learning. A country you confuse with another takes several, because you have to build a distinction rather than a fact. Keep a short list of your own confusions and attack them directly. The usual suspects:</p>

<ul>
  <li><a href="/countries/slovakia.html">Slovakia</a> and <a href="/countries/slovenia.html">Slovenia</a></li>
  <li><a href="/countries/niger.html">Niger</a> and <a href="/countries/nigeria.html">Nigeria</a></li>
  <li><a href="/countries/guinea.html">Guinea</a>, <a href="/countries/guinea-bissau.html">Guinea-Bissau</a> and <a href="/countries/equatorial-guinea.html">Equatorial Guinea</a></li>
  <li><a href="/countries/dominica.html">Dominica</a> and the <a href="/countries/dominican-republic.html">Dominican Republic</a></li>
  <li><a href="/countries/austria.html">Austria</a> and <a href="/countries/australia.html">Australia</a></li>
  <li><a href="/countries/mauritania.html">Mauritania</a> and <a href="/countries/mauritius.html">Mauritius</a></li>
</ul>

<p>Every one of those pairs is a genuine distinction worth holding — different continents in several cases — and each is worth more than a dozen countries you already half-know.</p>

<h2>Expect the difficulty to be uneven</h2>

<p>The 195 are not equally hard, and the distribution is lopsided. Roughly sixty are effectively free: the countries that appear in news, sport and film often enough that you absorb them without effort. Another eighty or so take moderate work. The last fifty — the Pacific microstates, the smaller Caribbean islands, the less-reported parts of Central Africa and Central Asia — take as long as the first 145 combined.</p>

<p>Knowing this in advance matters, because the point at which progress slows is exactly the point at which most people conclude they have hit their limit. They have not. They have reached the part where the countries stop being reinforced by everyday life, and where deliberate practice starts doing all the work.</p>

<h2>A realistic timeline</h2>

<p>At ten to fifteen minutes a day, most people can expect roughly this:</p>

<ul>
  <li><strong>Week 1–2:</strong> continents solid, South and Central America complete</li>
  <li><strong>Week 3–5:</strong> Europe complete, including the Balkans</li>
  <li><strong>Week 6–9:</strong> Asia complete</li>
  <li><strong>Week 10–14:</strong> Africa complete — the largest block, 54 countries</li>
  <li><strong>Week 15–18:</strong> the Caribbean and the Pacific</li>
</ul>

<p>Four to five months, and it holds afterwards with occasional review. The people who do this successfully are not doing more per day than that. They are doing it on more days.</p>

<h2>How to test yourself honestly</h2>

<p>Recognition inflates confidence. Reading a list and thinking "yes, I know that one" tells you almost nothing about whether you could produce it unprompted. The only reliable test is one that makes you retrieve the answer before showing it to you, and that penalises a wrong answer with immediate correction.</p>

<p>That is what the games here are built around: one question at a time, the correct answer shown the moment you miss, and no way to skip ahead. When a region starts feeling comfortable, the <a href="/game/mixed-quiz.html">mixed quiz</a> is the honest check, because it removes the context that makes a single-region round easier than it looks.</p>
`
  },

  {
    slug: 'why-flags-look-alike',
    title: 'Why so many national flags look alike',
    metaTitle: 'Why So Many National Flags Look Alike — Patterns Explained',
    description:
      'Tricolours, Pan-African and Pan-Arab colours and Nordic crosses: the design families behind the world flags, and how to tell the confusable pairs apart.',
    updated: '11 August 2026',
    summary:
      'World flags are not 195 independent designs. They are a few dozen families, and once you can see the families the confusable pairs stop being confusing.',
    body: `
<p>Anyone who has taken a flag quiz has had the same experience: two flags that appear to be the same flag. Chad and Romania. Monaco and Indonesia. Ireland and Ivory Coast. It feels like carelessness on somebody's part.</p>

<p>It is not. National flags are not 195 independent designs — they are a small number of design families, each with a history, and countries that share a family share a look. Once you can see the families, the resemblances stop being noise and start being information.</p>

<h2>The tricolour and where it came from</h2>

<p>The single most copied flag in history is the French tricolour of 1794. Three vertical bands, equal width, no emblem. It was a deliberate break from the heraldic banners of European monarchies, which were dense with crowns, lions and crosses, and it carried an unmistakable political message: this is a republic.</p>

<p>That message travelled. Through the nineteenth century, new states and revolutionary movements adopted vertical tricolours precisely because the form itself said something. Italy, Belgium, Ireland, Romania, Chad, Mali, Guinea, Ivory Coast and many more use the pattern. When you see three vertical bands, you are usually looking at a country that at some point wanted to signal a republican break with the past.</p>

<p>Horizontal tricolours have a separate and older ancestor: the Dutch flag, in use in some form since the late sixteenth century. It is the reason so many horizontal three-band flags exist across Europe and, through a chain described below, across the Slavic world.</p>

<h2>Pan-Slavic colours: red, white and blue</h2>

<p>In 1848, a congress in Prague adopted red, white and blue as the colours of Slavic nationhood, taken from the Russian flag — which had itself been modelled on the Dutch one. The result is that a large group of Central and Eastern European countries share a palette.</p>

<p><a href="/countries/russia.html">Russia</a>, <a href="/countries/serbia.html">Serbia</a>, <a href="/countries/slovakia.html">Slovakia</a>, <a href="/countries/slovenia.html">Slovenia</a>, <a href="/countries/croatia.html">Croatia</a> and <a href="/countries/czechia.html">Czechia</a> all draw on it. Slovakia and Slovenia are near-identical at a glance — same three horizontal bands in the same order — and are distinguished only by their coats of arms and where those sit. This is the single most common confusion in flag quizzes, and it is a genuine one rather than a trick.</p>

<h2>Pan-African colours: red, gold and green</h2>

<p>Ethiopia was the only African state to keep its independence through the colonial period, apart from a brief Italian occupation. Its flag — green, yellow and red — became the natural reference point for independence movements across the continent, and a wave of countries adopted the same palette on gaining independence from the 1950s onward.</p>

<p><a href="/countries/ghana.html">Ghana</a>, <a href="/countries/senegal.html">Senegal</a>, <a href="/countries/mali.html">Mali</a>, <a href="/countries/guinea.html">Guinea</a>, <a href="/countries/cameroon.html">Cameroon</a>, <a href="/countries/togo.html">Togo</a> and others use it. Mali and Guinea are the same three vertical bands in opposite orders — green, gold, red one way and red, gold, green the other — which makes them a reliable trap.</p>

<p>A second and separate group uses red, black and green, drawn from the Pan-Africanist movement of the Americas rather than from Ethiopia. <a href="/countries/kenya.html">Kenya</a>, <a href="/countries/malawi.html">Malawi</a> and <a href="/countries/south-sudan.html">South Sudan</a> sit in this family.</p>

<h2>Pan-Arab colours: red, white, black and green</h2>

<p>The four colours of the Arab Revolt of 1916 — each associated with a historic caliphate or dynasty — form another large family. <a href="/countries/jordan.html">Jordan</a>, <a href="/countries/palestine.html">Palestine</a>, <a href="/countries/kuwait.html">Kuwait</a>, <a href="/countries/united-arab-emirates.html">the United Arab Emirates</a>, <a href="/countries/sudan.html">Sudan</a>, <a href="/countries/syria.html">Syria</a>, <a href="/countries/iraq.html">Iraq</a>, <a href="/countries/yemen.html">Yemen</a> and <a href="/countries/egypt.html">Egypt</a> all draw on the same four.</p>

<p>The horizontal red-white-black arrangement in particular is shared by several, differentiated only by added stars, script or an emblem in the centre. Learning to read the centre emblem rather than the bands is the only way through this group.</p>

<h2>The Nordic cross</h2>

<p>One of the most consistent families anywhere. A cross with its vertical arm shifted toward the hoist, originating with Denmark's Dannebrog — traditionally dated to 1219 and among the oldest continuously used national flags in the world.</p>

<p><a href="/countries/denmark.html">Denmark</a>, <a href="/countries/sweden.html">Sweden</a>, <a href="/countries/norway.html">Norway</a>, <a href="/countries/finland.html">Finland</a> and <a href="/countries/iceland.html">Iceland</a> all use it, and here the family resemblance is a gift rather than a problem: the shape identifies the region instantly, and only the colours need to be learned. Norway and Iceland are the closest pair, being colour inversions of each other.</p>

<h2>The Union Jack in the corner</h2>

<p>A canton — the upper corner nearest the flagpole — containing the British flag marks a former or current constitutional link to the United Kingdom. <a href="/countries/australia.html">Australia</a>, <a href="/countries/new-zealand.html">New Zealand</a>, <a href="/countries/fiji.html">Fiji</a> and <a href="/countries/tuvalu.html">Tuvalu</a> carry it.</p>

<p>Australia and New Zealand are the classic pair. Both are blue with the Union Jack and the Southern Cross. The differences are consistent and easy once you know them: Australia has six stars, one of them a large seven-pointed Commonwealth Star beneath the canton, and its Southern Cross stars are white with varying points. New Zealand has four stars only, they are red with white borders, and there is no star beneath the canton.</p>

<h2>The crescent and star</h2>

<p>Associated with the Ottoman Empire and now widely used across the Muslim world, though it long predates and is not exclusive to Islam. <a href="/countries/turkey.html">Turkey</a>, <a href="/countries/tunisia.html">Tunisia</a>, <a href="/countries/pakistan.html">Pakistan</a>, <a href="/countries/algeria.html">Algeria</a>, <a href="/countries/mauritania.html">Mauritania</a>, <a href="/countries/malaysia.html">Malaysia</a> and others use the motif in different arrangements.</p>

<p>Turkey and Tunisia both use a red field with a white crescent and star; Tunisia places them inside a white circle, Turkey does not.</p>

<h2>The pairs worth learning deliberately</h2>

<p>Some resemblances are close enough that they need to be studied as pairs rather than as individual flags:</p>

<ul>
  <li><strong><a href="/countries/chad.html">Chad</a> and <a href="/countries/romania.html">Romania</a></strong> — blue, yellow, red vertical bands. The difference is a slightly darker blue on Chad's. They are, in practice, the same flag, and the two governments have discussed it at the UN without resolution.</li>
  <li><strong><a href="/countries/monaco.html">Monaco</a> and <a href="/countries/indonesia.html">Indonesia</a></strong> — red over white, differing only in proportions. <a href="/countries/poland.html">Poland</a> is the same two colours reversed.</li>
  <li><strong><a href="/countries/ireland.html">Ireland</a> and <a href="/countries/ivory-coast.html">Ivory Coast</a></strong> — green, white, orange. Mirror images: Ireland has green at the hoist, Ivory Coast has orange.</li>
  <li><strong><a href="/countries/netherlands.html">Netherlands</a> and <a href="/countries/luxembourg.html">Luxembourg</a></strong> — red, white, blue horizontal bands. Luxembourg's blue is noticeably lighter and its flag is longer.</li>
  <li><strong><a href="/countries/mali.html">Mali</a> and <a href="/countries/guinea.html">Guinea</a></strong> — green, gold, red versus red, gold, green.</li>
</ul>

<h2>What this buys you</h2>

<p>The practical payoff is that you stop learning 195 separate images and start learning perhaps twenty families plus their exceptions. A flag you have never seen becomes readable: horizontal red-white-black with an emblem points at the Arab world, an off-centre cross points at the Nordic countries, green-gold-red points at post-independence Africa.</p>

<p>That is a much smaller thing to hold in your head, and it degrades gracefully — even a half-remembered flag can usually be placed on the right continent. The <a href="/game/flag-quiz.html">flag quiz</a> draws its wrong answers from the same continent as the right one specifically so that this kind of reasoning is required rather than optional.</p>
`
  },

  {
    slug: 'countries-people-misplace',
    title: 'The countries people most often misplace',
    metaTitle: 'The Countries People Most Often Misplace on a Map',
    description:
      'Africa is bigger than it looks, most of South America is east of Florida, and several countries sit on two continents. Common geography misconceptions explained.',
    updated: '11 August 2026',
    summary:
      'Some geographic errors are almost universal, and most of them trace back to the same two causes: a distorted map and a borrowed assumption.',
    body: `
<p>There is a category of geographic fact that almost everyone gets wrong, and it is not the obscure ones. Nobody feels bad about not knowing where Nauru is. The interesting errors are the confident ones — the countries and relationships people think they know and have backwards.</p>

<p>Nearly all of them come from one of two sources: a map projection that distorts what it shows, or an assumption carried over from a name.</p>

<h2>Africa is far larger than it looks</h2>

<p>The single most consequential misconception in world geography. On the Mercator projection — the one used by most wall maps and, until recently, most online mapping — Africa appears roughly the same size as Greenland. In reality Africa is about fourteen times larger.</p>

<p>The distortion is not a mistake. Mercator preserves angles, which is what makes it excellent for navigation: a straight line on the map is a constant compass bearing, which is precisely what a sixteenth-century ship needed. The cost of preserving angles is that area inflates as you move away from the equator, and it inflates dramatically near the poles.</p>

<p>The result is that equatorial regions — Africa, South America, Southeast Asia — appear small, and high-latitude regions — Greenland, Scandinavia, Russia, Canada — appear enormous. Africa's actual area of about 30 million square kilometres is large enough to contain the United States, China, India and most of Europe simultaneously, with room left over. Very few people picture it that way, because very few people have seen a map that shows it that way.</p>

<h2>Most of South America is east of Florida</h2>

<p>This one reliably surprises people. The continent is commonly imagined as sitting directly below North America, a straight vertical drop. It does not. South America is shifted substantially east.</p>

<p>Miami sits at about 80° west. Santiago, on Chile's Pacific coast and therefore the western edge of the continent, is at about 70° west — ten degrees east of Miami. The entirety of South America lies east of a line drawn south from Florida, and the eastern tip of Brazil is closer to Africa than it is to the western coast of its own continent.</p>

<p>The practical consequence people find hardest to accept: flying from New York to Santiago involves almost no westward travel at all, which is why the time difference is so small.</p>

<h2>Europe is further north than it feels</h2>

<p>Rome sits at roughly the same latitude as Chicago. Paris is north of Montreal. London is level with the southern tip of Hudson Bay, and Edinburgh is roughly level with Moscow.</p>

<p>Western Europe's climate is far milder than its latitude would suggest, because of the North Atlantic Current carrying warm water north-east from the Gulf of Mexico. Without it, London's winters would resemble Labrador's. Because people reason from climate to position rather than the other way round, Europe gets mentally shifted several hundred kilometres south.</p>

<h2>The countries on two continents</h2>

<p>Several countries straddle a continental boundary, and which continent they are assigned to is a convention rather than a fact.</p>

<ul>
  <li><strong><a href="/countries/russia.html">Russia</a></strong> — about 77% of its land is in Asia, but around 75% of its population lives in the European part. This site counts it as Europe, which is the more common convention and follows where the people and the capital are.</li>
  <li><strong><a href="/countries/turkey.html">Turkey</a></strong> — a small part around Istanbul is in Europe, the bulk in Asia. Counted here as Asia. Istanbul is the only major city in the world spanning two continents.</li>
  <li><strong><a href="/countries/egypt.html">Egypt</a></strong> — the Sinai Peninsula is in Asia, the rest in Africa. Counted here as Africa.</li>
  <li><strong><a href="/countries/georgia.html">Georgia</a>, <a href="/countries/armenia.html">Armenia</a>, <a href="/countries/azerbaijan.html">Azerbaijan</a> and <a href="/countries/cyprus.html">Cyprus</a></strong> — all sit on or near the boundary and are variously classified. Counted here as Asia, though all four compete in European sporting and cultural bodies.</li>
</ul>

<p>None of these assignments is more correct than the alternative. They are conventions, and the only thing that matters is that a given source applies one consistently. The <a href="/game/continent-quiz.html">continent quiz</a> follows the list above throughout.</p>

<h2>Countries confused with each other</h2>

<p>A separate class of error, caused by names rather than maps.</p>

<ul>
  <li><strong><a href="/countries/niger.html">Niger</a> and <a href="/countries/nigeria.html">Nigeria</a></strong> — neighbours, both named after the same river, and very different. Nigeria has over 220 million people and a coastline; Niger has around 26 million and is landlocked and mostly desert.</li>
  <li><strong><a href="/countries/slovakia.html">Slovakia</a> and <a href="/countries/slovenia.html">Slovenia</a></strong> — not neighbours, though both border Austria and Hungary. Their embassies in some capitals have reportedly met to exchange misdirected post.</li>
  <li><strong><a href="/countries/dominica.html">Dominica</a> and the <a href="/countries/dominican-republic.html">Dominican Republic</a></strong> — two different Caribbean countries around 1,000 kilometres apart, with different languages: English in Dominica, Spanish in the Dominican Republic.</li>
  <li><strong>The three Guineas</strong> — <a href="/countries/guinea.html">Guinea</a> and <a href="/countries/guinea-bissau.html">Guinea-Bissau</a> are neighbours in West Africa; <a href="/countries/equatorial-guinea.html">Equatorial Guinea</a> is roughly 3,000 kilometres away in Central Africa and is the only Spanish-speaking country in Africa. <a href="/countries/papua-new-guinea.html">Papua New Guinea</a> is in the Pacific and unrelated to any of them.</li>
  <li><strong><a href="/countries/mauritania.html">Mauritania</a> and <a href="/countries/mauritius.html">Mauritius</a></strong> — a Saharan country on Africa's Atlantic coast, and an Indian Ocean island nation east of Madagascar.</li>
</ul>

<h2>Capitals that are not the largest city</h2>

<p>A smaller but persistent error. The largest city is often assumed to be the capital, and frequently is not: Washington rather than New York, Canberra rather than Sydney, Ottawa rather than Toronto, Brasília rather than São Paulo, Abuja rather than Lagos, Ankara rather than Istanbul, Wellington rather than Auckland, Bern rather than Zurich.</p>

<p>The pattern is not coincidental. Many of these were chosen precisely because they were <em>not</em> the dominant city — a compromise between rival centres, or a deliberate attempt to shift power away from an overgrown commercial capital.</p>

<h2>Two countries entirely inside another</h2>

<p>Three countries in the world are completely surrounded by a single other country. <a href="/countries/vatican-city.html">Vatican City</a> and <a href="/countries/san-marino.html">San Marino</a> are both enclosed by <a href="/countries/italy.html">Italy</a>, and <a href="/countries/lesotho.html">Lesotho</a> is entirely surrounded by <a href="/countries/south-africa.html">South Africa</a>.</p>

<p>Lesotho is the outlier of the three by size and is the only country in the world with all of its territory above 1,000 metres.</p>

<h2>Why these persist</h2>

<p>What the errors have in common is that none of them is corrected by ordinary life. Nothing in a normal week tells you that Rome is level with Chicago. The Mercator distortion is invisible unless you go looking for it, because the map does not announce that it is trading area for angle.</p>

<p>They are corrected by being tested and getting them wrong — which is the entire argument for quizzing yourself rather than reading. The <a href="/game/map-quiz.html">map quiz</a> and the <a href="/game/continent-quiz.html">continent quiz</a> between them surface most of the errors on this page within a few rounds.</p>
`
  }
  ,
  {
    slug: 'why-capitals-move',
    title: 'Capital cities that are not the largest city',
    metaTitle: 'Why Capital Cities Are Often Not the Largest City',
    description:
      'Washington, Canberra, Brasilia and Abuja were all chosen over bigger rivals. Why capitals get moved, and the ones that keep catching quiz players out.',
    updated: '11 August 2026',
    summary:
      'Assuming the biggest city is the capital is wrong often enough to be worth understanding rather than memorising.',
    body: `
<p>Ask someone for the capital of Australia and a good proportion will say Sydney. Ask for Canada and many will say Toronto. For Brazil, Rio. For Nigeria, Lagos. For Turkey, Istanbul. Every one of those is the largest or best-known city in its country, and every one of them is wrong.</p>

<p>This is not a random scattering of exceptions. There are specific reasons a country ends up with a capital that is not its dominant city, and once you know the reasons the individual cases become much easier to hold.</p>

<h2>Reason one: a compromise between rivals</h2>

<p>The most common cause. When two cities are large enough that either would resent the other being chosen, the answer is often a third place that offends nobody.</p>

<p><a href="/countries/australia.html">Australia</a> is the clearest example. At federation in 1901, Sydney and Melbourne both expected the capital. Neither would accept the other, and the constitution settled it by requiring a capital in New South Wales but at least 100 miles from Sydney. Canberra was built from nothing in farmland between the two, and Melbourne served as the temporary capital until 1927.</p>

<p><a href="/countries/canada.html">Canada</a> followed similar logic. Queen Victoria selected Ottawa in 1857, a modest lumber town, over the larger and more obvious Montreal, Toronto, Quebec City and Kingston. It sat on the boundary between Upper and Lower Canada, was defensible from the United States, and had the singular advantage of not being any of the cities that were arguing.</p>

<p><a href="/countries/united-states.html">The United States</a> did the same thing earlier. Washington was placed on the Potomac in 1790 as part of a bargain between northern and southern states, on land ceded by Maryland and Virginia, belonging to no state at all.</p>

<h2>Reason two: moving power away from the coast</h2>

<p>Colonial capitals were almost always ports, because colonial economies faced outward. After independence, that inheritance often looks wrong: the capital sits at the edge of the country, oriented toward a former imperial power, with the interior neglected.</p>

<p><a href="/countries/brazil.html">Brazil</a> acted on this most dramatically. The capital had been Rio de Janeiro, on the Atlantic coast, while the vast interior remained thinly settled. Brasília was built from nothing on the central plateau and inaugurated in 1960 — a planned city, laid out in the shape of an aeroplane, roughly 1,000 kilometres inland. The explicit aim was to pull development toward the interior.</p>

<p><a href="/countries/nigeria.html">Nigeria</a> moved from Lagos to Abuja in 1991, for reasons of both congestion and neutrality: Abuja sits in the centre of the country, between the largely Muslim north and largely Christian south, and belonged to no dominant ethnic group.</p>

<p><a href="/countries/ivory-coast.html">Ivory Coast</a> designated Yamoussoukro in 1983, though Abidjan remains the economic centre and hosts most embassies. <a href="/countries/tanzania.html">Tanzania</a> made Dodoma its capital for similar reasons of centrality, with Dar es Salaam remaining much larger.</p>

<h2>Reason three: a deliberate break with the past</h2>

<p><a href="/countries/turkey.html">Turkey</a> moved its capital from Istanbul to Ankara in 1923. Istanbul had been the seat of the Ottoman Empire for centuries and of Byzantium before that; the new republic wanted a capital in the Anatolian heartland, associated with the nation rather than the empire. Istanbul remains several times larger.</p>

<p><a href="/countries/kazakhstan.html">Kazakhstan</a> moved from Almaty to Astana in 1997, shifting the capital north toward the centre of the country and away from a seismically active zone near the Chinese border.</p>

<p><a href="/countries/myanmar.html">Myanmar</a> made the most abrupt move of recent decades, relocating from Yangon to the purpose-built Naypyidaw in 2005 with little public explanation. The new capital is famously oversized for its population, with multi-lane highways that are usually near-empty.</p>

<h2>Reason four: it was never one city to begin with</h2>

<p>Some countries do not have a single capital at all.</p>

<p><a href="/countries/south-africa.html">South Africa</a> has three, a compromise from the 1910 union: Pretoria is the executive capital, Cape Town the legislative, and Bloemfontein the judicial. Johannesburg, the largest city, is none of them.</p>

<p><a href="/countries/bolivia.html">Bolivia</a> has two. Sucre is the constitutional capital and seat of the judiciary; La Paz holds the executive and legislature. Santa Cruz de la Sierra is larger than either.</p>

<p><a href="/countries/netherlands.html">The Netherlands</a> is the subtlest case: Amsterdam is the constitutional capital and the largest city, but the government, parliament, supreme court and royal residence are all in The Hague. The capital and the seat of government are simply different places.</p>

<h2>The ones that catch quiz players out</h2>

<p>Beyond the size mismatches, a few capitals are wrong in a different way — the commonly cited answer is out of date or oversimplified.</p>

<ul>
  <li><strong><a href="/countries/sri-lanka.html">Sri Lanka</a></strong> — the capital is Sri Jayawardenepura Kotte, not Colombo. Colombo is the commercial centre and much better known.</li>
  <li><strong><a href="/countries/benin.html">Benin</a></strong> — Porto-Novo is the official capital, but Cotonou is the seat of government and considerably larger.</li>
  <li><strong><a href="/countries/switzerland.html">Switzerland</a></strong> — Bern is the seat of government, but Swiss law designates no formal capital city at all.</li>
  <li><strong><a href="/countries/nauru.html">Nauru</a></strong> — has no official capital. Government offices are in the Yaren district, which is what most sources list.</li>
  <li><strong><a href="/countries/eswatini.html">Eswatini</a></strong> — Mbabane is administrative, Lobamba is legislative and royal.</li>
</ul>

<h2>Does a purpose-built capital work?</h2>

<p>The record is mixed and worth knowing, because the same arguments recur every time a country considers a move.</p>

<p>Brasília succeeded in its stated goal: the interior did develop, and the metropolitan area now holds several million people. It is also routinely criticised for a layout designed around cars, which makes it inconvenient for the people who actually live there rather than the diagram.</p>

<p>Abuja grew rapidly and did shift administrative weight away from Lagos, though Lagos remains the economic centre by a wide margin. Canberra works, but it took decades and it is still notably smaller than the cities it was chosen to placate.</p>

<p><a href="/countries/indonesia.html">Indonesia</a> is currently attempting the largest such move in progress, relocating from Jakarta — which is sinking, in places by more than ten centimetres a year — to a new city called Nusantara in Borneo. Whether it succeeds will be the best modern test of the idea.</p>

<p>If you want to find out how many of these you actually know rather than assume, the <a href="/game/capital-quiz.html">capital quiz</a> draws its wrong answers from the same continent as the right one, so guessing the biggest city in the region will not get you far.</p>
`
  },

  {
    slug: 'map-projections-explained',
    title: 'How to read a world map',
    metaTitle: 'Map Projections Explained — Why Every World Map Is Wrong',
    description:
      'Every flat world map distorts something. What Mercator, Gall-Peters and Winkel Tripel each preserve, what they sacrifice, and how to read around it.',
    updated: '11 August 2026',
    summary:
      'Every world map is wrong, necessarily and provably. The useful question is not which one is accurate but which distortion you are willing to accept.',
    body: `
<p>Every flat map of the world is wrong. This is not a criticism of cartographers; it is a mathematical certainty. A sphere cannot be flattened without stretching, tearing or compressing it somewhere, and no amount of cleverness escapes that.</p>

<p>Carl Friedrich Gauss proved the underlying result in 1827. A sphere has intrinsic curvature and a plane does not, so no mapping between them can preserve all distances. Every world map is therefore a choice about what to sacrifice — and understanding which choice was made is most of what it takes to read a map well.</p>

<h2>What a projection can preserve</h2>

<p>There are four properties a map might want, and no projection can hold all of them at once:</p>

<ul>
  <li><strong>Area</strong> — regions of equal size on the globe appear equal on the map</li>
  <li><strong>Shape</strong> — local angles are correct, so small features look right</li>
  <li><strong>Distance</strong> — measured distances are proportional to real ones</li>
  <li><strong>Direction</strong> — bearings from a point are true</li>
</ul>

<p>A projection that preserves shape is called conformal; one that preserves area is equal-area. Provably, no projection can be both. That single fact explains almost every argument about world maps.</p>

<h2>Mercator: correct angles, wildly wrong areas</h2>

<p>Gerardus Mercator published his projection in 1569 to solve a navigation problem. On his map, a straight line is a line of constant compass bearing — a rhumb line. A navigator could draw a straight line from Lisbon to Recife, read off the bearing, and hold that heading. For an age of sail with no reliable longitude, this was transformative.</p>

<p>The cost is area. To keep angles correct as meridians are forced parallel, Mercator stretches north-south distances by the same factor as east-west ones, and that factor grows without limit toward the poles. The consequences are severe:</p>

<ul>
  <li>Greenland appears roughly the size of Africa. Africa is about fourteen times larger.</li>
  <li>Alaska appears comparable to Brazil. Brazil is around five times larger.</li>
  <li>Antarctica appears to be an infinite white band, and the poles cannot be shown at all.</li>
</ul>

<p>Mercator is excellent at what it was designed for and poor at what it is mostly used for. Online slippy maps still use a variant, for a good reason: conformality means shapes stay correct at every zoom level, and north is always up. At street level the area distortion is irrelevant. At world level it is enormous.</p>

<h2>Gall-Peters: correct areas, distorted shapes</h2>

<p>The best-known equal-area response. Every country occupies its correct share of the map, which means the tropics are represented at their true size — the reason it was promoted from the 1970s as a corrective to Mercator's flattering of the northern hemisphere.</p>

<p>The trade is shape. Landmasses appear vertically stretched near the equator and horizontally squashed at high latitudes; Africa looks unnaturally elongated. It is honest about area and unpleasant to look at, which is roughly the opposite of Mercator's bargain.</p>

<h2>Robinson and Winkel Tripel: compromise</h2>

<p>Most modern world maps use a projection that preserves nothing exactly and everything approximately.</p>

<p>Arthur Robinson's 1963 projection was explicitly designed by eye rather than by formula — he tuned it until it looked right, then derived the mathematics. It was the National Geographic Society's standard world map from 1988 to 1998.</p>

<p>Winkel Tripel, which replaced it there in 1998, takes its name from the German for "triple", referring to its aim of minimising three distortions at once: area, direction and distance. It is now the most common choice for general-purpose world maps, and if you have seen a modern atlas world map, it was probably this.</p>

<h2>What the map quiz here uses</h2>

<p>The world map behind the <a href="/game/map-quiz.html">map quiz</a> is an equirectangular-family projection, the simplest of all: longitude maps directly to x, latitude to y. Lines of latitude and longitude form a perfect grid.</p>

<p>This is not a good projection for reading area — it stretches high latitudes horizontally, which is why Greenland, northern Canada and Russia look wider than they should. It is a good projection for interaction, because the relationship between screen position and coordinates is simple and predictable.</p>

<p>It is worth knowing this while playing, because it affects what you see. Northern countries appear larger than they are. Norway's outline in particular looks enormously stretched vertically compared with its actual proportions, which is a projection artefact rather than an error in the map.</p>

<h2>Reading around the distortion</h2>

<p>A few habits make any world map more useful:</p>

<p><strong>Compare along the equator, not across latitudes.</strong> Two countries at similar latitudes are distorted by similar amounts, so comparing them is reasonably safe. Comparing Greenland with the Democratic Republic of the Congo is not.</p>

<p><strong>Distrust your sense of the far north.</strong> Russia, Canada, Greenland and Scandinavia are the regions where inflation is worst on the most common projections. Russia genuinely is enormous — it does not need the help the map gives it.</p>

<p><strong>Remember that shortest routes are not straight lines.</strong> A flight from London to Tokyo passes near the Arctic, which looks like a detour on a flat map and is in fact the shorter path on a sphere. This is why polar flight routes appear so strange when drawn on a world map.</p>

<p><strong>Use a globe when area matters.</strong> A globe is the only representation with no distortion at all. Every flat map is a compromise, and the honest question is never whether it is accurate but which inaccuracy you have agreed to accept.</p>

<p>If you want to test how much of your mental map survives contact with a real one, the <a href="/game/map-quiz.html">map quiz</a> and the <a href="/game/shape-quiz.html">country shape quiz</a> are the two games here that use actual geography rather than names.</p>
`
  },

  {
    slug: 'landlocked-countries',
    title: 'The landlocked countries, and why it matters',
    metaTitle: 'Landlocked Countries Explained — The Full List and Why It Matters',
    description:
      'Forty-four countries have no coastline and two are surrounded entirely by other landlocked countries. What being landlocked actually costs.',
    updated: '11 August 2026',
    summary:
      'Having no coastline is one of the strongest predictors of a country’s economic position, and the geography behind it is more varied than the label suggests.',
    body: `
<p>Forty-four countries have no coastline. That is more than a fifth of the world, and the label covers an unusually wide range: Switzerland and Austria are among the wealthiest countries on Earth, while a majority of the world's least developed countries are landlocked. The condition is not destiny, but it is not neutral either.</p>

<h2>Where they are</h2>

<p>Landlocked countries cluster, because the geography that produces them clusters.</p>

<p><strong>Europe</strong> has the most, and they are mostly small and mountainous: <a href="/countries/austria.html">Austria</a>, <a href="/countries/switzerland.html">Switzerland</a>, <a href="/countries/hungary.html">Hungary</a>, <a href="/countries/czechia.html">Czechia</a>, <a href="/countries/slovakia.html">Slovakia</a>, <a href="/countries/belarus.html">Belarus</a>, <a href="/countries/moldova.html">Moldova</a>, <a href="/countries/serbia.html">Serbia</a>, <a href="/countries/north-macedonia.html">North Macedonia</a>, <a href="/countries/luxembourg.html">Luxembourg</a>, <a href="/countries/liechtenstein.html">Liechtenstein</a>, <a href="/countries/andorra.html">Andorra</a>, <a href="/countries/san-marino.html">San Marino</a> and <a href="/countries/vatican-city.html">Vatican City</a>.</p>

<p><strong>Africa</strong> has sixteen, the largest concentration of landlocked countries with limited infrastructure anywhere: <a href="/countries/mali.html">Mali</a>, <a href="/countries/niger.html">Niger</a>, <a href="/countries/chad.html">Chad</a>, <a href="/countries/burkina-faso.html">Burkina Faso</a>, <a href="/countries/central-african-republic.html">the Central African Republic</a>, <a href="/countries/south-sudan.html">South Sudan</a>, <a href="/countries/ethiopia.html">Ethiopia</a>, <a href="/countries/uganda.html">Uganda</a>, <a href="/countries/rwanda.html">Rwanda</a>, <a href="/countries/burundi.html">Burundi</a>, <a href="/countries/zambia.html">Zambia</a>, <a href="/countries/zimbabwe.html">Zimbabwe</a>, <a href="/countries/malawi.html">Malawi</a>, <a href="/countries/botswana.html">Botswana</a>, <a href="/countries/lesotho.html">Lesotho</a> and <a href="/countries/eswatini.html">Eswatini</a>.</p>

<p><strong>Asia</strong> has twelve, including the whole of former Soviet Central Asia: <a href="/countries/kazakhstan.html">Kazakhstan</a>, <a href="/countries/uzbekistan.html">Uzbekistan</a>, <a href="/countries/turkmenistan.html">Turkmenistan</a>, <a href="/countries/kyrgyzstan.html">Kyrgyzstan</a>, <a href="/countries/tajikistan.html">Tajikistan</a>, <a href="/countries/afghanistan.html">Afghanistan</a>, <a href="/countries/mongolia.html">Mongolia</a>, <a href="/countries/nepal.html">Nepal</a>, <a href="/countries/bhutan.html">Bhutan</a>, <a href="/countries/laos.html">Laos</a>, <a href="/countries/armenia.html">Armenia</a> and <a href="/countries/azerbaijan.html">Azerbaijan</a>.</p>

<p><strong>South America</strong> has two — <a href="/countries/bolivia.html">Bolivia</a> and <a href="/countries/paraguay.html">Paraguay</a> — and <strong>North America and Oceania have none at all</strong>, which is itself a useful thing to know for a quiz.</p>

<h2>Doubly landlocked: only two</h2>

<p>A country is doubly landlocked if it has no coastline and every one of its neighbours is also landlocked — so you must cross at least two borders to reach the sea. Exactly two countries qualify.</p>

<p><a href="/countries/liechtenstein.html">Liechtenstein</a> sits between Switzerland and Austria, both landlocked. <a href="/countries/uzbekistan.html">Uzbekistan</a> is bordered by Kazakhstan, Kyrgyzstan, Tajikistan, Afghanistan and Turkmenistan, all landlocked.</p>

<p>Uzbekistan's case comes with an asterisk that is worth understanding rather than memorising: Kazakhstan and Turkmenistan both border the Caspian Sea. Whether that counts depends on whether the Caspian is a sea or a lake — a question with real legal consequences for oil rights, and one that has been argued for decades. Under the usual reading it is an enclosed lake with no outlet to the ocean, so Uzbekistan stays doubly landlocked.</p>

<h2>What it actually costs</h2>

<p>Sea freight is dramatically cheaper than road or rail per tonne-kilometre. A landlocked country's exports must cross at least one border before reaching a port, and that adds cost in several compounding ways: transit fees, customs delays at an additional frontier, and dependence on a neighbour's infrastructure and goodwill.</p>

<p>The dependence is the sharpest part. A landlocked country cannot unilaterally fix its access to world markets. If the transit neighbour has a border dispute, a war, a strike or simply a poorly maintained railway, the landlocked country absorbs the consequence without recourse. Ethiopia lost its entire coastline when Eritrea became independent in 1993, and its trade has depended on the port of Djibouti ever since.</p>

<p>The United Nations maintains a specific category — Landlocked Developing Countries — precisely because the combination of no coast and limited infrastructure produces a distinct and persistent disadvantage. Freight costs for these countries commonly run well above the global average as a share of import value.</p>

<h2>Why Europe's landlocked countries are rich anyway</h2>

<p>Switzerland, Austria and Luxembourg are all landlocked and all wealthy, which shows the handicap is about access rather than coastline as such.</p>

<p>Three things make the difference. Their neighbours are wealthy, stable and cooperative, so transit is routine rather than fraught. Europe has dense, well-maintained rail and road networks and navigable rivers — the Rhine and the Danube function as working freight corridors. And their economies lean toward high-value, low-bulk output: finance, pharmaceuticals, precision engineering. If your export weighs very little relative to its value, the cost of getting it to a port hardly matters.</p>

<p>Compare a country exporting copper ore or cotton, where transport is a large fraction of the delivered price, and the difference becomes obvious. Being landlocked is expensive in proportion to how heavy your exports are.</p>

<h2>The workarounds</h2>

<p>Countries have found various ways to soften the problem.</p>

<p><strong>River access.</strong> <a href="/countries/paraguay.html">Paraguay</a> reaches the Atlantic via the Paraguay and Paraná rivers and maintains a substantial river fleet. <a href="/countries/moldova.html">Moldova</a> has a few hundred metres of Danube frontage at Giurgiulești, enough for a working river port.</p>

<p><strong>Treaty rights.</strong> International law provides landlocked states a right of access to the sea and freedom of transit, though implementation depends on bilateral agreements.</p>

<p><strong>Leased port facilities.</strong> Several African landlocked countries operate dedicated terminals inside neighbouring ports, run under long-term agreement.</p>

<p>And then there is Bolivia, which lost its Pacific coastline to Chile in the War of the Pacific in 1879 and has never accepted it. It still maintains a navy — operating on Lake Titicaca and the country's rivers — and marks a Day of the Sea every year. It took the case to the International Court of Justice, which ruled in 2018 that Chile is under no obligation to negotiate sovereign access. The navy remains.</p>

<h2>Testing yourself</h2>

<p>Landlocked status is one of the more useful things to know about a country, because it constrains so much else — trade, politics, which neighbours matter most. The <a href="/game/country-quiz.html">country quiz</a> works from clues including continent and currency, and the <a href="/game/map-quiz.html">map quiz</a> puts the geography itself in front of you, which is the fastest way to notice which countries have no way out.</p>
`
  }
];
