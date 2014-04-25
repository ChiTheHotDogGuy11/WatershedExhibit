var infoPanelTexts = {
	// geothermal
	'geo_thermal': "Heat from the earth can be used as an energy source in many ways, from large and complex power stations to small and relatively simple pumping systems. This heat energy is known as geothermal energy. <br/> <br/> Geothermal heat pumps use the steady temperatures just underground to heat and cool buildings, cleanly and inexpensively.",
	'0price': "The initial costs of geothermal energy are high -- wells can cost $1 to $4 million each to drill, and installation of a home geothermal pump system can run as much as $30,000. ",
	'0saving': "Geothermal energy is considered renewable because the heat is continually replaced. The water that is removed is put right back into the ground after its heat is used. A home geothermal energy pump can cut energy bills by 30 to 40 percent and, and is expected to pay for itself within 5 to 10 years.",
	'solar_panel': "Solar energy is produced through the use of solar cells, also known as photovoltaic cells. Solar panels are only about 15 percent efficient. Today, solar energy provides two-tenths of 1 percent of the total energy consumed in the United States.",
	'3price': "$9600 for 25 solar panels to produce up to 850kwh/month (assuming 5 hours of sun/day)",
	'3saving': "25 solar panels will save approximately $68/month. Breakeven in 15-16 years with 25 panels",
	'rain_barrel': "A rainwater tank (sometimes called a rain barrel in North America, or a water butt in the UK) is a water tank used to collect and store rain water runoff, typically from rooftops via rain gutters. Collecting rainwater has numerous benefits apart from low-cost irrigation. Free of chlorine and sodium, naturally soft rainwater is superior for plants. Capturing roof runoff also lowers the risk of flooding and reduces the burden on storm sewers and local watersheds.",
	'1price': "$100 for the barrel and downspout fittings. A typical system consisting of one or two barrels and off-the-shelf parts such as spigots, downspout extensions, mesh screens, and soaker hoses costs between $35 and $600.",
	'1saving': "A rain barrel can lower water bills by about $35 a month in the summer. For as little as $100 for the barrel and downspout fittings, a rain-harvesting system can pay for itself in just a couple of seasons.",
	'2info' : 'nothing',
	'2price' : 'nothing',
	'2saving' : 'nothing...',
};

var featureNames = {
	'geo_thermal': "Geothermal Well",
	'rain_barrel': "Rain Barrel",
	'solar_panel': "Solar Panel",
};

var costs = {
	0: 29000,
	3: 9600,
	1: 100,
}

var savings = {
	0: 2100,
	3: 800,
	1: 100,
}

var MAX_BUDGET = 60;
var PINK = 'rgb(255, 102, 102)';

var GAMESTATE_PAUSED = 0;
var GAMESTATE_PLAYING = 1;
var GAMESTATE_DONE = 2;

var NUM_LEVELS = 3;