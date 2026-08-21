/**
 * blog.js — the blog posts.
 *
 * Editorially distinct from tools/lib/articles.js: the guides are about *how to
 * learn* this material (method), the blog is about the subject itself. Keeping
 * them separate is only worth it while both stay substantial — if a post here
 * ever reads as filler around a link to a quiz, delete it rather than pad it.
 *
 * Build-time only. Same shape as ARTICLES so both share one page template.
 */

export const POSTS = [
  {
    slug: 'countries-that-changed-their-names',
    title: 'Every country that has changed its name',
    metaTitle: 'Countries That Changed Their Names — And Why They Did',
    description:
      'Türkiye, Eswatini, Czechia, North Macedonia and dozens more. The four reasons countries rename themselves, and why some changes stuck instantly.',
    updated: '21 August 2026',
    summary:
      'Country names are not fixed. Around forty have changed since 1945, and the reasons fall into four fairly clean categories.',
    body: `
<p>A world map is a snapshot, not a permanent record. Around forty countries have changed their names since 1945, several within the last decade, and a few more have asked the world to stop translating the name they already had.</p>

<p>The changes are not random. They fall into four reasonably clean categories, and once you can see which is which, the individual cases stop being trivia and start being history.</p>

<h2>1. Independence</h2>

<p>The largest group by far. A colonial name is a name chosen by someone else, so shedding it is often among the first acts of a new state.</p>

<ul>
  <li><strong>Ceylon → <a href="/countries/sri-lanka">Sri Lanka</a></strong> (1972). Independent since 1948, but the British-era name lasted another 24 years until the country became a republic.</li>
  <li><strong>Gold Coast → <a href="/countries/ghana">Ghana</a></strong> (1957), named for the medieval Ghana Empire — which was actually located some distance to the north-west.</li>
  <li><strong>Bechuanaland → <a href="/countries/botswana">Botswana</a></strong> and <strong>Basutoland → <a href="/countries/lesotho">Lesotho</a></strong>, both 1966.</li>
  <li><strong>Dahomey → <a href="/countries/benin">Benin</a></strong> (1975), after the Bight of Benin rather than the Kingdom of Benin, which was in what is now Nigeria.</li>
  <li><strong>Upper Volta → <a href="/countries/burkina-faso">Burkina Faso</a></strong> (1984), a name assembled from two of the country's languages, roughly "land of upright people".</li>
  <li><strong>Rhodesia → <a href="/countries/zimbabwe">Zimbabwe</a></strong> (1980), replacing a name honouring Cecil Rhodes with one taken from the stone city of Great Zimbabwe.</li>
  <li><strong>South West Africa → <a href="/countries/namibia">Namibia</a></strong> (formally 1990), after the Namib Desert.</li>
</ul>

<p>The pattern is consistent: out goes the colonial administrator or the European geographic label, in comes something drawn from a pre-colonial polity, a language, or a landscape feature.</p>

<h2>2. A change of regime</h2>

<p>A new government sometimes wants a new name, and the name then carries a political charge that outlasts the government.</p>

<p><strong>Burma → <a href="/countries/myanmar">Myanmar</a></strong> (1989) is the sharpest example. The renaming was carried out by a military government that had seized power the previous year, and because many opposition groups rejected its legitimacy, they kept saying Burma. Decades later the choice of word is still read as a position. This site uses Myanmar, which is the name at the United Nations.</p>

<p><strong>Zaire → <a href="/countries/dr-congo">DR Congo</a></strong> (1997) ran the other way. Mobutu had renamed the country Zaire in 1971 as part of a campaign of "authenticity"; when his rule ended, the older name came back.</p>

<p><strong>Kampuchea → <a href="/countries/cambodia">Cambodia</a></strong> followed a similar arc through the 1970s and 80s, the name shifting with each change of government.</p>

<h2>3. Settling a dispute</h2>

<p>Two of the most recent changes were negotiated outcomes rather than unilateral decisions.</p>

<p><strong><a href="/countries/north-macedonia">North Macedonia</a></strong> (2019) ended one of the longest-running naming disputes in modern diplomacy. Greece objected to its neighbour using "Macedonia" alone, arguing it implied a claim on the Greek region of the same name, and blocked its NATO and EU accession for years. The Prespa Agreement added a single word and unlocked both.</p>

<p><strong><a href="/countries/eswatini">Eswatini</a></strong> (2018) was different in character: the king announced it on the 50th anniversary of independence, and one stated reason was that Swaziland was too often confused with Switzerland. The name was not new — eSwatini is simply the country's name in siSwati.</p>

<h2>4. "Stop translating our name"</h2>

<p>The subtlest category, and the one most often missed. Here the name itself does not change; what changes is the request that other languages use it as-is rather than substituting their own version.</p>

<ul>
  <li><strong><a href="/countries/ivory-coast">Côte d'Ivoire</a></strong> asked in 1986 that its name not be translated. English-language usage has only partly complied — this site uses Ivory Coast because that is what most English speakers search for, which is a compromise rather than a correct answer.</li>
  <li><strong><a href="/countries/cabo-verde">Cabo Verde</a></strong> made the same request in 2013, retiring Cape Verde in English.</li>
  <li><strong><a href="/countries/turkey">Türkiye</a></strong> asked the UN in 2022 to use the Turkish spelling in all languages. Adoption is ongoing and inconsistent; the quizzes here still say Turkey, again for search reasons.</li>
  <li><strong><a href="/countries/czechia">Czechia</a></strong> is a slightly different case. The Czech Republic registered Czechia as its official short name in 2016 — not a replacement but a shorter alternative, the way France is short for the French Republic.</li>
</ul>

<p>The <a href="/countries/netherlands">Netherlands</a> belongs here only loosely. In 2020 it stopped using "Holland" in official promotion, but that was a branding decision about a nickname: Holland is two provinces, not the country, and never was the country's name.</p>

<h2>The ones people expect and do not get</h2>

<p>A few countries have names that look like they should have changed and did not. <a href="/countries/india">India</a>'s constitution names it both India and Bharat, so both are already official; periodic proposals to drop the former have not been enacted. <a href="/countries/greece">Greece</a> calls itself Hellas at home and has never asked the world to follow. <a href="/countries/germany">Germany</a> answers to at least half a dozen unrelated names across Europe — Deutschland, Allemagne, Niemcy, Saksa, Tyskland — with no apparent objection to any of them.</p>

<h2>Why it matters for a quiz</h2>

<p>Any list of countries is a list as of a date. A geography quiz written in 2015 has Swaziland and the Czech Republic; one written in 1990 has Zaire, Burma and Upper Volta. If an answer here looks wrong to you, the most likely explanation is that you learned the map at a different moment rather than that either of us is mistaken.</p>

<p>The set used across this site is the current UN convention: 193 member states plus <a href="/countries/vatican-city">Vatican City</a> and <a href="/countries/palestine">Palestine</a>. If you want to see how well the modern list has actually stuck, the <a href="/game/country-quiz">country quiz</a> and the <a href="/game/name-the-countries/">name-them-all round</a> will find the gaps quickly.</p>
`
  },

  {
    slug: 'countries-that-dont-exist',
    title: 'The countries that do not exist',
    metaTitle: 'The Countries That Do Not Exist — Taiwan, Kosovo, Somaliland',
    description:
      'Taiwan, Kosovo, Somaliland and Northern Cyprus all govern territory and none is a UN member. What actually makes a country a country.',
    updated: '21 August 2026',
    summary:
      'Several places have a government, a population and firm borders, and still do not appear on most lists of countries. The reason is recognition, not geography.',
    body: `
<p>This site counts 195 countries. Every quiz, every list and every page follows that number. It is also, depending on how you ask the question, wrong — and the places it leaves out are among the more interesting on the map.</p>

<h2>Where 195 comes from</h2>

<p>It is 193 member states of the United Nations, plus two permanent observer states: <a href="/countries/vatican-city">Vatican City</a> and <a href="/countries/palestine">Palestine</a>. That is a convention, not a natural fact, and it is chosen here because it is the one most reference sources use, so answers stay consistent.</p>

<p>What it measures is <em>recognition</em>, not existence. A place can have a capital, a currency, a functioning parliament and firm control of its territory and still be absent from the list.</p>

<h2>The four criteria — and why they are not enough</h2>

<p>The usual starting point is the Montevideo Convention of 1933, which sets out four requirements for statehood: a permanent population, a defined territory, a government, and the capacity to enter into relations with other states.</p>

<p>Several unrecognised places meet all four comfortably. That is the crux of a long-running argument in international law between the <strong>declarative</strong> theory — a state exists once it meets the criteria, and recognition merely acknowledges the fact — and the <strong>constitutive</strong> theory, under which recognition by other states is what brings a state into being. Practice sits messily between the two, which is why the following cases are all genuinely contested rather than simply mistaken.</p>

<h2>Taiwan</h2>

<p>The largest and most consequential omission. Taiwan has around 23 million people, one of the world's larger economies, its own passport, currency, military and democratic elections. It held China's UN seat until 1971, when the General Assembly transferred recognition to Beijing.</p>

<p>Today a small number of states maintain formal diplomatic relations with it, while many others maintain substantial unofficial ones. Whether it constitutes a separate state is precisely the disputed question, which is why it does not appear as one here.</p>

<h2>Kosovo</h2>

<p>Declared independence from Serbia in 2008 and is recognised by roughly a hundred UN members — a large minority, but not enough for membership, which requires Security Council approval. Serbia does not recognise it. Neither do several EU states, which is why it appears on some European maps as part of Serbia and on others as separate.</p>

<p>Its practical position is unusually developed for a partially recognised state: it has its own country calling code, its own Olympic committee and a UEFA membership.</p>

<h2>Somaliland</h2>

<p>The strongest case for the declarative theory anywhere on the map. Somaliland declared independence from <a href="/countries/somalia">Somalia</a> in 1991 and has functioned separately ever since — its own elections, currency, police and borders, and a stability record that has frequently exceeded the state it left.</p>

<p>It has no formal recognition from any UN member. The African Union's general reluctance to reopen colonial-era borders is a large part of why, since a successful secession invites others.</p>

<h2>Northern Cyprus</h2>

<p>Declared in 1983 after the events of 1974 divided the island, and recognised by exactly one country: <a href="/countries/turkey">Turkey</a>. <a href="/countries/cyprus">Cyprus</a> as a whole is a UN member and an EU member, with the northern third outside the government's effective control.</p>

<p>Nicosia remains the last divided capital city in Europe, split by a UN buffer zone that has been in place for over fifty years.</p>

<h2>The post-Soviet cases</h2>

<p>Transnistria, a strip east of the Dniester, has been outside <a href="/countries/moldova">Moldova</a>'s control since 1992 and is recognised by no UN member. Abkhazia and South Ossetia, both claimed by <a href="/countries/georgia">Georgia</a>, are recognised by a handful. Artsakh — Nagorno-Karabakh — operated for three decades before dissolving in 2024, which is a reminder that this category can shrink as well as grow.</p>

<h2>Western Sahara</h2>

<p>The odd one out. The Sahrawi Arab Democratic Republic is recognised by dozens of states and is a full member of the African Union, while most of the territory it claims is administered by <a href="/countries/morocco">Morocco</a>. The UN still lists Western Sahara as a non-self-governing territory — the largest remaining item on a decolonisation list that is otherwise nearly complete.</p>

<h2>The ones that are nearly in</h2>

<p>The Cook Islands and Niue are self-governing in free association with New Zealand. Both conduct their own foreign relations and sign treaties in their own right, and both are recognised as states by a number of countries — they simply have not sought UN membership. By most functional tests they qualify more clearly than several places above.</p>

<h2>And the ones that are not</h2>

<p>Sealand, Liberland, Molossia and the rest of the micronation catalogue fail on population, territory and capacity simultaneously. They are usually best understood as art projects or legal arguments, and they are the reason "declared independence" on its own means very little.</p>

<h2>Why the count you see depends on who is counting</h2>

<p>The UN has 193 members. FIFA has 211, because football admits territories such as Gibraltar, the Faroe Islands and Puerto Rico. The International Olympic Committee sits at 206. Different bodies count for different purposes, and none of them is lying.</p>

<p>So when the <a href="/game/continent-quiz">continent quiz</a> or the <a href="/game/border-quiz">border quiz</a> gives an answer that seems to ignore a place you consider a country, this is why. The list is a convention applied consistently, which is the most any list can offer.</p>
`
  },

  {
    slug: 'how-borders-get-drawn',
    title: 'How borders get drawn',
    metaTitle: 'How Borders Get Drawn — Straight Lines, Rivers and Watersheds',
    description:
      'Why Africa has straight borders and Europe does not, what happens when a border river moves, and the five-week line that divided India and Pakistan.',
    updated: '21 August 2026',
    summary:
      'Borders come in recognisable types, and the type usually tells you who drew it, when, and whether the people living there were consulted.',
    body: `
<p>Look at a world map for long enough and the borders start sorting themselves into kinds. Some wander; some run dead straight for hundreds of kilometres. Some follow a river or a mountain crest; others cut across both without acknowledgement. The difference is rarely aesthetic. It usually tells you who drew the line and how much they knew about the ground.</p>

<h2>Borders that grew</h2>

<p>Most European borders are what geographers call <strong>subsequent</strong> boundaries: they were settled after the population was already there, and they wander because they follow something real — a language boundary, an old duchy, the result of a particular war.</p>

<p>The <a href="/countries/portugal">Portugal</a>–<a href="/countries/spain">Spain</a> border is the extreme case of stability, largely fixed since the Treaty of Alcañices in 1297 and among the oldest continuously recognised borders in the world. Its irregularity is the evidence of its age: seven centuries of local settlement, each bend recording something.</p>

<h2>Borders that were imposed</h2>

<p>Straight lines are the signature of a boundary drawn at a distance, usually on a map rather than on the ground, and usually before the drawers had surveyed what was there. Geographers call these <strong>superimposed</strong> boundaries.</p>

<p>Africa is the obvious case. The Berlin Conference of 1884–85 did not carve up the continent single-handedly — that is a common simplification — but it did formalise the rules by which European powers claimed territory, and the borders that resulted were largely negotiated in Europe. The results are visible: look at the <a href="/countries/egypt">Egypt</a>–<a href="/countries/libya">Libya</a>–<a href="/countries/sudan">Sudan</a> corner, or <a href="/countries/mali">Mali</a>'s northern edge, and you are looking at lines of latitude and longitude.</p>

<p>North America has its own. The <a href="/countries/united-states">United States</a>–<a href="/countries/canada">Canada</a> border follows the 49th parallel for roughly 2,000 kilometres, agreed in 1818 and extended west in 1846. It is the longest straight-ish international border in the world, and it too was drawn by negotiators a long way from the prairie.</p>

<p>The most consequential single act of border-drawing in the twentieth century was probably the <strong>Radcliffe Line</strong> of 1947, which divided India and Pakistan. Cyril Radcliffe, a British lawyer with no prior experience of the subcontinent, was given about five weeks. The line displaced many millions of people and its consequences are still being worked through.</p>

<h2>Borders that follow water</h2>

<p>Rivers look like ideal boundaries: visible, unambiguous, already there. They are also the least stable option available, because rivers move.</p>

<p>The Rio Grande between the United States and <a href="/countries/mexico">Mexico</a> shifted enough over a century to create the Chamizal dispute, an argument over several hundred hectares near El Paso that took from the 1860s until 1963 to settle. The general fix is legal rather than physical: treaties now usually fix the boundary at the river's position on a particular date, so that the border stays put when the water does not.</p>

<p>Rivers also make poor dividers in a more basic sense. A river valley is typically a single community — the people on both banks trade with each other and are often the same people. A border along a river therefore tends to cut through a population rather than between two.</p>

<h2>Borders that follow high ground</h2>

<p>Watersheds are more stable. The <a href="/countries/chile">Chile</a>–<a href="/countries/argentina">Argentina</a> border runs roughly along the Andean crest for more than 5,000 kilometres, the third longest international border in the world, and mountains have the useful property of staying where they are.</p>

<p>They are not free of ambiguity either. "The highest peaks" and "the line dividing the waters" are different lines in places, which is precisely what the two countries argued about for much of the twentieth century.</p>

<h2>Borders that stopped meaning anything</h2>

<p>A <strong>relict</strong> boundary is one that no longer has legal force but is still visible in the landscape or the data — the old inner-German border still shows up in forest patterns and election maps decades after it ceased to exist. Cyprus has an active version: the Green Line has divided the island since 1974 without ever becoming an international border.</p>

<h2>The borders that are not on land at all</h2>

<p>Most of the world's boundary length is maritime, and it is drawn by formula rather than by negotiation. The UN Convention on the Law of the Sea gives a coastal state a territorial sea of 12 nautical miles, where it is essentially sovereign, and an exclusive economic zone reaching 200 nautical miles, where it controls fishing and seabed resources but not navigation.</p>

<p>The consequences are counter-intuitive. Because an EEZ is generated by any piece of land, however small, a scattering of tiny islands produces an enormous maritime territory. <a href="/countries/france">France</a> has the largest EEZ of any country — larger than its land area many times over — almost entirely because of small Pacific and Indian Ocean holdings. The <a href="/countries/united-states">United States</a> is second for the same reason.</p>

<p>It also explains why uninhabitable rocks are worth arguing over. A reef that generates 200 nautical miles of fishing and drilling rights in every direction is not a rock, economically speaking, which is the entire substance of several disputes in the South China Sea.</p>

<h2>The borders that are frozen by treaty</h2>

<p>Antarctica is the one place where border-drawing was deliberately stopped. Seven countries had made territorial claims, several of them overlapping, when the Antarctic Treaty came into force in 1961. Rather than resolving them, the treaty suspended them: existing claims are neither recognised nor renounced, and no new ones may be made.</p>

<p>The result is the only continent with lines on some maps and no borders in practice — which is why <a href="/continents/antarctica/">Antarctica</a> has no countries on any list, including this site's.</p>

<h2>Why the type matters</h2>

<p>There is a well-known and much-debated argument in political geography that superimposed borders correlate with later instability, because a line drawn without reference to who lives where is more likely to split one group across two states or force two into one. The correlation is easier to demonstrate than the mechanism, and plenty of straight-line borders are entirely peaceful. But it is a reasonable first guess at why some regions inherited harder problems than others.</p>

<p>None of this is visible from a list of country names, which is the argument for learning borders as relationships rather than as facts. The <a href="/game/border-quiz">border quiz</a> asks who neighbours whom; the <a href="/game/map-quiz">map quiz</a> puts the shapes in front of you. Both teach the thing a list cannot.</p>
`
  },

  {
    slug: 'the-worlds-strangest-borders',
    title: 'The world’s strangest borders',
    metaTitle: 'The World’s Strangest Borders — Enclaves, Exclaves and No Man’s Land',
    description:
      'A town split into 30 pieces, a US village reachable only through Canada, a border across the summit of Everest, and a patch of desert nobody wants.',
    updated: '21 August 2026',
    summary:
      'Some borders are strange because of history, some because of bad arithmetic, and one because two countries would each rather have less land.',
    body: `
<p>Most borders are a line between two countries. A surprising number are not, and the exceptions are where the map stops being an abstraction.</p>

<h2>The town in thirty pieces</h2>

<p>Baarle-Hertog and Baarle-Nassau are one town on the <a href="/countries/belgium">Belgium</a>–<a href="/countries/netherlands">Netherlands</a> border, divided into around thirty separate parcels. Belgian enclaves sit inside Dutch territory, and several Dutch counter-enclaves sit inside those.</p>

<p>The cause is medieval: a long series of land sales and swaps between the Lord of Breda and the Duke of Brabant from the twelfth century onward, never rationalised. The border is marked in the pavement with crosses and the house numbers carry small flags, because which country a building is in depends on where its front door sits.</p>

<h2>The enclaves that were finally tidied up</h2>

<p>Until 2015, the <a href="/countries/india">India</a>–<a href="/countries/bangladesh">Bangladesh</a> border contained 198 enclaves, including Dahala Khagrabari — an Indian parcel inside a Bangladeshi enclave inside Indian territory inside Bangladesh. It was the world's only third-order enclave.</p>

<p>Tens of thousands of people lived in these fragments, in many cases with poor access to the services of either state. A land-swap agreement in 2015 exchanged them and let residents choose their citizenship, ending what was probably the most tangled border arrangement on Earth.</p>

<h2>Countries inside countries</h2>

<p>Three states are completely surrounded by a single other country: <a href="/countries/vatican-city">Vatican City</a> and <a href="/countries/san-marino">San Marino</a>, both inside <a href="/countries/italy">Italy</a>, and <a href="/countries/lesotho">Lesotho</a>, entirely inside <a href="/countries/south-africa">South Africa</a>.</p>

<p>Lesotho is the outlier of the three by a wide margin — about 30,000 square kilometres of mountains, and the only country in the world with all of its territory above 1,000 metres.</p>

<h2>Places you cannot reach from home</h2>

<p>Point Roberts, Washington, sits at the tip of a peninsula that extends south of the 49th parallel. It is American, has around a thousand residents, and can only be reached overland by driving through <a href="/countries/canada">Canada</a>. Children cross the border twice a day to get to school.</p>

<p>Llívia is a Spanish town of about 1,500 people inside <a href="/countries/france">France</a>, left over from the Treaty of the Pyrenees in 1659, which transferred a list of villages to France and did not include Llívia, because it was classed as a town.</p>

<p>Campione d'Italia is Italian, surrounded by <a href="/countries/switzerland">Switzerland</a>, and used the Swiss franc for most of its modern history. Büsingen am Hochrhein is German, also surrounded by Switzerland, and is in the Swiss customs area.</p>

<h2>Exclaves at national scale</h2>

<p>Kaliningrad is <a href="/countries/russia">Russian</a> territory on the Baltic, separated from the rest of Russia by <a href="/countries/lithuania">Lithuania</a> and <a href="/countries/poland">Poland</a>. Nakhchivan is <a href="/countries/azerbaijan">Azerbaijani</a>, cut off from the rest of the country by <a href="/countries/armenia">Armenia</a> — which is why Azerbaijan's border with Turkey exists at all. Cabinda, <a href="/countries/angola">Angola</a>'s oil-producing province, is separated from Angola by DR Congo.</p>

<p>The <a href="/countries/namibia">Namibian</a> Caprivi Strip is a different kind of oddity: a narrow finger of land reaching 450 kilometres east, drawn in 1890 to give German South West Africa access to the Zambezi. The access turned out to be useless, because the river is not navigable to the sea from there.</p>

<p><a href="/countries/afghanistan">Afghanistan</a>'s Wakhan Corridor was drawn for a comparable reason and worked better: a buffer strip agreed so that the Russian and British empires would not share a border.</p>

<h2>The land nobody claims</h2>

<p>Bir Tawil is roughly 2,000 square kilometres of desert between <a href="/countries/egypt">Egypt</a> and <a href="/countries/sudan">Sudan</a>, and it is claimed by neither. The reason is a rare piece of border logic working in reverse: there are two competing boundary lines between the countries, and each state prefers the line that gives it the larger and more valuable Hala'ib Triangle nearby. Claiming Bir Tawil would mean endorsing the line that loses them the Triangle. So both decline, and Bir Tawil is one of the very few genuinely unclaimed pieces of habitable land on Earth.</p>

<h2>Borders that are not lines</h2>

<p>The Korean Demilitarized Zone is a strip about four kilometres wide and 250 long, one of the most heavily fortified places in the world and, because almost nobody has entered it in seventy years, an accidental nature reserve.</p>

<p>The Cyprus Green Line runs through the middle of Nicosia, the last divided capital in Europe. And the <a href="/countries/nepal">Nepal</a>–China border runs directly over the summit of Everest, so the highest point on Earth is a border marker.</p>

<h2>The border that moves every year</h2>

<p>High in the Alps, the <a href="/countries/italy">Italy</a>–<a href="/countries/switzerland">Switzerland</a> border near the Matterhorn is defined by the watershed on the Theodul Glacier — the line dividing where meltwater flows. As the glacier has thinned, that line has shifted, and with it the border.</p>

<p>The movement is real enough to matter: a mountain refuge near the Testa Grigia has ended up straddling a boundary that was unambiguous when it was built, and the two countries have had to negotiate the position rather than simply survey it. It is a rare case of climate change redrawing a political map directly rather than through its consequences.</p>

<h2>The two islands a day apart</h2>

<p>Big Diomede is Russian and Little Diomede is American. They are about 3.8 kilometres apart in the Bering Strait, with the international date line between them. Standing on one you can see the other, roughly 21 hours away by the calendar.</p>

<p>If any of this makes you want to check where these places actually are, the <a href="/game/map-quiz">map quiz</a> is the fastest way to find out how much of the map you can place — and the <a href="/guides/landlocked-countries">landlocked countries guide</a> covers the related question of who has no coastline at all.</p>
`
  },

  {
    slug: 'why-time-zones-are-strange',
    title: 'Why time zones are stranger than you think',
    metaTitle: 'Why Time Zones Are Strange — China, Nepal and the Date Line',
    description:
      'China runs on one time zone across five. Nepal is 45 minutes off. Kiribati moved the date line. Why clock time and solar time stopped agreeing.',
    updated: '21 August 2026',
    summary:
      'Time zones look like a tidy grid of 24 slices. Almost nothing about the real map is tidy, and every exception has a reason.',
    body: `
<p>The idea is simple enough: the Earth turns once a day, so divide it into 24 slices an hour apart. The actual map of world time is nothing like that, because time zones are political objects rather than astronomical ones. Every deviation was somebody's decision.</p>

<h2>Where the grid came from</h2>

<p>Before railways, every town kept its own solar noon and nobody minded, because nothing moved fast enough for the difference to matter. Trains broke that: a timetable needs two distant places to agree what time it is.</p>

<p>Standard time zones were proposed in the 1870s — the Canadian engineer Sandford Fleming was among the most persistent advocates — and the International Meridian Conference in Washington in 1884 established Greenwich as the prime meridian. Adoption then took decades, country by country, and several never adopted the tidy version at all.</p>

<h2>China: one zone across five</h2>

<p>The most dramatic deviation on the map. <a href="/countries/china">China</a> spans roughly 60 degrees of longitude — geographically five zones — and runs the entire country on a single one, UTC+8, set to Beijing.</p>

<p>The practical effect is severe at the western end. In Kashgar in Xinjiang, some 3,000 kilometres from Beijing, the sun in midsummer can still be up well past 10pm by the official clock. Local unofficial timekeeping runs two hours behind the national standard, so in practice two times circulate and you have to know which one an appointment refers to.</p>

<h2>Russia: eleven zones and a reorganisation</h2>

<p><a href="/countries/russia">Russia</a> takes the opposite approach, with eleven zones — more than any other country. It has also changed its mind repeatedly: zones were consolidated in 2010, partly restored in 2014, and permanent "winter time" was adopted in 2014 after a brief and unpopular experiment with permanent summer time.</p>

<h2>The countries that are not on the hour</h2>

<p><a href="/countries/india">India</a> runs on UTC+5:30, a single half-hour offset for the whole country, chosen as a compromise between its eastern and western extremes. <a href="/countries/sri-lanka">Sri Lanka</a> uses the same. <a href="/countries/iran">Iran</a> is at +3:30, <a href="/countries/afghanistan">Afghanistan</a> at +4:30, and Myanmar at +6:30.</p>

<p><a href="/countries/nepal">Nepal</a> goes further and is the only country in the world on a 45-minute offset, UTC+5:45 — set so that the meridian through a mountain near Kathmandu defines national noon, and distinct from India's by exactly a quarter of an hour.</p>

<p>Two more 45-minute zones exist below national level: the Chatham Islands in New Zealand at +12:45, and a part of Western Australia that keeps +8:45 unofficially.</p>

<h2>Spain's inherited hour</h2>

<p><a href="/countries/spain">Spain</a> sits almost entirely west of Greenwich and keeps Central European Time, an hour ahead of the sun. The change was made in 1940, aligning Spanish clocks with Berlin, and was never reversed.</p>

<p>The consequence is a national schedule that looks strange from outside and makes sense once you know: late lunches, late dinners and late television, because the clock is running roughly an hour ahead of daylight. The same logic applies in France, which also sits mostly west of the meridian it does not use.</p>

<h2>Moving the date line</h2>

<p>The international date line is not a straight line and not fixed. It bends around territories that would rather not be split by it, and it has been moved deliberately at least twice in living memory.</p>

<p><a href="/countries/kiribati">Kiribati</a> spans a huge stretch of the Pacific and used to have the line running through the middle of it, so that two parts of the same country were on different days — an obvious administrative nuisance. In 1995 Kiribati shifted the line east to enclose all of its islands. A side effect was that its Line Islands, at UTC+14, became the first inhabited place to enter each new day, which the country used to considerable effect at the turn of the millennium.</p>

<p><a href="/countries/samoa">Samoa</a> did the reverse in 2011, jumping westward across the line to align its working week with Australia and New Zealand rather than the United States. It skipped 30 December 2011 entirely — a date that simply did not occur there.</p>

<h2>France has the most zones</h2>

<p>Counting overseas departments and territories, <a href="/countries/france">France</a> spans twelve time zones, more than any other country — a consequence of holding territory in the Caribbean, the Indian Ocean, the Pacific and South America.</p>

<h2>Antarctica, where the rules break down</h2>

<p>At the South Pole every line of longitude converges, so solar time is meaningless. Research stations instead use whatever suits them, usually the time zone of their supply line: the Amundsen–Scott station at the pole runs on New Zealand time, because that is where its flights come from.</p>

<h2>And the smaller oddities</h2>

<p>Newfoundland uses UTC−3:30, a half-hour offset from the rest of Atlantic Canada. Arizona does not observe daylight saving, except that the Navajo Nation within it does, while the Hopi Reservation within that does not — producing a small area you can drive through and change clock convention three times.</p>

<p>None of this is on a standard world map, which is part of why time zones are such a good demonstration that political geography and physical geography are different subjects. If you want to test the physical half, the <a href="/game/map-quiz">map quiz</a> and the <a href="/guides/map-projections-explained">guide to map projections</a> are the places to start.</p>
`
  }
];
